// App state saved on the phone with AsyncStorage (see storage/). No backend.
// - setups: sets/reps per exercise (kept)        - stretchSetups: rounds/time per stretch (kept)
// - daily: ticks and swaps (reset every new day) - prefs: timer, reminder, theme and setup settings
// - profile: welcome setup answers               - week: gym/swim days, times and workout order
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import type { ExerciseSetup, PlanDay, StretchSetup } from "./data/types";
import { localDate } from "./logic";
import { DEFAULT_WEEK, buildDays, type WeekSetup } from "./logic/plan";
import { DEFAULT_PROFILE, type Profile } from "./logic/profile";
import { KEYS, loadMany, migrate, save } from "./storage";

interface Daily { date: string; ticks: Record<string, boolean>; swaps: Record<string, number>; quoteOffset?: number }
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
}

interface Store {
  ready: boolean;
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
  setSetup: (key: string, s: ExerciseSetup | null) => void;
  setStretchSetup: (key: string, s: StretchSetup | null) => void;
  setTick: (id: string, on: boolean) => void;
  setSwap: (key: string, index: number) => void;
  resetDay: (dayKey: string) => void;
  setPrefs: (p: Partial<Prefs>) => void;
  setProfile: (p: Partial<Profile>) => void;
  setWeek: (w: Partial<WeekSetup>) => void;
  toggleFavQuote: (id: string) => void;
  nextQuote: () => void;
}

const Ctx = createContext<Store | null>(null);
const DEFAULT_PREFS: Prefs = { bigTimer: true, reminders: false, hour: 19, minute: 0, theme: "system", onboarded: false, waterReminders: true, lastBackup: null, backupReminder: false,
  timerAlerts: true, passAlerts: true, snackReminder: false, quietStart: 22 * 60 + 30, quietEnd: 7 * 60,
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
  const dailyRef = useRef(daily);
  useEffect(() => { dailyRef.current = daily; }, [daily]);

  useEffect(() => {
    (async () => {
      try {
        await migrate();
        const s = await loadMany([KEYS.setups, KEYS.stretch, KEYS.daily, KEYS.prefs, KEYS.profile, KEYS.week, KEYS.quotes]);
        if (s[KEYS.setups]) setSetups(s[KEYS.setups] as Record<string, ExerciseSetup>);
        if (s[KEYS.stretch]) setStretchSetups(s[KEYS.stretch] as Record<string, StretchSetup>);
        const dl = s[KEYS.daily] as Daily | undefined;
        if (dl) setDaily(dl.date === localDate() ? dl : freshDaily());
        if (s[KEYS.prefs]) setPrefsState({ ...DEFAULT_PREFS, ...(s[KEYS.prefs] as Partial<Prefs>) });
        if (s[KEYS.profile]) setProfileState({ ...DEFAULT_PROFILE, ...(s[KEYS.profile] as Partial<Profile>) });
        const w = s[KEYS.week] as Partial<WeekSetup> | undefined;
        const q = s[KEYS.quotes] as { favourites?: string[] } | undefined;
        if (q?.favourites) setFavQuotes(q.favourites);
        if (w) setWeekState({ ...DEFAULT_WEEK, ...w, days: { ...DEFAULT_WEEK.days, ...w.days }, order: w.order ?? {} });
      } catch {}
      setReady(true);
    })();
  }, []);

  // New day while the app stays open: clear ticks and swaps.
  useEffect(() => {
    const check = () => { if (dailyRef.current.date !== localDate()) { const f = freshDaily(); setDaily(f); save(KEYS.daily, f); } };
    const sub = AppState.addEventListener("change", (s) => s === "active" && check());
    const iv = setInterval(check, 60_000);
    return () => { sub.remove(); clearInterval(iv); };
  }, []);

  const updateDaily = useCallback((fn: (d: Daily) => Daily) => {
    setDaily((prev) => { const base = prev.date === localDate() ? prev : freshDaily(); const next = fn(base); save(KEYS.daily, next); return next; });
  }, []);

  const plan = useMemo(() => buildDays(week), [week]);

  const value = useMemo<Store>(() => ({
    ready, setups, stretchSetups, ticks: daily.ticks, swaps: daily.swaps, prefs, profile, week, plan, favQuotes, quoteOffset: daily.quoteOffset ?? 0,
    setSetup: (key, s) => setSetups((p) => { const n = { ...p }; if (s) n[key] = s; else delete n[key]; save(KEYS.setups, n); return n; }),
    setStretchSetup: (key, s) => setStretchSetups((p) => { const n = { ...p }; if (s) n[key] = s; else delete n[key]; save(KEYS.stretch, n); return n; }),
    setTick: (id, on) => updateDaily((d) => { const t = { ...d.ticks }; if (on) t[id] = true; else delete t[id]; return { ...d, ticks: t }; }),
    setSwap: (key, index) => updateDaily((d) => { const s = { ...d.swaps }; if (index) s[key] = index; else delete s[key]; return { ...d, swaps: s }; }),
    resetDay: (dayKey) => updateDaily((d) => ({ ...d, ticks: Object.fromEntries(Object.entries(d.ticks).filter(([k]) => !k.startsWith(dayKey))) })),
    setPrefs: (p) => setPrefsState((prev) => { const n = { ...prev, ...p }; save(KEYS.prefs, n); return n; }),
    setProfile: (p) => setProfileState((prev) => { const n = { ...prev, ...p }; save(KEYS.profile, n); return n; }),
    setWeek: (w) => setWeekState((prev) => { const n = { ...prev, ...w }; save(KEYS.week, n); return n; }),
    toggleFavQuote: (id) => setFavQuotes((prev) => { const n = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]; save(KEYS.quotes, { favourites: n }); return n; }),
    nextQuote: () => updateDaily((d) => ({ ...d, quoteOffset: (d.quoteOffset ?? 0) + 1 })),
  }), [ready, setups, stretchSetups, daily, prefs, profile, week, plan, favQuotes, updateDaily]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
