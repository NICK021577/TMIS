import { useCallback, useMemo, useState } from 'react';
import { StoreContext } from './storeContext';
import { ACTIVITIES, AGENCY, AGENCY_ROLES_SEED, AGENCY_USERS, BUDGET_ITEMS, CATEGORIES_SEED, PLANS } from '../data/mockData';
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

  const uid = useCallback(() => { setNextId((n) => n + 1); return nextId; }, [nextId]);

  const addItem = useCallback((item) => setItems((l) => [...l, { ...item, id: Date.now() + Math.random() }]), []);
  const removeItem = useCallback((id) => setItems((l) => l.filter((i) => i.id !== id)), []);
  const recordActual = useCallback((id, patch) => setItems((l) => l.map((i) => (i.id === id ? { ...i, ...patch } : i))), []);

  const addPlan = useCallback((plan) => setPlans((l) => [...l, { ...plan, id: Date.now() }]), []);
  const removePlan = useCallback((id) => setPlans((l) => l.filter((p) => p.id !== id)), []);
  const setEventPublished = useCallback((key, value) => setPublished((p) => ({ ...p, [key]: value })), []);

  const createActivity = useCallback((act, budget) => {
    const id = Date.now();
    setActivities((l) => [{ ...act, id }, ...l]);
    setItems((l) => [...l, ...budget.map((b, i) => ({ ...b, id: id + i + 1, activityId: id }))]);
    return id;
  }, []);

  const value = useMemo(() => ({
    activities, items, plans, published, annual, notify, uid,
    profile, setProfile, brand, setBrand, logo, setLogo, categories, setCategories, users, setUsers, roles, setRoles,
    addItem, removeItem, recordActual, addPlan, removePlan, setEventPublished, setAnnual, createActivity,
  }), [activities, items, plans, published, annual, notify, uid, profile, brand, logo, categories, users, roles, addItem, removeItem, recordActual, addPlan, removePlan, setEventPublished, createActivity]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
