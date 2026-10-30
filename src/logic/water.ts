// Water tracker rules: today's goal, status bands, the speed warning and when the next reminder goes off.
// Pure functions, so they can be unit-tested.
import type { PlanDay } from "../data/types";
import { GYM_MINUTES, SWIM_MINUTES } from "./plan";
import { type Quiet, inRange, isQuiet, minutesOf } from "./time";

export interface WaterEntry { at: number; ml: number }
export type WaterStatus = "low" | "good" | "excellent" | "veryHigh" | "tooMuch";

export interface WaterSettings {
  /** Goal on a rest day, in ml (gym and swim days add to it) */
  baseGoalMl: number;
  /** Minutes between reminders */
  intervalMin: number;
  /** Reminders only between these times (minutes after midnight) */
  activeStart: number;
  activeEnd: number;
  /** Last amount picked in the dropdown */
  lastAmount: number;
}

export const DEFAULT_WATER: WaterSettings = { baseGoalMl: 3000, intervalMin: 120, activeStart: 8 * 60, activeEnd: 22 * 60, lastAmount: 250 };
export const AMOUNTS = [100, 150, 200, 250, 300, 400, 500, 600, 750];
export const AMOUNT_NOTE: Partial<Record<number, string>> = { 100: "small sip", 200: "cup", 250: "glass", 500: "bottle", 750: "large bottle · max at once" };
export const INTERVALS = [60, 90, 120, 180];
export const GOAL_CHOICES = Array.from({ length: 11 }, (_, i) => 2000 + i * 250); // 2.0–4.5 L
export const DAY_EXTRA_ML = 500;
/** More than this in any 60 minutes shows the speed warning */
export const FAST_ML = 1000;

/** +0.5 L on gym days and +0.5 L on swim days (both stack) */
export const goalFor = (day: Pick<PlanDay, "rest" | "swim">, baseMl: number) => baseMl + (day.rest ? 0 : DAY_EXTRA_ML) + (day.swim ? DAY_EXTRA_ML : 0);

export const total = (log: WaterEntry[]) => log.reduce((a, e) => a + e.ml, 0);

export const STATUS_LABEL: Record<WaterStatus, string> = { low: "Low", good: "Good", excellent: "Excellent", veryHigh: "Very high", tooMuch: "Too much" };
export const STATUS_MESSAGE: Record<WaterStatus, string> = {
  low: "Drink some water now",
  good: "Keep it up, you're doing well",
  excellent: "You've hit your goal! 🎉",
  veryHigh: "That's plenty for today. Sip only when you're thirsty.",
  tooMuch: "Stop for now. Too much water can be harmful. If you feel sick, confused or get a headache, get medical help.",
};
export const STATUSES: WaterStatus[] = ["low", "good", "excellent", "veryHigh", "tooMuch"];

/** Band edges for goal G: G−1 L, G, G+1 L, G+2 L (with G = 3 L: 2 / 3 / 4 / 5 L) */
export const bandEdges = (goalMl: number) => [goalMl - 1000, goalMl, goalMl + 1000, goalMl + 2000];

export function statusOf(ml: number, goalMl: number): WaterStatus {
  const [a, b, c, d] = bandEdges(goalMl);
  return ml < a ? "low" : ml < b ? "good" : ml <= c ? "excellent" : ml <= d ? "veryHigh" : "tooMuch";
}

/** "under 2.5 L", "2.5 – 3.5 L", "over 5.5 L": the band list in the details screen */
export function bandRange(s: WaterStatus, goalMl: number) {
  const [a, b, c, d] = bandEdges(goalMl).map((x) => litres(x));
  return { low: `under ${a} L`, good: `${a} – ${b} L`, excellent: `${b} – ${c} L`, veryHigh: `${c} – ${d} L`, tooMuch: `over ${d} L` }[s];
}

export const litres = (ml: number) => String(Math.round(ml / 100) / 10);

/** Water logged in the 60 minutes before `now` */
export const lastHourMl = (log: WaterEntry[], now: number) => total(log.filter((e) => e.at > now - 3_600_000 && e.at <= now));

/** "Slow down: 1.2 L in the last hour…" when more than 1 L went in within the last 60 minutes */
export function speedWarning(log: WaterEntry[], now: number): string | null {
  const ml = lastHourMl(log, now);
  return ml > FAST_ML ? `Slow down: ${litres(ml)} L in the last hour. Give your body time.` : null;
}

/** Gym and swim windows for a day, as [start, end) minutes */
export function trainingWindows(day: Pick<PlanDay, "rest" | "swim">, gymStart: number, swimStart: number): [number, number][] {
  const w: [number, number][] = [];
  if (!day.rest) w.push([gymStart, gymStart + GYM_MINUTES]);
  if (day.swim) w.push([swimStart, swimStart + SWIM_MINUTES]);
  return w;
}

const atMinute = (base: Date, minute: number, dayOffset = 0) =>
  new Date(base.getFullYear(), base.getMonth(), base.getDate() + dayOffset, Math.floor(minute / 60), minute % 60);

/**
 * When the next water reminder should go off.
 * Every interval after the last drink (or after the active hours start): the first such time still ahead,
 * so the result stays put between clock ticks and only moves when you drink. Then moved out of gym/swim
 * windows and quiet hours, and kept inside active hours (else tomorrow morning).
 * At Excellent or above it waits for tomorrow morning.
 */
export function nextReminder(args: {
  now: Date; lastDrinkAt: number | null; status: WaterStatus; settings: WaterSettings; windows: [number, number][]; quiet: Quiet;
}): Date {
  const { now, settings: s, quiet } = args;
  const tomorrow = atMinute(now, s.activeStart, 1);
  if (args.status === "excellent" || args.status === "veryHigh" || args.status === "tooMuch") return tomorrow;
  const startToday = atMinute(now, s.activeStart).getTime();
  const base = args.lastDrinkAt ?? startToday, step = s.intervalMin * 60_000, soonest = now.getTime() + 60_000;
  let t = base + step;
  if (t < soonest) t = base + Math.ceil((soonest - base) / step) * step;
  for (let guard = 0; guard < 8; guard++) {
    const d = new Date(t);
    if (d.getDate() !== now.getDate()) return tomorrow;
    const m = minutesOf(d);
    if (m < s.activeStart) { t = atMinute(now, s.activeStart).getTime(); continue; }
    if (m >= s.activeEnd) return tomorrow;
    const win = args.windows.find(([a, b]) => inRange(m, a, b));
    if (win) { t = atMinute(now, win[1]).getTime(); continue; }
    if (isQuiet(m, quiet)) { t = atMinute(now, quiet.quietEnd, quiet.quietEnd < m ? 1 : 0).getTime(); continue; }
    return d;
  }
  return tomorrow;
}

/** Reminder text, e.g. "💧 Low · 1.2 L so far" / "Drink some water now. 1.8 L to go." (reminders only go out below the goal) */
export function reminderText(ml: number, goalMl: number) {
  const s = statusOf(ml, goalMl);
  return {
    title: `💧 ${STATUS_LABEL[s]} · ${litres(ml)} L so far`,
    body: `${STATUS_MESSAGE[s]}. ${litres(Math.max(0, goalMl - ml))} L to go.`,
  };
}
