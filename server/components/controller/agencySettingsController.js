const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const AgencyRole = require('../models/agencyRoleModel');
const AgencyMembership = require('../models/agencyMembershipModel');
const RoleMenu = require('../models/roleMenuModel');
const MembershipMenu = require('../models/membershipMenuModel');
const AuditLog = require('../models/auditLogModel');
const { HTTP_STATUS } = require('../config/constants');
const { SALT } = require('../config/config');
const { AppError } = require('../middleware/errorHandler');
const { ALL_MENUS, LOCKED, ADMIN_ROLE, NEW_ROLE_MENUS, PARTICIPANT_ROLE, effectiveMenus, fullName } = require('../utils/workspace');

/**
 * Agency settings: users and roles of the signed-in administrator's agency.
 * Every handler runs after `agencyAdmin`, so request.agency = { agencyId, membershipId, userId }.
 */

const ACCESS = ['all_records', 'assigned_activities', 'assigned_sessions'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Temporary password: 12 characters without look-alikes (no 0/O, 1/l/I). */
function tempPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    return Array.from({ length: 12 }, () => chars[crypto.randomInt(chars.length)]).join('');
}

/** Turns a route/body id into a whole number, or refuses the request. */
function toId(value, message = 'Not found') {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) throw new AppError(message, HTTP_STATUS.NOT_FOUND);
    return id;
}

function audit(ctx, action, targetType, targetLabel, detail) {
    return AuditLog.create({
        agency_id: ctx.agencyId,
        action,
        target_type: targetType,
        target_label: targetLabel,
        detail: detail ?? null,
        created_by: ctx.userId,
    });
}

/** Console roles of the agency (the Participant role belongs to the mobile app). */
async function consoleRoles(agencyId) {
    const roles = await AgencyRole.find({ agency_id: agencyId });
    return roles.filter((r) => r.name !== PARTICIPANT_ROLE);
}

/** A console role of this agency, or 404. */
async function findRole(agencyId, id, message = 'Role not found') {
    const role = await AgencyRole.findOne({ id: toId(id, message), agency_id: agencyId });
    if (!role || role.name === PARTICIPANT_ROLE) throw new AppError(message, HTTP_STATUS.NOT_FOUND);
    return role;
}

/** The Administrator role is fixed. */
async function editableRole(agencyId, id) {
    const role = await findRole(agencyId, id);
    if (role.name === ADMIN_ROLE) throw new AppError('The Agency Administrator role cannot be changed.', HTTP_STATUS.FORBIDDEN);
    return role;
}

const byKey = (rows, key) => rows.reduce((map, row) => {
    (map[row[key]] ??= []).push(row);
    return map;
}, {});

/* ── roles ───────────────────────────────────────────────────────────── */

async function loadRoles(agencyId) {
    const roles = await consoleRoles(agencyId);
    const menusByRole = byKey(await RoleMenu.find({ agency_id: agencyId }), 'role_id');
    const memberships = await AgencyMembership.find({ agency_id: agencyId });
    const usersByRole = byKey(memberships, 'role_id');

    roles.sort((a, b) => (b.is_system - a.is_system) || (new Date(a.created_at) - new Date(b.created_at)) || a.name.localeCompare(b.name));

    return roles.map((r) => ({
        id: r.id,
        name: r.name,
        access: r.data_access,
        isSystem: !!r.is_system,
        users: (usersByRole[r.id] ?? []).length,
        updated: r.updated_at ?? r.created_at,
        menus: r.name === ADMIN_ROLE
            ? ALL_MENUS
            : ALL_MENUS.filter((k) => LOCKED.includes(k) || (menusByRole[r.id] ?? []).some((m) => m.menu_key === k)),
    }));
}

async function replaceRoleMenus(ctx, roleId, keys) {
    await RoleMenu.deleteMany({ role_id: roleId });
    if (keys.length) {
        await RoleMenu.insertMany(keys.map((menu_key) => ({
            agency_id: ctx.agencyId, role_id: roleId, menu_key, created_by: ctx.userId,
        })));
    }
}

