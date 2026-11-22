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
  { id: 3, name: 'Dr. Marissa L. Flores', email: 'm.flores@prri.gov.ph', role: 'Committee',   duty: 'Chair, overall organizing',          status: 'Assigned' },
  { id: 4, name: 'Ms. Liza Navarro',      role: 'Committee',   duty: 'Registration, registration desk',    status: 'Assigned' },
  { id: 5, name: 'Mr. Paolo Dizon',       role: 'Committee',   duty: 'Logistics, venue, meals, transport', status: 'Pending' },
  { id: 6, name: 'Dr. Leonilo B. Castor', email: 'l.castor@prri.gov.ph', role: 'Resource person', duty: 'Session speaker', status: 'Assigned' },
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
  { id: 1, partnerId: 1, role: 'Implementing',  notes: 'Default role, plans and runs the activity' },
  { id: 2, partnerId: 2, role: 'Funding',       notes: 'GAA 2025 co-funding' },
  { id: 3, partnerId: 3, role: 'Collaborating', notes: 'Venue and logistics support' },
  { id: 4, partnerId: 4, role: 'Participating', notes: 'Nominates 12 farmer-participants' },
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
  {
    id: 1, name: 'Mario Dela Cruz', summary: 'Apply S/2 d3 tapping on 2 ha', timeline: 'By Aug 15, 2025', status: 'Submitted',
    details: 'I will convert two hectares of mature RRIM 600 trees from the old S/2 d2 tapping system to S/2 d3 after the 3-day training. I will first mark new tapping panels, retrain my two hired tappers using the demonstration I practiced on Day 2, and keep a weekly yield record in a notebook to compare against last year.',
    result: 'Lower bark consumption and steadier latex yield across the dry season.',
    support: 'Tapping knives for two tappers and a copy of the tapping guide.',
    doc: { file: 'Mario_DelaCruz_ReentryPlan.pdf', size: '0.3 MB' },
  },
  {
    id: 2, name: 'Maria Santos', summary: 'Cascade training for 15 neighbors', timeline: 'By Sep 01, 2025', status: 'Submitted',
    details: 'As an LGU agriculture technician I will hold two half-day sessions at the Ipil barangay hall for 15 neighboring rubber farmers. The sessions repeat the latex quality control and tapping basics from this training, using the handouts and the demo-farm photos. I will coordinate the venue with the barangay captain and record attendance.',
    result: '15 farmers trained, with an attendance sheet and photos submitted to PRRI.',
    support: 'Printed training handouts (15 copies) and one demonstration kit.',
    doc: { file: 'Cascade_Training_Schedule.docx', size: '0.2 MB' },
  },
  {
    id: 3, name: 'Liza Ramos', summary: 'Improve latex handling in my plantation', timeline: 'Flexible, no fixed date', status: 'Submitted',
    details: 'My plantation is small and the next tapping cycle only starts after the rainy season, so I cannot apply this right away. I plan to adopt the cup-lump handling and quality control steps once tapping resumes, and will share what I learn with my planters group.',
    result: 'Cleaner latex and fewer rejected lots at the buying station.',
    support: 'None needed for now.',
    doc: null,
  },
  { id: 4, name: 'Juan Dela Cruz', summary: '—', timeline: '—', status: 'Pending', details: '', result: '', support: '', doc: null },
];

export const CERT_ROWS = [
  { id: 1, name: 'Alex Villanueva', attended: '3 of 3', feedback: 'Done',    reentry: 'Submitted', output: 'Submitted', cert: 'Released' },
  { id: 2, name: 'Maria Santos',    attended: '3 of 3', feedback: 'Done',    reentry: 'Submitted', output: 'Submitted', cert: 'Eligible' },
  { id: 3, name: 'Mario Dela Cruz', attended: '3 of 3', feedback: 'Done',    reentry: 'Submitted', output: 'Submitted', cert: 'Eligible' },
  { id: 4, name: 'Juan Dela Cruz',  attended: '2 of 3', feedback: 'Done',    reentry: 'Pending',   output: 'Pending',   cert: 'Not eligible' },
  { id: 5, name: 'Liza Ramos',      attended: '3 of 3', feedback: 'Pending', reentry: 'Submitted', output: 'Submitted', cert: 'Not eligible' },
];

