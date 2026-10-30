// Streak, missed days, light weeks and calendar colours, from the daily history. Pure functions.
import type { PlanDay } from "../data/types";
import { type DaySummary, type History, previousDates, weekdayOf } from "./history";

/** Minutes of walking that make a day count */
export const WALK_COUNTS = 20;

/** A day counts if it was a planned rest day (no gym), or ≥1 set ticked, or a swim block ticked, or a walk ≥ 20 min */
export function dayCounts(s: DaySummary | undefined, planned: PlanDay | undefined) {
  if (planned?.rest) return true;
  return !!s && ((s.workout?.done ?? 0) > 0 || (s.swim?.done ?? 0) > 0 || s.walkMin >= WALK_COUNTS);
}

const dayOf = (plan: PlanDay[], date: string) => plan.find((d) => d.key === weekdayOf(date));

/**
 * Days in a row that count, ending today if today already counts, else ending yesterday
 * (today isn't over yet, so it can't break the streak). Nothing before `startDate` counts.
 */
export function streak(args: { history: History; plan: PlanDay[]; today: string; todaySummary: DaySummary; startDate: string }): number {
  const { history, plan, today, startDate } = args;
  let n = dayCounts(args.todaySummary, dayOf(plan, today)) ? 1 : 0;
  for (const d of previousDates(today, 400).reverse()) {
    if (d < startDate || !dayCounts(history[d], dayOf(plan, d))) break;
    n++;
  }
  return n;
}

/** Yesterday was a planned gym day (after the start) that didn't count */
export function missedYesterday(history: History, plan: PlanDay[], today: string, startDate: string) {
  const [y] = previousDates(today, 1);
  return y >= startDate && !dayCounts(history[y], dayOf(plan, y));
}

export const daysBetween = (a: string, b: string) => {
  const p = (s: string) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((p(b) - p(a)) / 86_400_000);
};

/** Training week number, 1-based, counted from the start date */
export const weekNumber = (startDate: string, today: string) => Math.floor(Math.max(0, daysBetween(startDate, today)) / 7) + 1;
/** Every 7th week is a light week (~60% weight, same reps) */
export const isLightWeek = (week: number) => week % 7 === 0;

export type CalStatus = "gym" | "swim" | "both" | "rest" | "none";
export function calendarStatus(s: DaySummary | undefined): CalStatus {
  if (!s) return "none";
  const gym = (s.workout?.done ?? 0) > 0, swim = (s.swim?.done ?? 0) > 0;
  return gym && swim ? "both" : gym ? "gym" : swim ? "swim" : "none";
}

/** Weeks of a month for a Mon-first calendar: each week is 7 dates or null for padding */
export function monthGrid(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month, 1), days = new Date(year, month + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= days; d++) cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
}
