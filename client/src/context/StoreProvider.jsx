import { useCallback, useMemo, useState } from 'react';
import { StoreContext } from './storeContext';
import { ACTIVITIES, AGENCY, BUDGET_ITEMS, CATEGORIES_SEED, FUNDING_SEED, INVITES, NOTIFICATIONS, PARTNERS_SEED, PEOPLE, PLANS } from '../data/mockData';
import { AGENCY_ROLES, DEFAULT_DETAILS, DOCUMENTS, EMPTY_DETAILS, FEEDBACK_FORM, RESOURCES, SESSIONS, STAFF_DAYS } from '../data/workspaceData';
import { BRAND_PRESETS } from '../lib/brand';

const PRRI_ACTIVITIES = ACTIVITIES.filter((a) => a.tenant === 'PRRI');
const PRRI_ITEMS = BUDGET_ITEMS.filter((i) => PRRI_ACTIVITIES.some((a) => a.id === i.activityId));

export function StoreProvider({ children, notify }) {
  const [activities, setActivities] = useState(PRRI_ACTIVITIES);
  const [items, setItems] = useState(PRRI_ITEMS);
  const [plans, setPlans] = useState(PLANS);
  const [published, setPublished] = useState({ a1: true, a2: true, a3: true, p2: true, p4: true });
  const [annual, setAnnual] = useState(600000);
  const [nextId, setNextId] = useState(100);

  // Agency settings
  const [profile, setProfile] = useState({
    name: AGENCY.name, shortName: AGENCY.shortName, mission: AGENCY.mission, vision: AGENCY.vision,
    values: AGENCY.values.join('; '), mandate: AGENCY.mandate,
    description: 'Research, training, and extension programs supporting agricultural communities and partner organizations.',
  });
  const [brand, setBrand] = useState({ preset: 'unifyle', ...BRAND_PRESETS[0], tint: false });
  const [logo, setLogo] = useState(null);
  const [cover, setCover] = useState(null);
  const [categories, setCategories] = useState(CATEGORIES_SEED.map((c) => ({ ...c, archived: false })));
  // Partner directory and funding sources. Partners are plain names, they need no account here.
  const [partners, setPartners] = useState(PARTNERS_SEED);
  const [fundingSources, setFundingSources] = useState(FUNDING_SEED);
  // The partner agencies of each activity: { activityId: [{ id, partnerId, role, notes }] }. Seeded activities start from the demo rows.
  const [activityPartners, setActivityPartners] = useState({});

  // Participant registry. An invited person has no name or affiliation until they finish their profile on the mobile app.
  const [people, setPeople] = useState(PEOPLE);
  const [invites, setInvites] = useState(INVITES);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  // Activity workspace content (the demo content is shared by every activity)
  const [sessions, setSessions] = useState(SESSIONS);
  const [documents, setDocuments] = useState(DOCUMENTS);
  const [resources, setResources] = useState(RESOURCES);
  // Details written for an activity (description, lead, topics, program flow file, objectives…). Seeded activities start from the demo content.
  const [details, setDetailsState] = useState({});
  // The days of the activity (with the staff assigned to each). Attendance, feedback and sessions all read this list.
  const [staffDays, setStaffDays] = useState(STAFF_DAYS);
  // After-activity reports by activity id: { versions: [...], current }
  const [reports, setReports] = useState({});
  // Paper attendance sheets attached to an activity: { activityId: [{ id, file, size, mime, url, day, covers, note, uploaded }] }
  const [attendanceSheets, setAttendanceSheets] = useState({ 1: [{ id: 1, file: 'Day1_AM_signed_attendance_sheet.pdf', size: '640 KB', mime: 'application/pdf', day: 1, covers: 'AM', note: 'Signed sheet from the registration desk', uploaded: 'Jun 17, 2025' }] });
  // One feedback form per day
  const [feedbackForms, setFeedbackForms] = useState([{ id: 1, day: 1, questions: FEEDBACK_FORM }, { id: 2, day: 2, questions: FEEDBACK_FORM.map((q) => ({ ...q })) }]);

  const uid = useCallback(() => { setNextId((n) => n + 1); return nextId; }, [nextId]);

  const addItem = useCallback((item) => setItems((l) => [...l, { ...item, id: Date.now() + Math.random() }]), []);
  const removeItem = useCallback((id) => setItems((l) => l.filter((i) => i.id !== id)), []);
  const recordActual = useCallback((id, patch) => setItems((l) => l.map((i) => (i.id === id ? { ...i, ...patch } : i))), []);

  const addPlan = useCallback((plan) => setPlans((l) => [...l, { ...plan, id: Date.now() }]), []);
  const removePlan = useCallback((id) => setPlans((l) => l.filter((p) => p.id !== id)), []);
  const setEventPublished = useCallback((key, value) => setPublished((p) => ({ ...p, [key]: value })), []);

  const getDetails = useCallback((a) => ({ ...(a.id < 100 ? DEFAULT_DETAILS : EMPTY_DETAILS), ...(details[a.id] ?? {}) }), [details]);
  const setDetails = useCallback((id, patch) => setDetailsState((d) => ({ ...d, [id]: { ...(d[id] ?? {}), ...patch } })), []);
  const restoreDetails = useCallback((id, snap) => setDetailsState((d) => { const n = { ...d }; if (snap) n[id] = snap; else delete n[id]; return n; }), []);
  const updateActivity = useCallback((id, patch) => setActivities((l) => l.map((a) => (a.id === id ? { ...a, ...patch } : a))), []);

  const partnersOf = useCallback((activityId) => activityPartners[activityId] ?? (activityId < 100 ? AGENCY_ROLES : []), [activityPartners]);
  const setPartnersOf = useCallback((activityId, update) => setActivityPartners((m) => {
    const current = m[activityId] ?? (activityId < 100 ? AGENCY_ROLES : []);
    return { ...m, [activityId]: typeof update === 'function' ? update(current) : update };
  }), []);

  /** Adds a partner by name, or returns the one that already has that name (so "DA Region IX" is never split in two). */
  const addPartner = useCallback((name, type) => {
    const clean = name.trim();
    const found = partners.find((p) => p.name.toLowerCase() === clean.toLowerCase());
    if (found) { if (found.archived) setPartners((l) => l.map((p) => (p.id === found.id ? { ...p, archived: false } : p))); return found.id; }
    const id = Date.now() + Math.random();
    setPartners((l) => [...l, { id, name: clean, type, archived: false }]);
    return id;
  }, [partners]);

  /** Renaming a funding source also renames it on every budget item, plan and activity that uses it. */
  const renameFunding = useCallback((id, name) => {
    const old = fundingSources.find((f) => f.id === id)?.name;
    if (!old || old === name) return;
    setFundingSources((l) => l.map((f) => (f.id === id ? { ...f, name } : f)));
    setItems((l) => l.map((i) => (i.funding === old ? { ...i, funding: name } : i)));
    setPlans((l) => l.map((p) => (p.funding === old ? { ...p, funding: name } : p)));
    setDetailsState((d) => Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v.funding === old ? { ...v, funding: name } : v])));
  }, [fundingSources]);

  const fundingNames = useMemo(() => fundingSources.filter((f) => !f.archived).map((f) => f.name), [fundingSources]);
  const allFundingNames = useMemo(() => fundingSources.map((f) => f.name), [fundingSources]);

  const createActivity = useCallback((act, budget, det, partnerRows) => {
    const id = Date.now();
    if (det) setDetailsState((d) => ({ ...d, [id]: det }));
    if (partnerRows) setActivityPartners((m) => ({ ...m, [id]: partnerRows.map((r, i) => ({ id: id + i, notes: '', ...r })) }));
    setActivities((l) => [{ ...act, id }, ...l]);
    setItems((l) => [...l, ...budget.map((b, i) => ({ ...b, id: id + i + 1, activityId: id }))]);
    return id;
  }, []);

  const invitePerson = useCallback(({ email, category, activityId }) => {
    const key = email.trim().toLowerCase();
    const existing = people.find((p) => p.email.toLowerCase() === key);
    if (existing) {
      if (activityId != null && !existing.activityIds?.includes(activityId)) {
        setPeople((l) => l.map((p) => (p === existing ? { ...p, activityIds: [...(p.activityIds ?? []), activityId] } : p)));
      }
      return 'exists';
    }
    setPeople((l) => [...l, {
      id: `inv-${Date.now()}`, name: '', email: email.trim(), agency: '', category, location: '', status: 'Invited',
      activities: 0, attendance: '—', activityIds: activityId == null ? [] : [activityId],
      registered: 'Invited today', source: 'Added by admin',
    }]);
    return 'invited';
  }, [people]);

  const value = useMemo(() => ({
    activities, items, plans, published, annual, notify, uid,
    people, invitePerson, invites, setInvites, notifications, setNotifications, sessions, setSessions, documents, setDocuments, resources, setResources, staffDays, setStaffDays, feedbackForms, setFeedbackForms, reports, setReports, attendanceSheets, setAttendanceSheets, details, getDetails, setDetails, restoreDetails, updateActivity, profile, setProfile, brand, setBrand, logo, setLogo, cover, setCover, categories, setCategories,
    partners, setPartners, addPartner, fundingSources, setFundingSources, renameFunding, fundingNames, allFundingNames, partnersOf, setPartnersOf,
    addItem, removeItem, recordActual, addPlan, removePlan, setEventPublished, setAnnual, createActivity,
  }), [activities, items, plans, published, annual, notify, uid, people, invitePerson, invites, notifications, sessions, documents, resources, staffDays, feedbackForms, reports, attendanceSheets, details, getDetails, setDetails, restoreDetails, updateActivity, profile, brand, logo, cover, categories, partners, addPartner, fundingSources, renameFunding, fundingNames, allFundingNames, partnersOf, setPartnersOf, addItem, removeItem, recordActual, addPlan, removePlan, setEventPublished, createActivity]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
