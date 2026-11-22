const AgencyMembership = require('../models/agencyMembershipModel');
const AgencyRole = require('../models/agencyRoleModel');
const Agency = require('../models/agencyModel');
const RoleMenu = require('../models/roleMenuModel');
const MembershipMenu = require('../models/membershipMenuModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

/**
 * Menus of the agency console (same keys as client/src/lib/menus.js).
 *   role defaults (role_menu) -> per-person changes (membership_menu)
 * Agency Administrators and the Super Admin always get every menu, and nobody can lose the Dashboard.
 */
const ALL_MENUS = ['dashboard', 'calendar', 'activities', 'participants', 'budget', 'reports', 'messaging', 'about', 'settings'];
const LOCKED = ['dashboard'];
const ADMIN_ROLE = 'Agency Administrator';
const NEW_ROLE_MENUS = ['dashboard', 'activities', 'messaging', 'about'];
const SUPER_ADMIN = 'Super Admin';
const PARTICIPANT_ROLE = 'Participant';

function effectiveMenus(roleName, roleKeys, override = {}) {
    if (roleName === ADMIN_ROLE) return ALL_MENUS;
    const set = new Set([...LOCKED, ...roleKeys]);
    for (const [key, on] of Object.entries(override)) {
        if (LOCKED.includes(key) || !ALL_MENUS.includes(key)) continue;
        if (on) set.add(key); else set.delete(key);
    }
    return ALL_MENUS.filter((k) => set.has(k));
}

async function menusForMembership(membership, role) {
    const roleMenus = await RoleMenu.find({ role_id: role.id });
    const personal = await MembershipMenu.find({ membership_id: membership.id });
    const override = Object.fromEntries(personal.map((m) => [m.menu_key, !!m.is_enabled]));
    return effectiveMenus(role.name, roleMenus.map((m) => m.menu_key), override);
}

/**
 * Agencies a person can work in from the web console, oldest first.
 * Participants use the mobile app, so their memberships are left out.
 * `suspended` tells whether a console membership exists but is suspended.
 */
async function workspacesOf(userId) {
    const memberships = await AgencyMembership.find({ user_id: userId, status: ['active', 'suspended'] }, { sort: { joined_at: 1 } });
    const workspaces = [];
    let suspended = false;

    for (const membership of memberships) {
        const role = await AgencyRole.findById(membership.role_id);
        if (!role || role.name === PARTICIPANT_ROLE) continue;
        if (membership.status === 'suspended') { suspended = true; continue; }

        const agency = await Agency.findById(membership.agency_id);
        if (!agency || agency.status !== 'active') continue;

        workspaces.push({ membership, role, agency });
    }
    return { workspaces, suspended };
}

const fullName = (user) => [user.first_name, user.last_name].filter(Boolean).join(' ');

/**
 * What the web console needs to know about the signed-in person.
 * Throws 403 when they have no agency to work in (and are not a Super Admin).
 */
async function sessionOf(user) {
    const base = { id: user.id, name: fullName(user), email: user.email };

    if (user.is_super_admin) {
        return { ...base, role: SUPER_ADMIN, agency: null, agencyName: null, menus: ALL_MENUS };
    }

    const { workspaces, suspended } = await workspacesOf(user.id);
    if (!workspaces.length) {
        throw new AppError(
            suspended
                ? 'Your access to this agency is suspended. Contact your administrator.'
                : 'No agency access yet. Participants sign in on the mobile app.',
            HTTP_STATUS.FORBIDDEN
        );
    }

    const { membership, role, agency } = workspaces[0];
    return {
        ...base,
        role: role.name,
        agency: agency.short_name,
        agencyName: agency.name,
        menus: await menusForMembership(membership, role),
    };
}

module.exports = { ALL_MENUS, LOCKED, ADMIN_ROLE, NEW_ROLE_MENUS, PARTICIPANT_ROLE, SUPER_ADMIN, effectiveMenus, workspacesOf, sessionOf, fullName };