/* ── Staffing per day ───────────────────────────────────────────── */
export const STAFF_DAYS = [
  { n: 1, label: 'June 17, Tuesday', staff: [
    { id: 11, name: 'Ms. Joy Fabian',        role: 'Facilitator', duty: 'Day-to-day facilitation',            status: 'Assigned' },
    { id: 12, name: 'Dr. Marissa L. Flores', email: 'm.flores@prri.gov.ph', role: 'Committee',   duty: 'Chair, overall organizing',          status: 'Assigned' },
    { id: 13, name: 'Ms. Liza Navarro',      role: 'Committee',   duty: 'Registration desk',                  status: 'Assigned' },
    { id: 14, name: 'Mr. Paolo Dizon',       role: 'Committee',   duty: 'Logistics, venue, meals, transport', status: 'Pending' },
    { id: 15, name: 'Dr. Leonilo B. Castor', email: 'l.castor@prri.gov.ph', role: 'Resource person', duty: 'Rubber production session', status: 'Assigned' },
  ] },
  { n: 2, label: 'June 18, Wednesday', staff: [
    { id: 21, name: 'Ms. Joy Fabian',        role: 'Facilitator', duty: 'Day-to-day facilitation',            status: 'Assigned' },
    { id: 22, name: 'Mr. Ramil Ocampo',      role: 'Facilitator', duty: 'Demo farm sessions',                 status: 'Assigned' },
    { id: 23, name: 'Dr. Marissa L. Flores', email: 'm.flores@prri.gov.ph', role: 'Committee',   duty: 'Chair, overall organizing',          status: 'Assigned' },
    { id: 24, name: 'Mr. Paolo Dizon',       role: 'Committee',   duty: 'Field transport',                    status: 'Pending' },
  ] },
  { n: 3, label: 'June 19, Thursday', staff: [
    { id: 31, name: 'Ms. Joy Fabian',        role: 'Facilitator', duty: 'Day-to-day facilitation, closing',   status: 'Assigned' },
    { id: 32, name: 'Dr. Marissa L. Flores', email: 'm.flores@prri.gov.ph', role: 'Committee',   duty: 'Chair, closing program',             status: 'Assigned' },
    { id: 33, name: 'Ms. Liza Navarro',      role: 'Committee',   duty: 'Certificates and clearance',         status: 'Assigned' },
  ] },
];
export const STAFF_ROLES = ['Facilitator', 'Committee', 'Resource person', 'Support staff'];

/* ── Outputs ────────────────────────────────────────────────────── */
export const OUTCOME_TRACKING = [
  { id: 1, outcome: OUTCOMES[0], indicator: '24 of 36 participants report adopting the new tapping system', target: '30 of 36 participants', progress: 67, status: 'In progress', evidence: 'Follow-up call survey, Jul 2025' },
  { id: 2, outcome: OUTCOMES[1], indicator: '3 cascade sessions logged by participants',                  target: '10 cascade sessions',    progress: 30, status: 'In progress', evidence: 'Reentry plans and attendance sheets' },
];
export const OUTCOME_STATUS = ['Achieved', 'In progress', 'Not achieved'];

export const OUTPUT_SUBMISSIONS = [
  { id: 1, participant: 'Juan Dela Cruz',  title: 'Tapping panel after practicum',  type: 'Photo', file: 'tapping_panel.jpg',      size: '2.4 MB',  submitted: 'Jun 18, 2025', session: 'Rubber Tapping Techniques' },
  { id: 2, participant: 'Maria Santos',    title: 'Demo farm layout',                type: 'Photo', file: 'demo_farm.jpg',          size: '3.1 MB',  submitted: 'Jun 18, 2025', session: 'Demo Farm: Tapping Practicum' },
  { id: 3, participant: 'Mario Dela Cruz', title: 'Group output, tapping schedule',  type: 'File',  file: 'tapping_schedule.xlsx',  size: '0.1 MB',  submitted: 'Jun 18, 2025', session: 'Rubber Tapping Techniques' },
  { id: 4, participant: 'Liza Ramos',      title: 'Latex quality checklist',         type: 'File',  file: 'latex_qc_checklist.pdf', size: '0.4 MB',  submitted: 'Jun 17, 2025', session: 'Latex Handling and Quality Control' },
  { id: 5, participant: 'Alex Villanueva', title: 'Nursery plot sketch',             type: 'Photo', file: 'nursery_plot.png',       size: '1.8 MB',  submitted: 'Jun 17, 2025', session: 'Introduction to Rubber Production' },
  { id: 6, participant: 'Rogelio Mendoza', title: 'Tapping practice clip',           type: 'Video', file: 'tapping_practice.mp4',   size: '18.6 MB', submitted: 'Jun 18, 2025', session: 'Rubber Tapping Techniques' },
];

