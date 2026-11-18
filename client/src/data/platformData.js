/**
 * Super Admin mock data — ported from the Figma Make "SUPERADMIN UI" draft.
 * Replace with /api/platform/* calls once the server exists.
 */

export const AGENCY_TYPES = ['Government', 'Academic', 'Private', 'Non-profit'];

export const SEED_AGENCIES = [
  { id: 'PRRI',   name: 'Philippine Rubber Research Institute', type: 'Government', region: 'Region IX',  created: '2025-01-06', admin: 'Alexis Ramos',  usage: '24 activities · 624 participants', suspended: false },
  { id: 'DA-BAR', name: 'Bureau of Agricultural Research',      type: 'Government', region: 'NCR',        created: '2025-02-11', admin: 'Assigned on approval', usage: 'Light usage', suspended: false },
  { id: 'CATC',   name: 'Cotabato Agri-Training Center',        type: 'Government', region: 'Region XII', created: '2025-05-23', admin: 'Jose Macaraeg', usage: 'Light usage', suspended: false },
];

/** The same fields the public registration form collects (Register your agency). */
export const contactName = (a) => [a.firstName, a.middleName, a.lastName].filter(Boolean).join(' ');

const docs = (acr, sizes = ['0.4 MB', '1.1 MB', '0.6 MB']) => [
  { id: 'authLetter', label: 'Authorization letter',           file: `${acr}_Authorization_Letter.pdf`, size: sizes[0] },
  { id: 'moa',        label: 'Memorandum of Agreement (MOA)',  file: `${acr}_MOA_signed.pdf`,           size: sizes[1] },
  { id: 'validId',    label: 'Valid ID of the contact person', file: `${acr}_Contact_ID.jpg`,           size: sizes[2] },
];

export const SEED_APPLICATIONS = [
  { id: 1, agency: 'Mindanao Abaca Development Office', acronym: 'MADO', type: 'Government', region: 'Region XI',  firstName: 'Ramon', middleName: 'Dela Cruz', lastName: 'Iligan',    email: 'r.iligan@mado.gov.ph',  phone: '0917 555 0142', docs: docs('MADO'), submitted: '2025-06-12', status: 'Pending' },
  { id: 2, agency: 'Western Visayas Coconut Institute', acronym: 'WVCI', type: 'Academic',   region: 'Region VI',  firstName: 'Lea',   middleName: '',           lastName: 'Gonzales',  email: 'lgonzales@wvci.edu.ph', phone: '0928 555 0177', docs: docs('WVCI', ['0.3 MB', '1.4 MB', '0.5 MB']), submitted: '2025-06-09', status: 'Under review' },
  { id: 3, agency: 'Bukidnon Cacao Growers Federation', acronym: 'BCGF', type: 'Private',    region: 'Region X',   firstName: 'Ana',   middleName: 'Reyes',      lastName: 'Pelayo',    email: 'ana@bcgf.org',          phone: '0939 555 0108', docs: docs('BCGF').slice(0, 2), submitted: '2025-06-03', status: 'Needs info', reason: 'Valid ID of the contact person is missing. Please upload it.' },
  { id: 4, agency: 'Cotabato Agri-Training Center',     acronym: 'CATC', type: 'Government', region: 'Region XII', firstName: 'Jose',  middleName: '',           lastName: 'Macaraeg',  email: 'jmacaraeg@catc.gov.ph', phone: '0917 555 0163', docs: docs('CATC'), submitted: '2025-05-21', status: 'Approved' },
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
  // New-agency defaults
  activityTypes:    ['Skills Training', 'Extension Activity', 'Seminar', 'Workshop'],
  documentTypes:    ['Proposal', 'Approval memo', 'Program of activities', 'Budget breakdown', 'Receipt'],
  budgetCategories: ['Venue', 'Meals', 'Materials', 'Transportation', 'Honoraria', 'Supplies', 'Other'],
  certificate: { minAttendance: 80, requireFeedback: true, requireReentryPlan: true },

  // What an agency must submit when it registers
  registration: {
    docs: [
      { id: 'authLetter', label: 'Authorization letter',           required: true },
      { id: 'moa',        label: 'Memorandum of Agreement (MOA)',  required: true },
      { id: 'validId',    label: 'Valid ID of the contact person', required: true },
    ],
    fileTypes: { pdf: true, jpg: true, png: true },
    maxMb: 5,
    agencyTypes: ['Government', 'Academic', 'Private', 'Non-profit'],
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
