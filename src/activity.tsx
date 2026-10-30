// Steps and calories for the screens. ActivityProvider reads Health Connect on launch, when the app comes
// back to the front and every 5 minutes, and saves today's numbers in the store.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { type HealthStatus, askHealthPermission, grantedReads, healthStatus, readActiveKcal, readSteps } from "./health";
import { burnedToday, distanceKm, stepStatus, strideM } from "./logic/activity";
import { activeMinutes } from "./logic/history";
import { useProgress } from "./progress";
import { useStore } from "./store";

interface Activity {
  status: HealthStatus | null;
  /** Steps permission granted */
  stepsAllowed: boolean;
  connect: () => Promise<void>;
  refresh: () => Promise<void>;
}
const Ctx = createContext<Activity | null>(null);

const midnight = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  // The store's setter changes identity on every store update; keep it in a ref so the reads
  // (and their timers) don't restart each time a set is ticked.
  const { setSteps } = useStore();
  const save = useRef(setSteps);
  useEffect(() => { save.current = setSteps; }, [setSteps]);
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [allowed, setAllowed] = useState({ steps: false, kcal: false });

  const read = useCallback(async (a: { steps: boolean; kcal: boolean }) => {
    if (!a.steps) return;
    const now = new Date();
    const [steps, kcal] = await Promise.all([readSteps(midnight(), now), a.kcal ? readActiveKcal(midnight(), now) : Promise.resolve(null)]);
    if (steps !== null) save.current(steps, kcal);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const s = await healthStatus();
      setStatus(s);
      if (s !== "available") return;
      const a = await grantedReads();
      setAllowed(a);
      await read(a);
    } catch { /* Health Connect busy or revoked: keep the last numbers */ }
  }, [read]);

  const connect = useCallback(async () => {
    try { const a = await askHealthPermission(); setAllowed(a); await read(a); } catch {}
  }, [read]);

  useEffect(() => {
    const first = setTimeout(refresh, 0);
    const sub = AppState.addEventListener("change", (s) => s === "active" && refresh());
    const iv = setInterval(refresh, 5 * 60_000);
    return () => { clearTimeout(first); sub.remove(); clearInterval(iv); };
  }, [refresh]);

  const value = useMemo(() => ({ status, stepsAllowed: allowed.steps, connect, refresh }), [status, allowed.steps, connect, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useActivity() {
  const a = useContext(Ctx);
  if (!a) throw new Error("useActivity must be used inside ActivityProvider");
  const { steps, watchKcal, prefs, profile, walks, ticks, stretchSetups, sessionSec } = useStore();
  const { day, todaySummary } = useProgress();
  const stride = strideM(profile.heightCm, profile.gender);
  const est = burnedToday({ weightKg: profile.weightKg, walks, ...activeMinutes({ day, summary: todaySummary, ticks, stretchSetups, sessionSec }) });
  return {
    ...a,
    steps, goal: prefs.stepGoal,
    stepStatus: stepStatus(steps ?? 0, prefs.stepGoal),
    km: distanceKm(steps ?? 0, stride), stride,
    burned: est, watchKcal,
    /** Prefer the watch's active calories when Health Connect has them */
    kcal: watchKcal ?? est.total, kcalSource: watchKcal !== null ? ("watch" as const) : ("estimate" as const),
  };
}