/* ── Feedback ───────────────────────────────────────────────────── */
export const FEEDBACK_FORM = [
  { id: 1, text: 'Overall, how satisfied are you with this activity?',             type: 'Rating',    required: true },
  { id: 2, text: 'The content was relevant to my work.',                           type: 'Rating',    required: true },
  { id: 3, text: 'The resource persons explained clearly and answered questions.', type: 'Rating',    required: true },
  { id: 4, text: 'The venue, meals and logistics were well organized.',            type: 'Rating',    required: true },
  { id: 5, text: 'Would you recommend this activity to others?',                   type: 'Choice',    required: true, options: ['Yes', 'Maybe', 'No'] },
  { id: 6, text: 'What was the most useful part?',                                 type: 'Open text', required: false },
  { id: 7, text: 'What should we improve next time?',                              type: 'Open text', required: false },
];
export const FEEDBACK_SUMMARY = {
  responses: 31, invited: 36, overall: 4.7, recommend: 94,
  distribution: [{ stars: 5, n: 21 }, { stars: 4, n: 8 }, { stars: 3, n: 2 }, { stars: 2, n: 0 }, { stars: 1, n: 0 }],
  criteria: [
    { label: 'Overall satisfaction',          value: 4.7 },
    { label: 'Relevance of content',          value: 4.6 },
    { label: 'Resource person effectiveness', value: 4.8 },
    { label: 'Venue and logistics',           value: 4.3 },
  ],
};
/**
 * Feedback collected per session, from the mobile app. dist = number of 5, 4, 3, 2 and 1 star ratings.
 * Sessions that have not happened yet have no entry.
 */
export const SESSION_FEEDBACK = {
  1: { eligible: 36, dist: [25, 5, 1, 0, 0], criteria: { content: 4.7, speaker: 4.9, venue: 4.4 }, recommend: 97 },
  2: { eligible: 36, dist: [16, 10, 3, 0, 0], criteria: { content: 4.5, speaker: 4.6, venue: 4.3 }, recommend: 93 },
  3: { eligible: 36, dist: [9, 2, 1, 0, 0],  criteria: { content: 4.8, speaker: 4.7, venue: 4.0 }, recommend: 92 },
};
export const FEEDBACK_COMMENTS = [
  { id: 1, name: 'Maria Santos',   session: 'Rubber Tapping Techniques',          rating: 5, date: 'Jun 18, 2025', comment: 'The demo on tapping depth was the most useful part. I can use it right away with the farmers I supervise.' },
  { id: 2, name: 'Anonymous',      session: 'Latex Handling and Quality Control', rating: 4, date: 'Jun 17, 2025', comment: 'Very clear explanation of latex grading. It would help to have printed handouts we can take home.' },
  { id: 3, name: 'Juan Dela Cruz', session: 'Introduction to Rubber Production',  rating: 5, date: 'Jun 17, 2025', comment: 'Dr. Castor explained the clone choices in a way that was easy to follow.' },
  { id: 4, name: 'Anonymous',      session: 'Rubber Tapping Techniques',          rating: 3, date: 'Jun 18, 2025', comment: 'The hall got warm in the afternoon and the sound was hard to hear from the back.' },
  { id: 5, name: 'Liza Ramos',     session: 'Latex Handling and Quality Control', rating: 4, date: 'Jun 17, 2025', comment: 'Good activity. Please add a session on pricing and where to sell.' },
];

/* ── Activity details: edited inside the activity ───────────────── */
export const DEFAULT_DETAILS = {
  description: WS.description, funding: WS.funding, lead: WS.lead, agencies: WS.agencies, audience: WS.audience,
  topics: WS.topics, documentation: WS.documentation,
  objectives: OBJECTIVES, outcomes: OUTCOMES,
  programFlow: { file: 'Program_Flow_2025.pdf', type: 'Program flow', size: '0.8 MB', uploaded: 'Jun 05, 2025' },
};
export const EMPTY_DETAILS = {
  description: '', funding: '', lead: '', agencies: '', audience: 'participants', topics: '', documentation: '',
  objectives: [], outcomes: [], programFlow: null,
};
