/**
 * Dummy data ported from the Figma Make prototype (TMIS Prototype Development).
 * Replace with API calls once the server endpoints exist.
 */

export const TODAY_ISO = '2025-06-18';

export const ACTIVITY_TYPES = ['Skills Training', 'Extension Activity', 'Seminar', 'Workshop'];

/**
 * Partner directory: organizations an agency works with. A partner is only a name and a type,
 * it does not need an account here. `own` marks the agency itself so it can be picked as Implementing.
 */
export const PARTNERS_SEED = [
  { id: 1, name: 'Philippine Rubber Research Institute', type: 'Government Agency', own: true, archived: false },
  { id: 2, name: 'DA Region IX',                         type: 'Government Agency', archived: false },
  { id: 3, name: 'Zamboanga Sibugay LGU',                type: 'Government Agency', archived: false },
  { id: 4, name: 'Rubber Growers Association',           type: 'NGO / Cooperative / Association', archived: false },
];

/** Funding sources. `partnerId` says which partner pays (empty for the agency's own money, e.g. GAA). */
export const FUNDING_SEED = [
  { id: 1, name: 'GAA 2025',      partnerId: null, archived: false },
  { id: 2, name: 'Agency Fund',   partnerId: null, archived: false },
  { id: 3, name: 'Partner Grant', partnerId: 2,    archived: false },
];
export const BUDGET_CATEGORIES = ['Venue', 'Meals', 'Materials', 'Transportation', 'Honoraria', 'Supplies', 'Other'];

export const peso = (n) => `${n < 0 ? '-' : ''}₱${Math.abs(Math.round(n)).toLocaleString('en-PH')}`;

/* ── Activities ─────────────────────────────────────────────────── */
export const ACTIVITIES = [
  { id: 1, title: 'Rubber Production and Tapping Technology',  type: 'Skills Training',    date: 'June 17–19, 2025', dateShort: 'JUN 17', venue: 'PRRI Training Center, Zamboanga Sibugay', status: 'Upcoming',  participants: 42, capacity: 50, tenant: 'PRRI' },
  { id: 2, title: 'Community-Based Rubber Nursery Management', type: 'Extension Activity', date: 'June 10–12, 2025', dateShort: 'JUN 10', venue: 'Ipil, Zamboanga Sibugay',                  status: 'Ongoing',   participants: 36, capacity: 40, tenant: 'PRRI' },
  { id: 3, title: 'Pest and Disease Management for Rubber Farms', type: 'Seminar',         date: 'May 22, 2025',     dateShort: 'MAY 22', venue: 'Kabacan, North Cotabato',                  status: 'Completed', participants: 68, capacity: 70, tenant: 'PRRI' },
  { id: 4, title: 'Results-Based Monitoring Workshop',         type: 'Workshop',           date: 'July 8–9, 2025',   dateShort: 'JUL 08', venue: 'Quezon City',                              status: 'Upcoming',  participants: 28, capacity: 35, tenant: 'DA-BAR' },
  { id: 5, title: 'Agricultural Innovation Systems Forum',     type: 'Forum',              date: 'August 14, 2025',  dateShort: 'AUG 14', venue: 'Los Baños, Laguna',                        status: 'Draft',     participants: 12, capacity: 80, tenant: 'DA-BAR' },
  { id: 6, title: 'Rubber Clone Selection Field Day',          type: 'Extension Activity', date: 'July 22, 2025',   dateShort: 'JUL 22', venue: 'PRRI Experiment Station, Zamboanga Sibugay', status: 'Upcoming',  participants: 18, capacity: 30, tenant: 'PRRI' },
];

export const ACTIVITY_SUMMARY = { all: 26, upcoming: 7, ongoing: 5, completed: 14 };

