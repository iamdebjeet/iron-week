// Pick today's quote from the date and today's context. Same date + context = same quote (no randomness).
import { QUOTES, type Quote, type QuoteTag } from "../data/quotes";
import type { PlanDay } from "../data/types";

export interface QuoteContext {
  day: Pick<PlanDay, "rest" | "swim" | "workout">;
  /** Days in a row (from daily history; 0 until history exists) */
  streak: number;
  missedYesterday: boolean;
  prYesterday: boolean;
}

const workoutTag = (d: QuoteContext["day"]): QuoteTag | null =>
  d.rest ? (d.swim ? "swim" : "rest") : d.workout?.startsWith("legs") ? "leg" : d.workout?.startsWith("push") ? "push" : d.workout?.startsWith("pull") ? "pull" : null;

/** Tags for today, most specific first: a new PR, a missed day, a streak, then the day's training, then general */
export function contextTags(ctx: QuoteContext): QuoteTag[] {
  const tags: QuoteTag[] = [];
  if (ctx.prYesterday) tags.push("pr");
  else if (ctx.missedYesterday) tags.push("missed");
  else if (ctx.streak >= 3) tags.push("streak");
  const w = workoutTag(ctx.day);
  if (w) tags.push(w);
  if (ctx.day.swim && w !== "swim") tags.push("swim");
  tags.push("general");
  return tags;
}

/** Days since 1970 for a local YYYY-MM-DD date */
const dayNumber = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
};

/**
 * The quote for a date. The first context tag decides the pool (so a PR day gets a PR quote);
 * `offset` steps through the pool for "↻ another".
 */
export function pickQuote(date: string, ctx: QuoteContext, offset = 0, quotes: Quote[] = QUOTES): Quote {
  const tags = contextTags(ctx);
  const lead = tags.find((t) => quotes.some((q) => q.tags.includes(t))) ?? "general";
  const pool = quotes.filter((q) => q.tags.includes(lead));
  // A large prime step spreads consecutive days across the pool instead of walking it in order.
  const i = (((dayNumber(date) * 7919 + offset) % pool.length) + pool.length) % pool.length;
  return pool[i];
}

/** The small line under the quote, e.g. "Leg day · Swim · 12-day streak 🔥" */
export function contextLine(ctx: QuoteContext): string {
  const parts: string[] = [];
  const w = workoutTag(ctx.day);
  parts.push(w === "leg" ? "Leg day" : w === "push" ? "Push day" : w === "pull" ? "Pull day" : w === "swim" ? "Recovery swim" : "Rest day");
  if (ctx.day.swim && w !== "swim") parts.push("Swim");
  if (ctx.prYesterday) parts.push("New PR yesterday 🏆");
  else if (ctx.missedYesterday) parts.push("Fresh start today");
  else if (ctx.streak >= 3) parts.push(`${ctx.streak}-day streak 🔥`);
  return parts.join(" · ");
}
