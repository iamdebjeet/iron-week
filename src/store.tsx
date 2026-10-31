// App state saved on the phone with AsyncStorage (see storage/). No backend.
// - setups: sets/reps per exercise (kept)        - stretchSetups: rounds/time per stretch (kept)
// - daily: ticks, swaps and water (reset daily)  - prefs: timer, reminder, theme, water and setup settings
// - profile: welcome setup answers               - week: gym/swim days, times and workout order
// - history: one summary per finished day, written when the day's ticks reset
// - lifts: ticked sets with their kg, per exercise per date (also written at the day reset)
// - bodyWeight: logged weights, one per date
// - foods: custom and scanned foods, saved meals and recently used foods (today's log lives in daily)
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import type { ExerciseSetup, PlanDay, StretchSetup } from "./data/types";
import { localDate } from "./logic";
import { type History, addToHistory, summarizeDay, weekdayOf } from "./logic/history";
import { type Lifts, addSessions, isBodyweight, prOf, sessionsFromTicks, volume } from "./logic/lifts";
import { DEFAULT_WEEK, buildDays, type WeekSetup } from "./logic/plan";
import { DEFAULT_PROFILE, type Profile } from "./logic/profile";
import { DEFAULT_WATER, type WaterEntry, type WaterSettings } from "./logic/water";
import { type DietEntry, type SavedMeal, sum } from "./logic/diet";
import type { Food } from "./data/foods";
import { type Walk, burnedToday, walkMinutes, DEFAULT_STEP_GOAL } from "./logic/activity";
import { activeMinutes } from "./logic/history";
import { KEYS, loadMany, migrate, save } from "./storage";

interface Daily { date: string; ticks: Record<string, boolean>; swaps: Record<string, number>; quoteOffset?: number; water?: WaterEntry[]; waterSnooze?: number;
  /** kg per ticked-set id (bodyweight moves: added kg) */
  kg?: Record<string, number>;
  diet?: DietEntry[];
  /** Health Connect steps so far today, and active kcal from a watch (if any) */
  steps?: number; watchKcal?: number | null;
  walks?: Walk[];
  /** Session timer seconds used today (for the calorie estimate) */
  sessionSec?: number }
export interface FoodLib { custom: Food[]; saved: SavedMeal[]; recents: string[] }
const EMPTY_LIB: FoodLib = { custom: [], saved: [], recents: [] };
export interface BodyEntry { date: string; kg: number }
export type ThemePref = "system" | "light" | "dark";
export interface Prefs {
  bigTimer: boolean; reminders: boolean; hour: number; minute: number; theme: ThemePref;
  /** Welcome setup finished or skipped */
  onboarded: boolean;
  waterReminders: boolean;
  /** ISO time of the last backup export (or of the backup that was restored) */
  lastBackup: string | null;
  /** Monthly "Back up your data" reminder */
  backupReminder: boolean;
  /** Alerts when a rest / stretch / swim step ends */
  timerAlerts: boolean;
  passAlerts: boolean;
  /** "Pre-gym snack" 90 min before the gym on gym days */
  snackReminder: boolean;
  /** Quiet hours in minutes after midnight (no reminders; timers still alert while a session runs) */
  quietStart: number;
  quietEnd: number;
  water: WaterSettings;
  /** First day of training (week numbers and the streak start here) */
  startDate: string | null;
  /** Light week already dismissed (week number) */
  lightWeekSeen: number;
  stepGoal: number;
  /** The Health Connect explanation was shown */
  healthAsked: boolean;
  /** Download app updates quietly and apply them when you leave the app */
  autoUpdate: boolean;
}