/* ── Dashboard ──────────────────────────────────────────────────── */
export const DASHBOARD_STATS = [
  { label: 'Total activities',    value: '26',    change: '+4 this quarter',     icon: 'clock'    },
  { label: 'Total participants',  value: '624',   change: '+68 this quarter',    icon: 'users'    },
  { label: 'Average attendance',  value: '89.4%', change: '+3.2% vs last period', icon: 'scan'    },
  { label: 'Reentry plans',       value: '76%',   change: '318 plans submitted',  icon: 'file'    },
];

export const TREND = [
  { m: 'Jan', v: 38 }, { m: 'Feb', v: 57 }, { m: 'Mar', v: 44 },
  { m: 'Apr', v: 70 }, { m: 'May', v: 62 }, { m: 'Jun', v: 88 },
];

/* ── Attendance ─────────────────────────────────────────────────── */
/* Attendance has four check points per day: AM in, AM out, PM in, PM out. */
export const ATTENDANCE = [
  { name: 'Juan Dela Cruz', agency: 'Siay Rubber Farmers Association', amIn: { status: 'Checked in', time: '7:48 AM' }, amOut: { status: 'Checked out', time: '12:02 PM' }, pmIn: { status: 'Not yet', time: '' }, pmOut: { status: 'Not yet', time: '' } },
  { name: 'Maria Santos', agency: 'LGU Ipil Agriculture Office', amIn: { status: 'Checked in', time: '7:51 AM' }, amOut: { status: 'Checked out', time: '12:00 PM' }, pmIn: { status: 'Checked in', time: '12:54 PM' }, pmOut: { status: 'Not yet', time: '' } },
  { name: 'Rogelio Mendoza', agency: 'Kabasalan Farmers Cooperative', amIn: { status: 'Checked in', time: '8:02 AM' }, amOut: { status: 'Pending sync', time: '12:05 PM' }, pmIn: { status: 'Pending sync', time: '1:03 PM' }, pmOut: { status: 'Not yet', time: '' } },
  { name: 'Elena Garcia', agency: 'Naga Rubber Growers Association', amIn: { status: 'Not yet', time: '' }, amOut: { status: 'Not yet', time: '' }, pmIn: { status: 'Not yet', time: '' }, pmOut: { status: 'Not yet', time: '' } },
  { name: 'Antonio Reyes', agency: 'R.T. Lim Municipal Agriculture', amIn: { status: 'Checked in', time: '8:09 AM' }, amOut: { status: 'Checked out', time: '12:10 PM' }, pmIn: { status: 'Checked in', time: '1:01 PM' }, pmOut: { status: 'Checked out', time: '4:32 PM' } },
];