/* ── users ───────────────────────────────────────────────────────────── */

async function loadUsers(agencyId) {
    const roles = await consoleRoles(agencyId);
    const roleById = Object.fromEntries(roles.map((r) => [r.id, r]));
    const memberships = (await AgencyMembership.find({ agency_id: agencyId }, { sort: { created_at: 1 } }))
        .filter((m) => roleById[m.role_id]);
    if (!memberships.length) return [];

    const people = await User.find({ id: [...new Set(memberships.map((m) => m.user_id))] });
    const userById = Object.fromEntries(people.map((u) => [u.id, u]));
    const menusByRole = byKey(await RoleMenu.find({ agency_id: agencyId }), 'role_id');
    const overridesByMembership = byKey(await MembershipMenu.find({ agency_id: agencyId }), 'membership_id');

    return memberships.filter((m) => userById[m.user_id]).map((m) => {
        const u = userById[m.user_id];
        const role = roleById[m.role_id];
        const menuOverride = Object.fromEntries((overridesByMembership[m.id] ?? []).map((o) => [o.menu_key, !!o.is_enabled]));
        return {
            id: m.id,
            name: fullName(u),
            email: u.email,
            role: role.name,
            roleId: role.id,
            status: m.status === 'suspended' ? 'Suspended' : u.last_sign_in_at ? 'Active' : 'Invited',
            updated: m.updated_at ?? m.created_at,
            menuOverride,
            menus: effectiveMenus(role.name, (menusByRole[role.id] ?? []).map((x) => x.menu_key), menuOverride),
        };
    });
}

/** A console member of this agency. `notSelf` is the message used when it is the signed-in admin. */
async function findMember(ctx, id, { notSelf } = {}) {
    const membership = await AgencyMembership.findOne({ id: toId(id, 'User not found'), agency_id: ctx.agencyId });
    if (!membership) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    const role = await AgencyRole.findById(membership.role_id);
    if (!role || role.name === PARTICIPANT_ROLE) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    if (notSelf && membership.user_id === ctx.userId) throw new AppError(notSelf, HTTP_STATUS.FORBIDDEN);
    const user = await User.findById(membership.user_id);
    return { membership, role, user };
}

/** True when this membership is the only active administrator left. */
async function isLastAdmin(ctx, membership, role) {
    if (role.name !== ADMIN_ROLE) return false;
    const others = await AgencyMembership.countDocuments({ agency_id: ctx.agencyId, role_id: role.id, status: 'active' });
    return others - (membership.status === 'active' ? 1 : 0) <= 0;
}

