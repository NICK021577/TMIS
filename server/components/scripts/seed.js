const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const bcrypt = require('bcryptjs');
const { sql } = require('../config/dbConnect');
const { SALT } = require('../config/config');
const { User, Agency, AgencyRole, RoleMenu, AgencyMembership } = require('../models');

/* ── accounts (change here, then run the seed again on a fresh database) ── */
const SUPER_ADMIN = { email: 'superadmin@gmail.com', password: '12345678', first: 'Elena', last: 'Cruz' };
const SAMPLE_ADMIN = { email: 'alexis.ramos@prri.gov.ph', password: 'Prri-Admin-2026', first: 'Alexis', last: 'Ramos' };
const SAMPLE_COMMITTEE = { email: 'm.flores@prri.gov.ph', password: 'Prri-Committee-2026', first: 'Marissa', last: 'Flores' };

const AGENCY = {
    name: 'Philippine Rubber Research Institute',
    short_name: 'PRRI',
    type: 'government',
    region: 'Region IX',
    brand_color: '#2f5fcc',
    mission: 'To generate and promote rubber technologies that raise farmer incomes and build a competitive, sustainable rubber industry.',
    vision: 'A globally competitive Philippine rubber industry with empowered, prosperous rubber farming communities.',
    mandate: 'Research, development and extension of rubber technologies in the Philippines.',
    values: ['Excellence', 'Integrity', 'Service to farmers', 'Innovation', 'Sustainability'],
    contact_email: 'info@prri.gov.ph',
};

/* Built-in roles of every agency and the menus each opens by default (same lists as client/src/lib/menus.js) */
const ALL = ['dashboard', 'calendar', 'activities', 'participants', 'budget', 'reports', 'messaging', 'about', 'settings'];
const ROLES = [
    { name: 'Agency Administrator', access: 'all_records', menus: ALL },
    { name: 'Committee Member', access: 'assigned_activities', menus: ['dashboard', 'calendar', 'activities', 'participants', 'reports', 'messaging', 'about'] },
    { name: 'Resource Person', access: 'assigned_sessions', menus: ['dashboard', 'activities', 'participants', 'reports', 'messaging', 'about'] },
    { name: 'Participant', access: 'assigned_activities', menus: [] },
];

/** Returns the row matching `filter`, or creates it with `filter` + `data`. */
async function findOrCreate(Model, filter, data, label) {
    const existing = await Model.findOne(filter);
    if (existing) return existing;
    const created = await Model.create({ ...filter, ...data });
    if (label) console.log(`Created ${label}`);
    return created;
}

async function createUser(account, isSuperAdmin, label) {
    return findOrCreate(User, { email: account.email }, {
        password: await bcrypt.hash(account.password, SALT),
        first_name: account.first,
        last_name: account.last,
        status: 'active',
        is_super_admin: isSuperAdmin,
        must_reset_password: false,
    }, `${label} ${account.email}`);
}

async function main() {
    /* Super admin */
    const superAdmin = await createUser(SUPER_ADMIN, true, 'super admin');

    /* Agency */
    const agency = await findOrCreate(Agency, { short_name: AGENCY.short_name }, {
        ...AGENCY,
        status: 'active',
        created_by: superAdmin.id,
    }, `agency ${AGENCY.short_name}`);

    /* Roles and their default menus */
    const roles = {};
    for (const r of ROLES) {
        const role = await findOrCreate(AgencyRole, { agency_id: agency.id, name: r.name }, {
            data_access: r.access,
            is_system: true,
            created_by: superAdmin.id,
        }, `role ${r.name}`);
        roles[r.name] = role;

        for (const menu of r.menus) {
            await findOrCreate(RoleMenu, { role_id: role.id, menu_key: menu }, {
                agency_id: agency.id,
                created_by: superAdmin.id,
            });
        }
    }

    /* Sample Agency Administrator */
    const admin = await createUser(SAMPLE_ADMIN, false, 'sample agency administrator');
    await findOrCreate(AgencyMembership, { agency_id: agency.id, user_id: admin.id }, {
        role_id: roles['Agency Administrator'].id,
        status: 'active',
        joined_at: new Date(),
        created_by: superAdmin.id,
    });

    /* Sample Committee Member */
    const committee = await createUser(SAMPLE_COMMITTEE, false, 'sample committee member');
    await findOrCreate(AgencyMembership, { agency_id: agency.id, user_id: committee.id }, {
        role_id: roles['Committee Member'].id,
        status: 'active',
        joined_at: new Date(),
        created_by: admin.id,
    });

    console.log('Seed finished.');
}

main()
    .catch((error) => {
        console.error('Seed failed:', error.message);
        process.exitCode = 1;
    })
    .finally(() => sql.end());