/* ── Participant registry ───────────────────────────────────────── */
export const PEOPLE = [
  { id: 'u1', name: 'Juan Dela Cruz',  email: 'juan.delacruz@email.com',  agency: 'Siay Rubber Farmers Association', activities: 4, attendance: '92%', status: 'Active',  category: 'Farmer cooperative or association member', location: 'Siay, Zamboanga Sibugay',       activityIds: [1, 2, 3], registered: 'Jun 02, 2025', source: 'Invite link' },
  { id: 'u2', name: 'Maria Santos',    email: 'maria.santos@ipil.gov.ph', agency: 'LGU Ipil Agriculture Office',     activities: 7, attendance: '96%', status: 'Active',  category: 'LGU or government staff',                  location: 'Ipil, Zamboanga Sibugay',       activityIds: [1, 2, 3], registered: 'May 28, 2025', source: 'Mobile app' },
  { id: 'u3', name: 'Rogelio Mendoza', email: 'rogelio.m@email.com',      agency: 'Kabasalan Farmers Cooperative',   activities: 3, attendance: '83%', status: 'Active',  category: 'Farmer',                                   location: 'Kabasalan, Zamboanga Sibugay',  activityIds: [1, 2],    registered: 'Jun 03, 2025', source: 'Invite link' },
  { id: 'u4', name: 'Elena Garcia',    email: 'elena.garcia@email.com',   agency: 'Naga Rubber Growers Association', activities: 2, attendance: '75%', status: 'Pending', category: 'Farmer',                                   location: 'Naga, Zamboanga Sibugay',       activityIds: [1],       registered: 'Jun 05, 2025', source: 'Added by admin' },
  { id: 'u5', name: 'Antonio Reyes',   email: 'areyes@rtlim.gov.ph',      agency: 'R.T. Lim Municipal Agriculture',  activities: 6, attendance: '94%', status: 'Active',  category: 'LGU or government staff',                  location: 'Ipil, Zamboanga Sibugay',       activityIds: [1, 3],    registered: 'May 30, 2025', source: 'Mobile app' },
  { id: 'u6', name: 'Mario Dela Cruz', email: 'mario.dc@email.com',       agency: 'Siay Rubber Farmers Association', activities: 3, attendance: '88%', status: 'Active',  category: 'Farmer cooperative or association member', location: 'Siay, Zamboanga Sibugay',       activityIds: [1, 2],    registered: 'Jun 04, 2025', source: 'Invite link' },
  { id: 'u7', name: 'Liza Ramos',      email: 'liza.ramos@email.com',     agency: 'Ipil Rubber Planters Group',      activities: 2, attendance: '80%', status: 'Active',  category: 'Farmer',                                   location: 'Ipil, Zamboanga Sibugay',       activityIds: [1, 3],    registered: 'Jun 06, 2025', source: 'Invite link' },
  { id: 'u8', name: 'Alex Villanueva', email: 'alex.v@email.com',         agency: 'Zamboanga Sibugay State College', activities: 1, attendance: '100%', status: 'Active', category: 'Student',                                  location: 'Ipil, Zamboanga Sibugay',       activityIds: [1],       registered: 'Jun 07, 2025', source: 'Invite link' },
];

export const INVITES = [
  { id: 1, code: 'PRRI-FARM-2025', category: 'Farmer',                  expires: '2025-12-31', limit: 200, used: 64 },
  { id: 2, code: 'PRRI-LGU-0612',  category: 'LGU or government staff', expires: '2025-06-30', limit: 30,  used: 30 },
  { id: 3, code: 'PRRI-OPEN-MAR',  category: 'No preset',               expires: '2025-03-31', limit: 100, used: 41 },
];

export const CATEGORIES_SEED = [
  { id: 1, name: 'Farmer' },
  { id: 2, name: 'Farmer cooperative or association member' },
  { id: 3, name: 'LGU or government staff' },
  { id: 4, name: 'Student' },
  { id: 5, name: 'Partner organization staff' },
  { id: 6, name: 'Other' },
];

