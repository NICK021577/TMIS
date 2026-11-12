/**
 * Activity workspace demo content (from the TMIS Web Console spec, section 4.6.1).
 * Same demo content is shown for every activity; budgets are real per activity.
 */

export const WS = {
  description:
    'A three-day capability-building program designed to strengthen participants’ practical knowledge in sustainable rubber production, proper tapping techniques, and post-harvest handling.',
  funding: 'PRRI GAA 2025',
  lead: 'Dr. Marissa L. Flores',
  agencies: '6 partner organizations',
  audience: 'rubber farmers',
  topics: 'Rubber production, Tapping, Plantation management',
  programFlow: 'Program_Flow_2025.pdf (v3)',
  documentation: 'Photo, attendance and report',
};

export const DAYS = [
  { n: 1, label: 'June 17, Tuesday' },
  { n: 2, label: 'June 18, Wednesday' },
  { n: 3, label: 'June 19, Thursday' },
];

export const SESSIONS = [
  { id: 1, day: 1, period: 'AM', date: 'Jun 17', time: '8:30–10:30 AM', title: 'Introduction to Rubber Production',  speaker: 'Dr. Leonilo B. Castor', room: 'Training Hall A',   files: 2, status: 'Completed' },
  { id: 2, day: 1, period: 'PM', date: 'Jun 17', time: '1:00–4:00 PM',  title: 'Latex Handling and Quality Control', speaker: 'Ms. Joy Fabian',        room: 'Training Hall A',   files: 2, status: 'Completed' },
  { id: 3, day: 2, period: 'AM', date: 'Jun 18', time: '8:30–11:30 AM', title: 'Rubber Tapping Techniques',          speaker: 'Engr. Ana Lucero',      room: 'Training Hall B',   files: 3, status: 'Ongoing' },
  { id: 4, day: 2, period: 'PM', date: 'Jun 18', time: '1:00–4:30 PM',  title: 'Demo Farm: Tapping Practicum',       speaker: 'Engr. Ana Lucero',      room: 'Demo Farm Block C', files: 0, status: 'Upcoming' },
  { id: 5, day: 3, period: 'AM', date: 'Jun 19', time: '8:30–11:30 AM', title: 'Plantation Management',              speaker: 'Mr. Dennis Ramos',      room: 'Training Hall B',   files: 1, status: 'Upcoming' },
  { id: 6, day: 3, period: 'PM', date: 'Jun 19', time: '1:00–3:30 PM',  title: 'Reentry Planning and Closing',       speaker: 'Ms. Joy Fabian',        room: 'Training Hall A',   files: 1, status: 'Upcoming' },
];

export const STAFF = [
  { id: 1, name: 'Ms. Joy Fabian',        role: 'Facilitator', duty: 'Day-to-day, Day 1 to 3',            status: 'Assigned' },
  { id: 2, name: 'Mr. Ramil Ocampo',      role: 'Facilitator', duty: 'Demo farm sessions, Day 2',          status: 'Assigned' },
  { id: 3, name: 'Dr. Marissa L. Flores', role: 'Committee',   duty: 'Chair, overall organizing',          status: 'Assigned' },
  { id: 4, name: 'Ms. Liza Navarro',      role: 'Committee',   duty: 'Registration, registration desk',    status: 'Assigned' },
  { id: 5, name: 'Mr. Paolo Dizon',       role: 'Committee',   duty: 'Logistics, venue, meals, transport', status: 'Pending' },
];

export const OBJECTIVES = [
  'Perform correct tapping on a mature tree',
  'Identify rubber clones suited to their site',
  'Apply basic latex quality control',
];
export const OUTCOMES = [
  'Participants adopt S/2 d3 tapping on their farms',
  'Participants cascade the training to neighbouring farmers',
];

export const AGENCY_ROLES = [
  { id: 1, agency: 'Philippine Rubber Research Institute', role: 'Implementing',  notes: 'Default role, plans and runs the activity' },
  { id: 2, agency: 'DA Region IX',                         role: 'Funding',       notes: 'GAA 2025 co-funding' },
  { id: 3, agency: 'Zamboanga Sibugay LGU',                role: 'Collaborating', notes: 'Venue and logistics support' },
  { id: 4, agency: 'Rubber Growers Association',           role: 'Participating', notes: 'Nominates 12 farmer-participants' },
];
export const ROLE_OPTIONS = ['Implementing', 'Funding', 'Collaborating', 'Participating'];