const AgencySettingsController = {

    // GET /api/agency/roles
    getRoles: async (request, response, next) => {
        try {
            response.status(HTTP_STATUS.OK).json({ roles: await loadRoles(request.agency.agencyId) });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/agency/roles  { name, access }
    createRole: async (request, response, next) => {
        try {
            const ctx = request.agency;
            const name = String(request.body?.name ?? '').trim();
            const access = String(request.body?.access ?? '');

            if (!name || name.length > 100) throw new AppError('Give the role a name (up to 100 characters).', HTTP_STATUS.BAD_REQUEST);
            if (!ACCESS.includes(access)) throw new AppError('Choose what data this role can see.', HTTP_STATUS.BAD_REQUEST);
            if (name.toLowerCase() === PARTICIPANT_ROLE.toLowerCase()) throw new AppError('“Participant” is reserved for the mobile app.', HTTP_STATUS.BAD_REQUEST);
            if (await AgencyRole.exists({ agency_id: ctx.agencyId, name })) throw new AppError('A role with this name already exists.', HTTP_STATUS.CONFLICT);

            const role = await AgencyRole.create({ agency_id: ctx.agencyId, name, data_access: access, is_system: false, created_by: ctx.userId });
            await replaceRoleMenus(ctx, role.id, NEW_ROLE_MENUS);
            await audit(ctx, 'role.created', 'role', name, `Data access: ${access}`);

            response.status(HTTP_STATUS.CREATED).json({ roles: await loadRoles(ctx.agencyId) });
        } catch (error) {
            next(error);
        }
    },

    // PATCH /api/agency/roles/:id  { access }
    updateRoleAccess: async (request, response, next) => {
        try {
            const ctx = request.agency;
            const role = await editableRole(ctx.agencyId, request.params.id);
            const access = String(request.body?.access ?? '');
            if (!ACCESS.includes(access)) throw new AppError('Choose what data this role can see.', HTTP_STATUS.BAD_REQUEST);

            await AgencyRole.findByIdAndUpdate(role.id, { data_access: access, updated_by: ctx.userId });
            await audit(ctx, 'role.access_changed', 'role', role.name, `Data access: ${access}`);

            response.status(HTTP_STATUS.OK).json({ roles: await loadRoles(ctx.agencyId) });
        } catch (error) {
            next(error);
        }
    },

    // PUT /api/agency/roles/:id/menus  { menus: ['calendar', ...] }  - replaces the role's default menus
    setRoleMenus: async (request, response, next) => {
        try {
            const ctx = request.agency;
            const role = await editableRole(ctx.agencyId, request.params.id);
            const wanted = request.body?.menus;
            if (!Array.isArray(wanted) || wanted.some((k) => !ALL_MENUS.includes(k))) throw new AppError('Unknown menu.', HTTP_STATUS.BAD_REQUEST);

            const keys = [...new Set([...LOCKED, ...wanted])];
            await replaceRoleMenus(ctx, role.id, keys);
            await AgencyRole.findByIdAndUpdate(role.id, { updated_by: ctx.userId });
            await audit(ctx, 'role.menus_changed', 'role', role.name, `Default menus: ${keys.join(', ')}`);

            response.status(HTTP_STATUS.OK).json({ roles: await loadRoles(ctx.agencyId) });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/agency/users
    getUsers: async (request, response, next) => {
        try {
            response.status(HTTP_STATUS.OK).json({ users: await loadUsers(request.agency.agencyId) });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/agency/users  { firstName, lastName, email, roleId }
     * A new person gets a temporary password (shown once) and must choose their own at first sign-in.
     * Someone who already has an account (for example in another agency) is just added and keeps their password.
     */
    addUser: async (request, response, next) => {
        try {
            const ctx = request.agency;
            const firstName = String(request.body?.firstName ?? '').trim();
            const lastName = String(request.body?.lastName ?? '').trim();
            const email = String(request.body?.email ?? '').trim().toLowerCase();

            if (!firstName || !lastName) throw new AppError('Enter their first and last name.', HTTP_STATUS.BAD_REQUEST);
            if (!EMAIL_PATTERN.test(email)) throw new AppError('Enter a valid email address.', HTTP_STATUS.BAD_REQUEST);
            const role = await findRole(ctx.agencyId, request.body?.roleId, 'Choose a role.');

            let user = await User.findByEmail(email);
            let password = null;
            if (user) {
                if (user.is_super_admin) throw new AppError('This email belongs to a platform account.', HTTP_STATUS.CONFLICT);
                if (await AgencyMembership.exists({ agency_id: ctx.agencyId, user_id: user.id })) {
                    throw new AppError('This person already has an account in your agency.', HTTP_STATUS.CONFLICT);
                }
            } else {
                password = tempPassword();
                user = await User.create({
                    email,
                    password: await bcrypt.hash(password, SALT),
                    first_name: firstName,
                    last_name: lastName,
                    status: 'active',
                    is_super_admin: false,
                    must_reset_password: true,
                });
            }

            const membership = await AgencyMembership.create({
                agency_id: ctx.agencyId,
                user_id: user.id,
                role_id: role.id,
                status: 'active',
                joined_at: new Date(),
                created_by: ctx.userId,
            });
            await audit(ctx, 'user.added', 'user', email, `Role: ${role.name}${password ? '' : ' (existing account)'}`);

            const users = await loadUsers(ctx.agencyId);
            response.status(HTTP_STATUS.CREATED).json({
                user: users.find((u) => u.id === membership.id),
                users,
                tempPassword: password,
            });
        } catch (error) {
            next(error);
        }
    },

    // PATCH /api/agency/users/:id  { roleId } or { status: 'active' | 'suspended' }   (:id is the membership id)
    updateUser: async (request, response, next) => {
        try {
            const ctx = request.agency;
            const { membership, role, user } = await findMember(ctx, request.params.id, { notSelf: 'You cannot change your own role or access here.' });
            const body = request.body || {};

            if (body.roleId !== undefined) {
                const newRole = await findRole(ctx.agencyId, body.roleId, 'Choose a role.');
                if (newRole.id !== role.id) {
                    if (await isLastAdmin(ctx, membership, role)) throw new AppError('Your agency needs at least one Agency Administrator.', HTTP_STATUS.CONFLICT);
                    await AgencyMembership.findByIdAndUpdate(membership.id, { role_id: newRole.id, updated_by: ctx.userId });
                    await MembershipMenu.deleteMany({ membership_id: membership.id });   // a new role starts from its own defaults
                    await audit(ctx, 'user.role_changed', 'user', user?.email ?? `membership ${membership.id}`, `${role.name} to ${newRole.name}`);
                }
            } else if (body.status !== undefined) {
                const status = body.status;
                if (!['active', 'suspended'].includes(status)) throw new AppError('Unknown status.', HTTP_STATUS.BAD_REQUEST);
                if (status === 'suspended' && (await isLastAdmin(ctx, membership, role))) {
                    throw new AppError('Your agency needs at least one active Agency Administrator.', HTTP_STATUS.CONFLICT);
                }
                await AgencyMembership.findByIdAndUpdate(membership.id, { status, updated_by: ctx.userId });
                await audit(ctx, status === 'suspended' ? 'user.suspended' : 'user.reactivated', 'user', user?.email ?? `membership ${membership.id}`, null);
            } else {
                throw new AppError('Nothing to change.', HTTP_STATUS.BAD_REQUEST);
            }

            response.status(HTTP_STATUS.OK).json({ users: await loadUsers(ctx.agencyId) });
        } catch (error) {
            next(error);
        }
    },

    // PUT /api/agency/users/:id/menus  { override: { calendar: true, budget: false } }  - only differences from the role defaults are kept
    setUserMenus: async (request, response, next) => {
        try {
            const ctx = request.agency;
            const { membership, role, user } = await findMember(ctx, request.params.id);
            if (role.name === ADMIN_ROLE) throw new AppError('Agency Administrators always see every menu.', HTTP_STATUS.BAD_REQUEST);

            const override = request.body?.override;
            if (!override || typeof override !== 'object' || Array.isArray(override)) throw new AppError('Send the menu changes.', HTTP_STATUS.BAD_REQUEST);
            if (Object.keys(override).some((k) => !ALL_MENUS.includes(k) || typeof override[k] !== 'boolean')) throw new AppError('Unknown menu.', HTTP_STATUS.BAD_REQUEST);

            const roleMenus = await RoleMenu.find({ role_id: role.id });
            const base = new Set([...LOCKED, ...roleMenus.map((m) => m.menu_key)]);
            const changes = Object.entries(override).filter(([k, on]) => !LOCKED.includes(k) && on !== base.has(k));

            await MembershipMenu.deleteMany({ membership_id: membership.id });
            if (changes.length) {
                await MembershipMenu.insertMany(changes.map(([menu_key, on]) => ({
                    agency_id: ctx.agencyId, membership_id: membership.id, menu_key, is_enabled: on, created_by: ctx.userId,
                })));
            }
            await AgencyMembership.findByIdAndUpdate(membership.id, { updated_by: ctx.userId });
            await audit(ctx, 'user.menus_changed', 'user', user?.email ?? `membership ${membership.id}`,
                changes.length ? changes.map(([k, on]) => `${on ? '+' : '-'}${k}`).join(' ') : 'Reset to role defaults');

            response.status(HTTP_STATUS.OK).json({ users: await loadUsers(ctx.agencyId) });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = AgencySettingsController;