/* ── Budget ─────────────────────────────────────────────────────── */
export const BUDGET_ITEMS = [
  { id: 1,  activityId: 1, category: 'Venue',          item: 'Training hall rental, 3 days',        qty: 3,   unit: 13000, funding: 'GAA 2025' },
  { id: 2,  activityId: 1, category: 'Meals',          item: 'Lunch and snacks for 50 participants', qty: 150, unit: 180,   funding: 'GAA 2025' },
  { id: 3,  activityId: 1, category: 'Materials',      item: 'Tapping knives and training kits',     qty: 50,  unit: 250,   funding: 'Agency Fund' },
  { id: 4,  activityId: 1, category: 'Honoraria',      item: 'Resource persons',                     qty: 3,   unit: 8000,  funding: 'GAA 2025' },
  { id: 5,  activityId: 1, category: 'Transportation', item: 'Field visit vehicle',                  qty: 1,   unit: 15000, funding: 'Agency Fund' },
  { id: 6,  activityId: 2, category: 'Venue',          item: 'Nursery site and hall',                qty: 3,   unit: 10000, funding: 'GAA 2025',    actual: 30000 },
  { id: 7,  activityId: 2, category: 'Meals',          item: 'Meals for 40 participants',            qty: 120, unit: 150,   funding: 'GAA 2025',    actual: 19400 },
  { id: 8,  activityId: 2, category: 'Materials',      item: 'Rubber seedlings (RRIM 600)',          qty: 400, unit: 35,    funding: 'Partner Grant', actual: 14000 },
  { id: 9,  activityId: 2, category: 'Honoraria',      item: 'Nursery specialists',                  qty: 2,   unit: 8000,  funding: 'GAA 2025',    actual: 16000 },
  { id: 10, activityId: 2, category: 'Supplies',       item: 'Polybags, fertilizer, tools',          qty: 1,   unit: 6000,  funding: 'Agency Fund', actual: 7250 },
  { id: 11, activityId: 3, category: 'Venue',          item: 'Municipal hall',                       qty: 1,   unit: 15000, funding: 'GAA 2025',    actual: 15000 },
  { id: 12, activityId: 3, category: 'Meals',          item: 'Meals for 60 participants',            qty: 60,  unit: 150,   funding: 'GAA 2025',    actual: 8700 },
  { id: 13, activityId: 3, category: 'Materials',      item: 'Pest identification guides',           qty: 80,  unit: 100,   funding: 'Agency Fund', actual: 7900 },
  { id: 14, activityId: 4, category: 'Venue',          item: 'Conference hall',                      qty: 2,   unit: 30000, funding: 'GAA 2025' },
  { id: 15, activityId: 4, category: 'Meals',          item: 'Meals for 80 participants',            qty: 160, unit: 200,   funding: 'GAA 2025' },
  { id: 16, activityId: 4, category: 'Honoraria',      item: 'Facilitators',                         qty: 4,   unit: 5000,  funding: 'Partner Grant' },
  { id: 17, activityId: 6, category: 'Venue',          item: 'Experiment station field area',       qty: 1,   unit: 8000,  funding: 'Agency Fund' },
  { id: 18, activityId: 6, category: 'Meals',          item: 'Meals for 30 participants',            qty: 60,  unit: 160,   funding: 'Agency Fund' },
];

export const estimate = (i) => i.qty * i.unit;

/* ── Calendar ───────────────────────────────────────────────────── */
export const PLANS = [
  { id: 1, title: 'Farmer Field School Kickoff',        type: 'Extension Activity', start: '2025-06-18', end: '2025-06-19', venue: 'Siay, Zamboanga Sibugay', funding: 'Agency Fund' },
  { id: 2, title: 'Clone Evaluation Field Day',         type: 'Extension Activity', start: '2025-08-06', end: '2025-08-07', venue: 'PRRI Experiment Station', funding: 'GAA 2025' },
  { id: 3, title: 'Training Needs Assessment Workshop', type: 'Workshop',           start: '2025-02-12', end: '2025-02-13', venue: 'PRRI Main Office',        funding: 'Agency Fund' },
  { id: 4, title: 'Rubber Marketing Seminar',           type: 'Seminar',            start: '2025-10-15', end: '2025-10-15', venue: 'Ipil Convention Hall',    funding: 'Partner Grant' },
];

/* ── Reports ────────────────────────────────────────────────────── */
export const REPORT_METRICS = [
  { label: 'Activities conducted', value: '19',    note: '73% of annual target' },
  { label: 'Total participants',   value: '624',   note: '52% women participants' },
  { label: 'Average attendance',   value: '89.4%', note: '+3.2% vs previous period' },
  { label: 'Reentry plans',        value: '76%',   note: '318 plans submitted' },
];
export const PARTICIPATION_BY_TYPE = [
  { label: 'Skills training',    pct: 86, count: 286 },
  { label: 'Extension activity', pct: 65, count: 216 },
  { label: 'Seminars',           pct: 39, count: 132 },
  { label: 'Workshops',          pct: 28, count: 94 },
];
export const EVALUATION = {
  score: '4.72', responses: 487,
  rows: [
    { label: 'Overall satisfaction',          value: 94 },
    { label: 'Relevance of content',          value: 92 },
    { label: 'Resource person effectiveness', value: 96 },
    { label: 'Venue & logistics',             value: 86 },
  ],
};