interface Store {
  ready: boolean;
  /** Today's local date (YYYY-MM-DD), the day the ticks belong to */
  today: string;
  setups: Record<string, ExerciseSetup>;
  stretchSetups: Record<string, StretchSetup>;
  ticks: Record<string, boolean>;
  swaps: Record<string, number>;
  prefs: Prefs;
  profile: Profile;
  week: WeekSetup;
  /** The 7 days Mon–Sun built from `week` */
  plan: PlanDay[];
  /** Saved quote ids, newest first */
  favQuotes: string[];
  /** "↻ another" presses today */
  quoteOffset: number;
  /** Today's water log, oldest first */
  water: WaterEntry[];
  /** "Snooze 30 min" from a water reminder: next reminder at this time (ms) */
  waterSnooze: number | null;
  history: History;
  kg: Record<string, number>;
  lifts: Lifts;
  body: BodyEntry[];
  /** Today's diet log */
  diet: DietEntry[];
  foodLib: FoodLib;
  steps: number | null;
  watchKcal: number | null;
  walks: Walk[];
  sessionSec: number;
  setSetup: (key: string, s: ExerciseSetup | null) => void;
  setStretchSetup: (key: string, s: StretchSetup | null) => void;
  setTick: (id: string, on: boolean) => void;
  setSwap: (key: string, index: number) => void;
  resetDay: (dayKey: string) => void;
  setPrefs: (p: Partial<Prefs>) => void;
  setWater: (w: Partial<WaterSettings>) => void;
  setProfile: (p: Partial<Profile>) => void;
  setWeek: (w: Partial<WeekSetup>) => void;
  toggleFavQuote: (id: string) => void;
  nextQuote: () => void;
  addWater: (ml: number) => void;
  undoWater: () => void;
  snoozeWater: (minutes: number) => void;
  setKg: (tickId: string, kg: number | null) => void;
  /** Log today's body weight (also updates the profile) */
  logWeight: (kg: number) => void;
  addDiet: (items: Omit<DietEntry, "id" | "at">[]) => void;
  removeDiet: (id: string) => void;
  addCustomFood: (f: Food) => void;
  saveMeal: (m: Omit<SavedMeal, "id">) => void;
  deleteSavedMeal: (id: string) => void;
  setSteps: (steps: number, watchKcal: number | null) => void;
  addWalk: (w: Walk) => void;
  setSessionSec: (sec: number) => void;
}

const Ctx = createContext<Store | null>(null);
const DEFAULT_PREFS: Prefs = { bigTimer: true, reminders: false, hour: 19, minute: 0, theme: "system", onboarded: false, waterReminders: true, lastBackup: null, backupReminder: false,
  timerAlerts: true, passAlerts: true, snackReminder: false, quietStart: 22 * 60 + 30, quietEnd: 7 * 60, water: DEFAULT_WATER,
  startDate: null, lightWeekSeen: 0, stepGoal: DEFAULT_STEP_GOAL, healthAsked: false, autoUpdate: false,
};

const totals = (diet: DietEntry[]) => {
  const t = sum(diet.map((e) => e.n));
  return { kcal: t.kcal, protein: t.protein, carbs: t.carbs, fat: t.fat, fibre: t.fibre, sodium: t.sodium };
};