export const RESOURCES = [
  { id: 1, type: 'People', resource: 'Resource persons',               allocated: '4 of 4',     status: 'Confirmed' },
  { id: 2, type: 'Venue',  resource: 'PRRI Training Hall A and B',     allocated: '2 of 2',     status: 'Confirmed' },
  { id: 3, type: 'Tools',  resource: 'Tapping knives, cups, gutters',  allocated: '50 sets of 50', status: 'Confirmed' },
  { id: 4, type: 'Inputs', resource: 'Rubber seedlings (demo)',        allocated: '120 of 200', status: 'Partial' },
  { id: 5, type: 'Inputs', resource: 'Fertilizer (14-14-14)',          allocated: '10 of 10 bags', status: 'Confirmed' },
];

export const DOCUMENTS = [
  { id: 1, file: 'Signed_Attendance_Day1.pdf', type: 'Signed attendance sheet', uploaded: 'Jun 17, 2025', size: '1.2 MB' },
  { id: 2, file: 'Training_Memo_2025-031.pdf', type: 'Memo',                    uploaded: 'Jun 10, 2025', size: '0.4 MB' },
  { id: 3, file: 'Venue_MOA_LGU.pdf',          type: 'Agreement',               uploaded: 'Jun 05, 2025', size: '0.9 MB' },
  { id: 4, file: 'Certificate_Template.pdf',   type: 'Certificate',             uploaded: 'Jun 12, 2025', size: '0.6 MB' },
];

export const OUTPUTS = [
  { id: 1, output: 'Training sessions conducted', planned: '6',  conducted: '4',      status: 'On track' },
  { id: 2, output: 'Participants trained',        planned: '40', conducted: '36',     status: 'On track' },
  { id: 3, output: 'Demo farm practicum',         planned: '1',  conducted: '0 (scheduled Day 2 PM)', status: 'Pending' },
  { id: 4, output: 'Activity report',             planned: '1',  conducted: 'Draft',  status: 'Pending' },
];
export const OUTPUT_PHOTOS = [
  { caption: 'Tapping panel', by: 'Juan Dela Cruz' },
  { caption: 'Demo farm',     by: 'Maria Santos' },
  { caption: 'Group output',  by: 'Mario Dela Cruz' },
  { caption: 'Nursery plot',  by: 'Ana Reyes' },
];

export const FEEDBACK = [
  { id: 1, session: 'Introduction to Rubber Production',  rating: 4.8, responses: '31 / 36' },
  { id: 2, session: 'Latex Handling and Quality Control', rating: 4.5, responses: '29 / 36' },
  { id: 3, session: 'Rubber Tapping Techniques',          rating: 4.7, responses: '12 / 36' },
];

export const REENTRY = [
  { id: 1, name: 'Mario Dela Cruz', plan: 'Apply S/2 d3 tapping on 2 ha',     target: 'Aug 15, 2025', status: 'Submitted' },
  { id: 2, name: 'Maria Santos',    plan: 'Cascade training for 15 neighbors', target: 'Sep 01, 2025', status: 'Submitted' },
  { id: 3, name: 'Juan Dela Cruz',  plan: '—',                                 target: '—',            status: 'Pending' },
];

export const CERT_ROWS = [
  { id: 1, name: 'Alex Villanueva', attended: '3 of 3', feedback: 'Done',    reentry: 'Submitted', cert: 'Released' },
  { id: 2, name: 'Maria Santos',    attended: '3 of 3', feedback: 'Done',    reentry: 'Submitted', cert: 'Eligible' },
  { id: 3, name: 'Juan Dela Cruz',  attended: '2 of 3', feedback: 'Done',    reentry: 'Pending',   cert: 'Not eligible' },
  { id: 4, name: 'Liza Ramos',      attended: '3 of 3', feedback: 'Pending', reentry: 'Submitted', cert: 'Not eligible' },
];
