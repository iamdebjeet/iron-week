// Steps, walking distance and calories burned (estimates). Pure functions.
import type { Gender } from "./profile";

export const DEFAULT_STEP_GOAL = 8000;
export const STEP_GOALS = [4000, 5000, 6000, 7000, 8000, 10000, 12000];

export type StepStatus = "low" | "good" | "excellent";
/** Low under half the goal, Good up to the goal, Excellent at the goal (8,000 → 4,000 / 8,000) */
export const stepStatus = (steps: number, goal: number): StepStatus => (steps >= goal ? "excellent" : steps >= goal / 2 ? "good" : "low");
export const STEP_LABEL: Record<StepStatus, string> = { low: "Low", good: "Good", excellent: "Excellent" };

/** Stride ≈ height × 0.415 (male) / 0.413 (female) / 0.414 (unspecified), in metres */
export const strideM = (heightCm: number | null, g: Gender) => ((heightCm ?? 170) * (g === "male" ? 0.415 : g === "female" ? 0.413 : 0.414)) / 100;
export const distanceKm = (steps: number, stride: number) => (steps * stride) / 1000;
/** Minutes per km, or null when too short to say */
export const paceMinPerKm = (seconds: number, km: number) => (km >= 0.05 ? seconds / 60 / km : null);

export const kFmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(Math.round(n)));
export const paceFmt = (p: number | null) => (p === null ? "–" : `${Math.floor(p)}:${String(Math.round((p % 1) * 60)).padStart(2, "0")} /km`);

/** MET values (Compendium of Physical Activities, rounded) */
export const MET = { lifting: 5.0, swim: 7.0, recoverySwim: 6.0, briskWalk: 4.3, walk: 3.5, stretch: 2.3 } as const;
/** kcal ≈ MET × weight (kg) × hours */
export const kcalOf = (met: number, kg: number, minutes: number) => met * kg * (minutes / 60);

export interface Walk { start: number; end: number; steps: number; brisk: boolean }
export const walkMinutes = (w: Walk) => Math.max(0, Math.round((w.end - w.start) / 60_000));

export interface Burned { gym: number; swim: number; walk: number; stretch: number; total: number }
export function burnedToday(args: {
  weightKg: number | null; gymMin: number; swimMin: number; recoverySwim: boolean; walks: Walk[]; stretchMin: number;
}): Burned {
  const kg = args.weightKg ?? 70;
  const gym = kcalOf(MET.lifting, kg, args.gymMin);
  const swim = kcalOf(args.recoverySwim ? MET.recoverySwim : MET.swim, kg, args.swimMin);
  const walk = args.walks.reduce((a, w) => a + kcalOf(w.brisk ? MET.briskWalk : MET.walk, kg, walkMinutes(w)), 0);
  const stretch = kcalOf(MET.stretch, kg, args.stretchMin);
  const r = (x: number) => Math.round(x);
  return { gym: r(gym), swim: r(swim), walk: r(walk), stretch: r(stretch), total: r(gym + swim + walk + stretch) };
}

/** Walk goals offered on the walking screen */
export type WalkGoal = { kind: "min"; value: number } | { kind: "steps"; value: number };
export const WALK_GOALS: WalkGoal[] = [
  { kind: "min", value: 20 }, { kind: "min", value: 30 }, { kind: "min", value: 45 },
  { kind: "steps", value: 2000 }, { kind: "steps", value: 5000 },
];
export const walkGoalLabel = (g: WalkGoal) => (g.kind === "min" ? `${g.value} min` : `${g.value.toLocaleString("en-IN")} steps`);
/** Brisk mode switches between easy and fast every 3 minutes */
export const BRISK_SWITCH_SEC = 180;
export const briskPhase = (elapsedSec: number) => (Math.floor(elapsedSec / BRISK_SWITCH_SEC) % 2 === 0 ? "easy" : "fast");
