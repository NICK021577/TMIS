import { useCallback, useMemo, useState } from 'react';
import { StoreContext } from './storeContext';
import { ACTIVITIES, AGENCY, AGENCY_ROLES_SEED, AGENCY_USERS, BUDGET_ITEMS, CATEGORIES_SEED, INVITES, NOTIFICATIONS, PEOPLE, PLANS } from '../data/mockData';
import { DEFAULT_DETAILS, DOCUMENTS, EMPTY_DETAILS, FEEDBACK_FORM, RESOURCES, SESSIONS, STAFF_DAYS } from '../data/workspaceData';
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
  const [categories, setCategories] = useState(CATEGORIES_SEED.map((c) => ({ ...c, archived: false })));
  const [users, setUsers] = useState(AGENCY_USERS);
  const [roles, setRoles] = useState(AGENCY_ROLES_SEED);

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

  const createActivity = useCallback((act, budget, det) => {
    const id = Date.now();
    if (det) setDetailsState((d) => ({ ...d, [id]: det }));
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
    people, invitePerson, invites, setInvites, notifications, setNotifications, sessions, setSessions, documents, setDocuments, resources, setResources, staffDays, setStaffDays, feedbackForms, setFeedbackForms, details, getDetails, setDetails, restoreDetails, updateActivity, profile, setProfile, brand, setBrand, logo, setLogo, categories, setCategories, users, setUsers, roles, setRoles,
    addItem, removeItem, recordActual, addPlan, removePlan, setEventPublished, setAnnual, createActivity,
  }), [activities, items, plans, published, annual, notify, uid, people, invitePerson, invites, notifications, sessions, documents, resources, staffDays, feedbackForms, details, getDetails, setDetails, restoreDetails, updateActivity, profile, brand, logo, categories, users, roles, addItem, removeItem, recordActual, addPlan, removePlan, setEventPublished, createActivity]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
