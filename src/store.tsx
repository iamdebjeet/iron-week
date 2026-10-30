// App state saved on the phone with AsyncStorage. No backend.
// - setups: sets/reps per exercise (kept)        - stretchSetups: rounds/time per stretch (kept)
// - daily: ticks and swaps (reset every new day) - prefs: big timer, reminder and theme settings
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ExerciseSetup, StretchSetup } from "./data/types";
import { localDate } from "./logic";

interface Daily { date: string; ticks: Record<string, boolean>; swaps: Record<string, number> }
export type ThemePref = "system" | "light" | "dark";
export interface Prefs { bigTimer: boolean; reminders: boolean; hour: number; minute: number; theme: ThemePref }

interface Store {
  ready: boolean;
  setups: Record<string, ExerciseSetup>;
  stretchSetups: Record<string, StretchSetup>;
  ticks: Record<string, boolean>;
  swaps: Record<string, number>;
  prefs: Prefs;
  setSetup: (key: string, s: ExerciseSetup | null) => void;
  setStretchSetup: (key: string, s: StretchSetup | null) => void;
  setTick: (id: string, on: boolean) => void;
  setSwap: (key: string, index: number) => void;
  resetDay: (dayKey: string) => void;
  setPrefs: (p: Partial<Prefs>) => void;
}

const Ctx = createContext<Store | null>(null);
const KEYS = { setups: "setups", stretch: "stretchSetups", daily: "daily", prefs: "prefs" };
const DEFAULT_PREFS: Prefs = { bigTimer: true, reminders: false, hour: 19, minute: 0, theme: "system" };

const save = (k: string, v: unknown) => AsyncStorage.setItem(k, JSON.stringify(v)).catch(() => {});
const freshDaily = (): Daily => ({ date: localDate(), ticks: {}, swaps: {} });

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [setups, setSetups] = useState<Record<string, ExerciseSetup>>({});
  const [stretchSetups, setStretchSetups] = useState<Record<string, StretchSetup>>({});
  const [daily, setDaily] = useState<Daily>(freshDaily);
  const [prefs, setPrefsState] = useState<Prefs>(DEFAULT_PREFS);
  const dailyRef = useRef(daily);
  useEffect(() => { dailyRef.current = daily; }, [daily]);

  useEffect(() => {
    (async () => {
      try {
        const [[, a], [, b], [, c], [, d]] = await AsyncStorage.multiGet([KEYS.setups, KEYS.stretch, KEYS.daily, KEYS.prefs]);
        if (a) setSetups(JSON.parse(a));
        if (b) setStretchSetups(JSON.parse(b));
        if (c) { const dl: Daily = JSON.parse(c); setDaily(dl.date === localDate() ? dl : freshDaily()); }
        if (d) setPrefsState({ ...DEFAULT_PREFS, ...JSON.parse(d) });
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

  const value = useMemo<Store>(() => ({
    ready, setups, stretchSetups, ticks: daily.ticks, swaps: daily.swaps, prefs,
    setSetup: (key, s) => setSetups((p) => { const n = { ...p }; if (s) n[key] = s; else delete n[key]; save(KEYS.setups, n); return n; }),
    setStretchSetup: (key, s) => setStretchSetups((p) => { const n = { ...p }; if (s) n[key] = s; else delete n[key]; save(KEYS.stretch, n); return n; }),
    setTick: (id, on) => updateDaily((d) => { const t = { ...d.ticks }; if (on) t[id] = true; else delete t[id]; return { ...d, ticks: t }; }),
    setSwap: (key, index) => updateDaily((d) => { const s = { ...d.swaps }; if (index) s[key] = index; else delete s[key]; return { ...d, swaps: s }; }),
    resetDay: (dayKey) => updateDaily((d) => ({ ...d, ticks: Object.fromEntries(Object.entries(d.ticks).filter(([k]) => !k.startsWith(dayKey))) })),
    setPrefs: (p) => setPrefsState((prev) => { const n = { ...prev, ...p }; save(KEYS.prefs, n); return n; }),
  }), [ready, setups, stretchSetups, daily, prefs, updateDaily]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
