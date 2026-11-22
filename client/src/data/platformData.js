/**
 * Super Admin mock data — ported from the Figma Make "SUPERADMIN UI" draft.
 * Replace with /api/platform/* calls once the server exists.
 */

export { AGENCY_TYPES } from '../lib/verification';

export const SEED_AGENCIES = [
  { id: 'PRRI',   name: 'Philippine Rubber Research Institute', type: 'Government Agency', region: 'Region IX',  created: '2025-01-06', admin: 'Alexis Ramos',  usage: '24 activities · 624 participants', suspended: false },
  { id: 'DA-BAR', name: 'Bureau of Agricultural Research',      type: 'Government Agency', region: 'NCR',        created: '2025-02-11', admin: 'Assigned on approval', usage: 'Light usage', suspended: false },
  { id: 'CATC',   name: 'Cotabato Agri-Training Center',        type: 'Government Agency', region: 'Region XII', created: '2025-05-23', admin: 'Jose Macaraeg', usage: 'Light usage', suspended: false },
];

/** The same fields the public registration form collects (Register your agency). */
export const contactName = (a) => [a.firstName, a.middleName, a.lastName].filter(Boolean).join(' ');

/** Documents by slot id (see lib/verification.js): authority, entity, validId, moa. `kind` is which document was uploaded. */
const doc = (id, kind, file, size) => ({ id, kind, file, size });

export const SEED_APPLICATIONS = [
  { id: 1, agency: 'Mindanao Abaca Development Office', acronym: 'MADO', type: 'Government Agency', region: 'Region XI',  firstName: 'Ramon', middleName: 'Dela Cruz', lastName: 'Iligan',    email: 'r.iligan@mado.gov.ph',  phone: '0917 555 0142',
    docs: [doc('authority', 'Endorsement letter', 'MADO_Endorsement_Letter.pdf', '0.4 MB'), doc('validId', 'Official agency / employee ID', 'MADO_Contact_ID.jpg', '0.6 MB'), doc('moa', 'Memorandum of Agreement', 'MADO_MOA_signed.pdf', '1.1 MB')],
    submitted: '2025-06-12', status: 'Pending' },
  { id: 2, agency: 'Western Visayas Coconut Institute', acronym: 'WVCI', type: 'Educational Institution', region: 'Region VI',  firstName: 'Lea',   middleName: '',           lastName: 'Gonzales',  email: 'lgonzales@wvci.edu.ph', phone: '0928 555 0177',
    docs: [doc('authority', 'Designation letter', 'WVCI_Designation_Letter.pdf', '0.3 MB'), doc('validId', 'Philippine government-issued ID', 'WVCI_Contact_ID.jpg', '0.5 MB')],
    submitted: '2025-06-09', status: 'Under review' },
  { id: 3, agency: 'Bukidnon Cacao Growers Federation', acronym: 'BCGF', type: 'NGO / Cooperative / Association', region: 'Region X',   firstName: 'Ana',   middleName: 'Reyes',      lastName: 'Pelayo',    email: 'ana@bcgf.org',          phone: '0939 555 0108',
    docs: [doc('authority', 'Board resolution', 'BCGF_Board_Resolution.pdf', '0.4 MB'), doc('entity', 'SEC non-stock registration', 'BCGF_SEC_Registration.pdf', '1.2 MB')],
    submitted: '2025-06-03', status: 'Needs info', reason: 'Valid ID of the contact person is missing. Please upload it.' },
  { id: 4, agency: 'Cotabato Agri-Training Center',     acronym: 'CATC', type: 'Government Agency', region: 'Region XII', firstName: 'Jose',  middleName: '',           lastName: 'Macaraeg',  email: 'jmacaraeg@catc.gov.ph', phone: '0917 555 0163',
    docs: [doc('authority', 'Office order', 'CATC_Office_Order.pdf', '0.4 MB'), doc('validId', 'Official agency / employee ID', 'CATC_Contact_ID.jpg', '0.6 MB'), doc('moa', 'Memorandum of Agreement', 'CATC_MOA_signed.pdf', '1.1 MB')],
    submitted: '2025-05-21', status: 'Approved' },
];

export const SEED_AUDIT = [
  { id: 2, who: 'Super Administrator', action: 'Approved application',   target: 'Cotabato Agri-Training Center', at: '2025-05-23 09:14' },
  { id: 1, who: 'Super Administrator', action: 'Created agency directly', target: 'PRRI',                          at: '2025-01-06 08:30' },
];

export const PLATFORM_ADMINS = [
  { id: 'a1', name: 'Dr. Elena Cruz', email: 'superadmin@unifyle.gov.ph', role: 'Super Administrator', lastSignIn: 'Today',      status: 'Active' },
  { id: 'a2', name: 'Marco Reyes',    email: 'mreyes@unifyle.gov.ph',     role: 'Super Administrator', lastSignIn: '3 days ago', status: 'Active' },
];

