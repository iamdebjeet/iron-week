// Daily history: a compact summary of each finished day, saved when the day's ticks reset.
// Powers the 7-day water chart now, and the streak, calendar and charts later. Pure functions.
import { STRETCH_PLANS } from "../data/stretches";
import { SWIM_BLOCKS } from "../data/swim";
import type { ExerciseSetup, PlanDay, StretchSetup } from "../data/types";
import { DAY_ORDER, normalizeSetup, stretchSetup, stretchTickBase } from "./index";
import { type WaterEntry, goalFor, total } from "./water";

export interface Done { done: number; total: number }
export interface DaySummary {
  date: string;
  /** Sets ticked / planned; null on a day without gym */
  workout: Done | null;
  /** Swim blocks ticked; null on a day without a swim */
  swim: Done | null;
  stretch: Done;
  walkMin: number;
  waterMl: number;
  waterGoalMl: number;
  steps: number;
  /** ≈ kcal burned (filled in once calories are estimated) */
  kcal: number;
  /** Personal records set that day */
  prs?: number;
  /** Σ kg × reps of the ticked sets */
  volumeKg?: number;
  /** What was eaten (as logged) */
  diet?: { kcal: number; protein: number; carbs: number; fat: number; fibre: number; sodium: number };
}
export type History = Record<string, DaySummary>;

/** Keep a bit over a year */
export const KEEP_DAYS = 400;

export const weekdayOf = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return DAY_ORDER[new Date(y, m - 1, d).getDay()];
};

export function summarizeDay(args: {
  date: string; day: PlanDay; ticks: Record<string, boolean>; water: WaterEntry[];
  setups: Record<string, ExerciseSetup>; stretchSetups: Record<string, StretchSetup>; baseWaterMl: number;
}): DaySummary {
  const { day, ticks } = args;
  const on = (id: string) => !!ticks[id];
  let workout: Done | null = null;
  if (!day.rest) {
    workout = { done: 0, total: 0 };
    day.exercises.forEach((e, i) => {
      const sets = normalizeSetup(args.setups[day.plan + i], e).sets;
      workout!.total += sets;
      for (let x = 0; x < sets; x++) if (on(`${day.key}${i}-${x}`)) workout!.done++;
    });
  }
  const swim: Done | null = day.swim ? { done: SWIM_BLOCKS.filter((_, j) => on(`${day.key}W${j}`)).length, total: SWIM_BLOCKS.length } : null;
  const stretch: Done = { done: 0, total: 0 };
  (["w", "c"] as const).forEach((g) => STRETCH_PLANS[day.plan][g].forEach((k, i) => {
    const r = stretchSetup(k, args.stretchSetups[k]).rounds;
    for (let x = 0; x < r; x++) { stretch.total++; if (on(`${stretchTickBase(day.key, g, i)}-${x}`)) stretch.done++; }
  }));
  return {
    date: args.date, workout, swim, stretch, walkMin: 0,
    waterMl: total(args.water), waterGoalMl: goalFor(day, args.baseWaterMl), steps: 0, kcal: 0,
  };
}

/** Add (or replace) a day and drop anything older than KEEP_DAYS days */
export function addToHistory(h: History, s: DaySummary, keep = KEEP_DAYS): History {
  const next = { ...h, [s.date]: s };
  const dates = Object.keys(next).sort();
  for (const d of dates.slice(0, Math.max(0, dates.length - keep))) delete next[d];
  return next;
}

/** The `n` dates before `date` (oldest first), e.g. for a 7-day chart */
export function previousDates(date: string, n: number): string[] {
  const [y, m, d] = date.split("-").map(Number);
  return Array.from({ length: n }, (_, i) => {
    const x = new Date(y, m - 1, d - (n - i));
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  });
}
