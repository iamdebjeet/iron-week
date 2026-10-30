// Minutes-after-midnight helpers: quiet hours and the gym window. Pure, for unit tests.
import type { PlanDay } from "../data/types";
import { GYM_MINUTES, SWIM_MINUTES } from "./plan";

export const minutesOf = (d: Date) => d.getHours() * 60 + d.getMinutes();

/** Is `m` inside [start, end)? Handles ranges past midnight, like 22:30–07:00. */
export function inRange(m: number, start: number, end: number) {
  return start <= end ? m >= start && m < end : m >= start || m < end;
}

export interface Quiet { quietStart: number; quietEnd: number }
export const isQuiet = (m: number, q: Quiet) => q.quietStart !== q.quietEnd && inRange(m, q.quietStart, q.quietEnd);

/**
 * Gym mode: the workout fills the screen while you train.
 * On from 15 min before the gym starts until the swim (or gym) ends, or whenever the session timer runs.
 */
export function isGymMode(now: Date, day: PlanDay, gymStart: number, swimStart: number, sessionRunning: boolean) {
  if (sessionRunning) return true;
  if (day.rest) return false;
  const end = day.swim ? Math.max(gymStart + GYM_MINUTES, swimStart + SWIM_MINUTES) : gymStart + GYM_MINUTES;
  return inRange(minutesOf(now), gymStart - 15, end);
}