/* ── Messaging ──────────────────────────────────────────────────── */
export const MESSAGE_GROUPS = [
  { name: 'Rubber Production Training',  type: 'Activity group',    members: 48,  unread: 3 },
  { name: 'PRRI Participant Support',    type: 'Agency-wide group', members: 624, unread: 0 },
  { name: 'Nursery Management Batch 2',  type: 'Activity group',    members: 41,  unread: 1 },
];
export const MESSAGES = [
  { who: 'Dr. Marissa Flores', time: '8:42 AM', text: 'Good morning, everyone! Please bring your boots and hats for the demo farm session this afternoon.' },
  { who: 'Juan Dela Cruz',     time: '9:06 AM', text: 'Noted, Ma’am. Will the tapping knives be provided or should we bring our own?' },
  { who: 'Alexis Ramos',       time: '9:12 AM', text: 'Knives and training kits will be provided at the registration table. See you at 1:00 PM.' },
];

/* ── Agency profile & settings ──────────────────────────────────── */
export const AGENCY = {
  name: 'Philippine Rubber Research Institute',
  shortName: 'PRRI',
  mission: 'To generate and promote rubber technologies that raise farmer incomes and build a competitive, sustainable rubber industry.',
  vision: 'A globally competitive Philippine rubber industry with empowered, prosperous rubber farming communities.',
  values: ['Excellence', 'Integrity', 'Service to farmers', 'Innovation', 'Sustainability'],
  mandate: 'PRRI conducts research, development and extension for the rubber industry, and trains farmers, LGU staff and partner organizations nationwide.',
  region: 'Region IX',
  contact: 'info@prri.gov.ph',
  subscribers: '13.4K',
};

export const TEAM = [
  { name: 'Alexis Ramos',      role: 'Agency Administrator', email: 'alexis.ramos@prri.gov.ph', status: 'Active' },
  { name: 'Dr. Marissa Flores', role: 'Committee Member',     email: 'm.flores@prri.gov.ph',    status: 'Active' },
  { name: 'Engr. Ana Lucero',  role: 'Resource Person',      email: 'a.lucero@prri.gov.ph',     status: 'Active' },
  { name: 'Dr. Leonilo Castor', role: 'Resource Person',      email: 'l.castor@prri.gov.ph',    status: 'Invited' },
];

export const BRAND_PRESETS = [
  { id: 'unifyle', label: 'UniFyle blue', description: 'Default UniFyle look', color: '#2563d9' },
  { id: 'forest',  label: 'Forest',       description: 'Deep rubber-farm green', color: '#1f6e4b' },
  { id: 'earth',   label: 'Earth',        description: 'Warm soil and clay',    color: '#a0603a' },
];

/* ── Helpers ────────────────────────────────────────────────────── */
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* ── Agency settings ────────────────────────────────────────────── */

/* ── Notifications (bell menu) ──────────────────────────────────── */
export const NOTIFICATIONS = [
  { id: 1, title: 'New registration',        text: 'Liza Ramos registered for Rubber Production and Tapping Technology.', time: '5 min ago',  to: '/activities/1', read: false },
  { id: 2, title: 'Feedback received',       text: '3 new responses for Rubber Tapping Techniques.',                       time: '1 hour ago', to: '/activities/1', read: false },
  { id: 3, title: 'Reentry plan submitted',  text: 'Maria Santos submitted a reentry plan.',                               time: '3 hours ago', to: '/activities/1', read: false },
  { id: 4, title: 'Budget alert',            text: 'Community-Based Rubber Nursery Management is over its allocation.',    time: 'Yesterday',  to: '/budget',       read: true },
  { id: 5, title: 'Starts tomorrow',         text: 'Farmer Field School Kickoff begins tomorrow.',                         time: 'Yesterday',  to: '/calendar',     read: true },
];