const freshDaily = (): Daily => ({ date: localDate(), ticks: {}, swaps: {} });

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [setups, setSetups] = useState<Record<string, ExerciseSetup>>({});
  const [stretchSetups, setStretchSetups] = useState<Record<string, StretchSetup>>({});
  const [daily, setDaily] = useState<Daily>(freshDaily);
  const [prefs, setPrefsState] = useState<Prefs>(DEFAULT_PREFS);
  const [profile, setProfileState] = useState<Profile>(DEFAULT_PROFILE);
  const [week, setWeekState] = useState<WeekSetup>(DEFAULT_WEEK);
  const [favQuotes, setFavQuotes] = useState<string[]>([]);
  const [history, setHistory] = useState<History>({});
  const [lifts, setLifts] = useState<Lifts>({});
  const [body, setBody] = useState<BodyEntry[]>([]);
  const [foodLib, setFoodLib] = useState<FoodLib>(EMPTY_LIB);
  const plan = useMemo(() => buildDays(week), [week]);
  const updateLib = useCallback((fn: (l: FoodLib) => FoodLib) => setFoodLib((l) => { const n = fn(l); save(KEYS.foods, n); return n; }), []);

  // What archiving a finished day needs, kept current for the midnight check.
  const ctx = useRef({ daily, setups, stretchSetups, plan, baseWaterMl: prefs.water.baseGoalMl, weightKg: profile.weightKg });
  useEffect(() => {
    ctx.current = { daily, setups, stretchSetups, plan, baseWaterMl: prefs.water.baseGoalMl, weightKg: profile.weightKg };
  }, [daily, setups, stretchSetups, plan, prefs.water.baseGoalMl, profile.weightKg]);

  /** Save a finished day: its summary into history and its ticked sets (with kg) into the lift log */
  const archive = useCallback((old: Daily, c: Omit<typeof ctx.current, "daily">) => {
    const day = c.plan.find((d) => d.key === weekdayOf(old.date));
    if (!day) return;
    const sessions = sessionsFromTicks({ date: old.date, days: c.plan, ticks: old.ticks, kg: old.kg ?? {}, swaps: old.swaps, setups: c.setups });
    setLifts((prev) => {
      const prs = Object.entries(sessions).filter(([name, s]) => {
        const before = (prev[name] ?? []).filter((x) => x.date < s.date);
        return s.sets.some((set) => prOf(before, set, isBodyweight(name)));
      }).length;
      const base = summarizeDay({ date: old.date, day, ticks: old.ticks, water: old.water ?? [], setups: c.setups, stretchSetups: c.stretchSetups, baseWaterMl: c.baseWaterMl });
      const walks = old.walks ?? [];
      const est = burnedToday({ weightKg: c.weightKg, walks, ...activeMinutes({ day, summary: base, ticks: old.ticks, stretchSetups: c.stretchSetups, sessionSec: old.sessionSec }) });
      const summary = { ...base, prs, volumeKg: volume(sessions), diet: totals(old.diet ?? []), steps: old.steps ?? 0,
        walkMin: walks.reduce((a, w) => a + walkMinutes(w), 0), kcal: old.watchKcal ?? est.total };
      setHistory((h) => { const n = addToHistory(h, summary); save(KEYS.history, n); return n; });
      const n = addSessions(prev, sessions); save(KEYS.lifts, n); return n;
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await migrate();
        const s = await loadMany([KEYS.setups, KEYS.stretch, KEYS.daily, KEYS.prefs, KEYS.profile, KEYS.week, KEYS.quotes, KEYS.history, KEYS.lifts, KEYS.body, KEYS.foods]);
        const loadedSetups = (s[KEYS.setups] ?? {}) as Record<string, ExerciseSetup>;
        const loadedStretch = (s[KEYS.stretch] ?? {}) as Record<string, StretchSetup>;
        setSetups(loadedSetups);
        setStretchSetups(loadedStretch);
        const p = s[KEYS.prefs] as Partial<Prefs> | undefined;
        const loadedHistory = (s[KEYS.history] ?? {}) as History;
        const loadedPrefs: Prefs = { ...DEFAULT_PREFS, ...p, water: { ...DEFAULT_WATER, ...p?.water } };
        // Older installs have no start date: use the first day in history, else today.
        if (!loadedPrefs.startDate) { loadedPrefs.startDate = Object.keys(loadedHistory).sort()[0] ?? localDate(); save(KEYS.prefs, loadedPrefs); }
        setPrefsState(loadedPrefs);
        if (s[KEYS.profile]) setProfileState({ ...DEFAULT_PROFILE, ...(s[KEYS.profile] as Partial<Profile>) });
        const w = s[KEYS.week] as Partial<WeekSetup> | undefined;
        const loadedWeek: WeekSetup = w ? { ...DEFAULT_WEEK, ...w, days: { ...DEFAULT_WEEK.days, ...w.days }, order: w.order ?? {} } : DEFAULT_WEEK;
        setWeekState(loadedWeek);
        const q = s[KEYS.quotes] as { favourites?: string[] } | undefined;
        if (q?.favourites) setFavQuotes(q.favourites);
        setHistory(loadedHistory);
        if (s[KEYS.lifts]) setLifts(s[KEYS.lifts] as Lifts);
        if (s[KEYS.body]) setBody(s[KEYS.body] as BodyEntry[]);
        if (s[KEYS.foods]) setFoodLib({ ...EMPTY_LIB, ...(s[KEYS.foods] as Partial<FoodLib>) });
        const dl = s[KEYS.daily] as Daily | undefined;
        if (dl && dl.date === localDate()) setDaily(dl);
        else if (dl) {
          // Opened on a new day: save the last day it was used before starting fresh.
          archive(dl, { setups: loadedSetups, stretchSetups: loadedStretch, plan: buildDays(loadedWeek), baseWaterMl: loadedPrefs.water.baseGoalMl, weightKg: (s[KEYS.profile] as Partial<Profile> | undefined)?.weightKg ?? null });
          const f = freshDaily(); setDaily(f); save(KEYS.daily, f);
        }
      } catch {}
      setReady(true);
    })();
  }, [archive]);

  // New day while the app stays open: save yesterday to history, then clear ticks, swaps and water.
  useEffect(() => {
    const check = () => {
      const c = ctx.current;
      if (c.daily.date === localDate()) return;
      archive(c.daily, c);
      const f = freshDaily(); setDaily(f); save(KEYS.daily, f);
    };
    const sub = AppState.addEventListener("change", (s) => s === "active" && check());
    const iv = setInterval(check, 60_000);
    return () => { sub.remove(); clearInterval(iv); };
  }, [archive]);

  const updateDaily = useCallback((fn: (d: Daily) => Daily) => {
    setDaily((prev) => {
      let base = prev;
      if (prev.date !== localDate()) { archive(prev, ctx.current); base = freshDaily(); }
      const next = fn(base); save(KEYS.daily, next); return next;
    });
  }, [archive]);

  const value = useMemo<Store>(() => ({
    ready, today: daily.date, setups, stretchSetups, ticks: daily.ticks, swaps: daily.swaps, prefs, profile, week, plan, favQuotes, quoteOffset: daily.quoteOffset ?? 0,
    water: daily.water ?? [], waterSnooze: daily.waterSnooze ?? null, history, kg: daily.kg ?? {}, lifts, body, diet: daily.diet ?? [], foodLib, steps: daily.steps ?? null, watchKcal: daily.watchKcal ?? null, walks: daily.walks ?? [], sessionSec: daily.sessionSec ?? 0,
    setSetup: (key, s) => setSetups((p) => { const n = { ...p }; if (s) n[key] = s; else delete n[key]; save(KEYS.setups, n); return n; }),
    setStretchSetup: (key, s) => setStretchSetups((p) => { const n = { ...p }; if (s) n[key] = s; else delete n[key]; save(KEYS.stretch, n); return n; }),
    setTick: (id, on) => updateDaily((d) => { const t = { ...d.ticks }; if (on) t[id] = true; else delete t[id]; return { ...d, ticks: t }; }),
    setSwap: (key, index) => updateDaily((d) => { const s = { ...d.swaps }; if (index) s[key] = index; else delete s[key]; return { ...d, swaps: s }; }),
    resetDay: (dayKey) => updateDaily((d) => ({ ...d, ticks: Object.fromEntries(Object.entries(d.ticks).filter(([k]) => !k.startsWith(dayKey))) })),
    setPrefs: (p) => setPrefsState((prev) => { const n = { ...prev, ...p }; save(KEYS.prefs, n); return n; }),
    setWater: (w) => setPrefsState((prev) => { const n = { ...prev, water: { ...prev.water, ...w } }; save(KEYS.prefs, n); return n; }),
    setProfile: (p) => setProfileState((prev) => { const n = { ...prev, ...p }; save(KEYS.profile, n); return n; }),
    setWeek: (w) => setWeekState((prev) => { const n = { ...prev, ...w }; save(KEYS.week, n); return n; }),
    toggleFavQuote: (id) => setFavQuotes((prev) => { const n = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]; save(KEYS.quotes, { favourites: n }); return n; }),
    nextQuote: () => updateDaily((d) => ({ ...d, quoteOffset: (d.quoteOffset ?? 0) + 1 })),
    addWater: (ml) => updateDaily((d) => ({ ...d, water: [...(d.water ?? []), { at: Date.now(), ml }], waterSnooze: undefined })),
    undoWater: () => updateDaily((d) => ({ ...d, water: (d.water ?? []).slice(0, -1) })),
    snoozeWater: (minutes) => updateDaily((d) => ({ ...d, waterSnooze: Date.now() + minutes * 60_000 })),
    setKg: (id, kg) => updateDaily((d) => { const k = { ...d.kg }; if (kg === null) delete k[id]; else k[id] = kg; return { ...d, kg: k }; }),
    addDiet: (items) => {
      const at = Date.now();
      updateDaily((d) => ({ ...d, diet: [...(d.diet ?? []), ...items.map((x, i) => ({ ...x, id: `${at}-${i}`, at }))] }));
      updateLib((l) => ({ ...l, recents: [...new Set([...items.map((x) => x.foodId).reverse(), ...l.recents])].slice(0, 15) }));
    },
    removeDiet: (id) => updateDaily((d) => ({ ...d, diet: (d.diet ?? []).filter((x) => x.id !== id) })),
    addCustomFood: (f) => updateLib((l) => ({ ...l, custom: [f, ...l.custom.filter((x) => x.id !== f.id)] })),
    saveMeal: (m) => updateLib((l) => ({ ...l, saved: [{ ...m, id: String(Date.now()) }, ...l.saved] })),
    deleteSavedMeal: (id) => updateLib((l) => ({ ...l, saved: l.saved.filter((x) => x.id !== id) })),
    setSteps: (steps, watchKcal) => updateDaily((d) => (d.steps === steps && d.watchKcal === watchKcal ? d : { ...d, steps, watchKcal })),
    addWalk: (w) => updateDaily((d) => ({ ...d, walks: [...(d.walks ?? []), w] })),
    setSessionSec: (sec) => updateDaily((d) => ({ ...d, sessionSec: Math.max(d.sessionSec ?? 0, Math.round(sec)) })),
    logWeight: (kg) => {
      const date = localDate();
      setBody((prev) => { const n = [...prev.filter((e) => e.date !== date), { date, kg }].sort((a, b) => (a.date < b.date ? -1 : 1)); save(KEYS.body, n); return n; });
      setProfileState((prev) => { const n = { ...prev, weightKg: kg }; save(KEYS.profile, n); return n; });
    },
  }), [ready, setups, stretchSetups, daily, prefs, profile, week, plan, favQuotes, history, lifts, body, foodLib, updateDaily, updateLib]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
