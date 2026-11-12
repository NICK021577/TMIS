/**
 * Super Admin mock data — ported from the Figma Make "SUPERADMIN UI" draft.
 * Replace with /api/platform/* calls once the server exists.
 */

export const AGENCY_TYPES = ['Government', 'Academic', 'Private', 'Cooperative', 'NGO'];

export const SEED_AGENCIES = [
  { id: 'PRRI',   name: 'Philippine Rubber Research Institute', type: 'Government', region: 'Region IX',  created: '2025-01-06', admin: 'Alexis Ramos',  usage: '24 activities · 624 participants', suspended: false },
  { id: 'DA-BAR', name: 'Bureau of Agricultural Research',      type: 'Government', region: 'NCR',        created: '2025-02-11', admin: 'Assigned on approval', usage: 'Light usage', suspended: false },
  { id: 'CATC',   name: 'Cotabato Agri-Training Center',        type: 'Government', region: 'Region XII', created: '2025-05-23', admin: 'Jose Macaraeg', usage: 'Light usage', suspended: false },
];

export const SEED_APPLICATIONS = [
  { id: 1, agency: 'Mindanao Abaca Development Office', acronym: 'MADO', type: 'Government', region: 'Region XI',  contact: 'Ramon Iligan',     email: 'r.iligan@mado.gov.ph', submitted: '2025-06-12', status: 'Pending' },
  { id: 2, agency: 'Western Visayas Coconut Institute', acronym: 'WVCI', type: 'Academic',   region: 'Region VI',  contact: 'Dr. Lea Gonzales', email: 'lgonzales@wvci.edu.ph', submitted: '2025-06-09', status: 'Under review' },
  { id: 3, agency: 'Bukidnon Cacao Growers Federation', acronym: 'BCGF', type: 'Private',    region: 'Region X',   contact: 'Ana Pelayo',       email: 'ana@bcgf.org',          submitted: '2025-06-03', status: 'Needs info' },
  { id: 4, agency: 'Cotabato Agri-Training Center',     acronym: 'CATC', type: 'Government', region: 'Region XII', contact: 'Jose Macaraeg',    email: 'jmacaraeg@catc.gov.ph', submitted: '2025-05-21', status: 'Approved' },
];

export const SEED_AUDIT = [
  { id: 2, who: 'Super Administrator', action: 'Approved application',   target: 'Cotabato Agri-Training Center', at: '2025-05-23 09:14' },
  { id: 1, who: 'Super Administrator', action: 'Created agency directly', target: 'PRRI',                          at: '2025-01-06 08:30' },
];

export const PLATFORM_ADMINS = [
  { id: 'a1', name: 'Dr. Elena Cruz', email: 'superadmin@unifyle.gov.ph', role: 'Super Administrator', lastSignIn: 'Today',      status: 'Active' },
  { id: 'a2', name: 'Marco Reyes',    email: 'mreyes@unifyle.gov.ph',     role: 'Super Administrator', lastSignIn: '3 days ago', status: 'Active' },
];

export const SEED_ACCOUNTS = [
  { id: 'u1', name: 'Alexis Ramos',       email: 'alexis.ramos@prri.gov.ph', role: 'Agency Administrator', agencies: ['PRRI'],           status: 'Active' },
  { id: 'u2', name: 'Dr. Marissa Flores', email: 'm.flores@prri.gov.ph',     role: 'Committee Member',     agencies: ['PRRI'],           status: 'Active' },
  { id: 'u3', name: 'Engr. Ana Lucero',   email: 'a.lucero@prri.gov.ph',     role: 'Resource Person',      agencies: ['PRRI', 'DA-BAR'], status: 'Active' },
  { id: 'u4', name: 'Jose Macaraeg',      email: 'jmacaraeg@catc.gov.ph',    role: 'Agency Administrator', agencies: ['CATC'],           status: 'Active' },
  { id: 'u5', name: 'Juan Dela Cruz',     email: 'juan.delacruz@email.com',  role: 'Participant',          agencies: ['PRRI'],           status: 'Active' },
  { id: 'u6', name: 'Maria Santos',       email: 'maria.santos@ipil.gov.ph', role: 'Participant',          agencies: ['PRRI', 'CATC'],   status: 'Active' },
  { id: 'u7', name: 'Elena Garcia',       email: 'elena.garcia@email.com',   role: 'Participant',          agencies: ['PRRI'],           status: 'Suspended' },
];

export const SEED_SETTINGS = {
  activityTypes:    ['Skills Training', 'Extension Activity', 'Seminar', 'Workshop'],
  documentTypes:    ['Proposal', 'Approval memo', 'Program of activities', 'Budget breakdown', 'Receipt'],
  budgetCategories: ['Venue', 'Meals', 'Materials', 'Transportation', 'Honoraria', 'Supplies', 'Other'],
  certificate: { minAttendance: 80, requireFeedback: true, requireReentryPlan: true },
};

export const ROLES = ['Agency Administrator', 'Committee Member', 'Resource Person', 'Participant'];