/**
 * One account per person (unique email). Role and status live on each membership, one per agency,
 * so the same person can be an administrator in one agency and a participant in another.
 */
const m = (agency, role, joined, status = 'Active') => ({ agency, role, joined, status });
export const SEED_ACCOUNTS = [
  { id: 'u1', name: 'Alexis Ramos',       email: 'alexis.ramos@prri.gov.ph', status: 'Active',    lastSignIn: 'Today',      memberships: [m('PRRI', 'Agency Administrator', '2025-01-06')] },
  { id: 'u2', name: 'Dr. Marissa Flores', email: 'm.flores@prri.gov.ph',     status: 'Active',    lastSignIn: 'Yesterday',  memberships: [m('PRRI', 'Committee Member', '2025-01-20')] },
  { id: 'u3', name: 'Engr. Ana Lucero',   email: 'a.lucero@prri.gov.ph',     status: 'Active',    lastSignIn: '2 days ago', memberships: [m('PRRI', 'Resource Person', '2025-01-20'), m('DA-BAR', 'Committee Member', '2025-03-04')] },
  { id: 'u8', name: 'Dr. Leonilo Castor', email: 'l.castor@prri.gov.ph',     status: 'Active',    lastSignIn: 'Never',      memberships: [m('PRRI', 'Resource Person', '2025-06-12', 'Invited')] },
  { id: 'u4', name: 'Jose Macaraeg',      email: 'jmacaraeg@catc.gov.ph',    status: 'Active',    lastSignIn: '3 days ago', memberships: [m('CATC', 'Agency Administrator', '2025-05-23')] },
  { id: 'u9', name: 'Rina Mercado',       email: 'rina.mercado@dabar.gov.ph', status: 'Active',   lastSignIn: '5 days ago', memberships: [m('DA-BAR', 'Agency Administrator', '2025-02-11'), m('CATC', 'Resource Person', '2025-06-01')] },
  { id: 'u5', name: 'Juan Dela Cruz',     email: 'juan.delacruz@email.com',  status: 'Active',    lastSignIn: 'Today',      memberships: [m('PRRI', 'Participant', '2025-02-02')] },
  { id: 'u6', name: 'Maria Santos',       email: 'maria.santos@ipil.gov.ph', status: 'Active',    lastSignIn: 'Yesterday',  memberships: [m('PRRI', 'Participant', '2025-02-09'), m('CATC', 'Participant', '2025-06-02')] },
  { id: 'u7', name: 'Elena Garcia',       email: 'elena.garcia@email.com',   status: 'Suspended', lastSignIn: '3 weeks ago', memberships: [m('PRRI', 'Participant', '2025-03-15')] },
];

export const SEED_SETTINGS = {
  // New-agency defaults
  activityTypes:    ['Skills Training', 'Extension Activity', 'Seminar', 'Workshop'],
  documentTypes:    ['Proposal', 'Approval memo', 'Program of activities', 'Budget breakdown', 'Receipt'],
  budgetCategories: ['Venue', 'Meals', 'Materials', 'Transportation', 'Honoraria', 'Supplies', 'Other'],
  certificate: { minAttendance: 80, requireFeedback: true, requireReentryPlan: true },

  // Upload rules for the Documents step of Register your agency. Which documents are
  // required depends on the organization type; see lib/verification.js.
  registration: {
    fileTypes: { pdf: true, jpg: true, png: true },
    maxMb: 5,
  },

  // Emails sent by the platform
  emails: {
    approved:   { subject: 'Your UniFyle workspace for {{agency_name}} is ready', body: 'Hello {{contact_name}},\n\nGood news. Your application was approved and the workspace for {{agency_name}} has been created. You are its first Agency Administrator.\n\nSign in to finish setting up your agency:\n{{sign_in_link}}\n\nWelcome to UniFyle.' },
    rejected:   { subject: 'Update on your UniFyle application', body: 'Hello {{contact_name}},\n\nThank you for applying on behalf of {{agency_name}}. We are unable to approve the application at this time.\n\nReason: {{reason}}\n\nYou are welcome to apply again once this is addressed.' },
    needsInfo:  { subject: 'We need more information for {{agency_name}}', body: 'Hello {{contact_name}},\n\nWe are reviewing the application for {{agency_name}} and need a little more information:\n\n{{reason}}\n\nPlease reply to this email or resubmit your documents.' },
    invitation: { subject: 'You have been invited to {{agency_name}} on UniFyle', body: 'Hello {{contact_name}},\n\nYou have been invited to join {{agency_name}} on UniFyle. Use the link below to create your account:\n{{sign_in_link}}\n\nThe link expires in 7 days.' },
  },

  // Sign-in and account protection
  security: { minLength: 10, requireNumber: true, requireSymbol: false, sessionMinutes: 30, require2fa: true, maxAttempts: 5, lockoutMinutes: 15 },
};

export const ROLES = ['Agency Administrator', 'Committee Member', 'Resource Person', 'Participant'];
