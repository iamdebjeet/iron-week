// Weights per set: the lift log, "last time", progression hints and personal records. Pure functions.
import type { ExerciseSetup, PlanDay, Rep } from "../data/types";
import { musclesOf, normalizeSetup, shownName } from "./index";

/** One ticked set. For bodyweight moves `kg` is the added weight (0 = bodyweight only). `reps` is null for "max". */
export interface LoggedSet { kg: number; reps: number | null }
export interface Session { date: string; sets: LoggedSet[] }
/** Sessions per exercise name, oldest first */
export type Lifts = Record<string, Session[]>;

const BODYWEIGHT = /push-?ups?|pull-?ups?|chin-?ups?|\bdips?\b|dead bug|hanging|plank|single-leg calf|walking lunge|bodyweight/i;
const HEAVY_LOWER = /barbell|deadlift|squat|leg press|hip thrust/i;
const LOWER = ["Quads", "Hamstrings", "Glutes", "Calves"];

export const isBodyweight = (name: string) => BODYWEIGHT.test(name);
export const isLowerBody = (name: string) => (musclesOf(name)?.main ?? []).some((m) => LOWER.includes(m));
/** Next step up: +5 kg for heavy lower-body lifts, +2.5 kg for everything else */
export const increment = (name: string) => (isLowerBody(name) && HEAVY_LOWER.test(name) ? 5 : 2.5);

export const roundKg = (x: number) => Math.round(x * 2) / 2;
export const kgLabel = (kg: number, bw: boolean) => (bw ? (kg ? `BW +${kg} kg` : "BW") : `${kg} kg`);
export const repsNumber = (r: Rep) => (r === "max" ? null : r);

/** Estimated one-rep max (Epley): kg × (1 + reps / 30) */
export const e1rm = (kg: number, reps: number) => kg * (1 + reps / 30);

export const lastSession = (lifts: Lifts, name: string, before: string): Session | null =>
  [...(lifts[name] ?? [])].reverse().find((s) => s.date < before) ?? null;

/** "Last time: 40 kg × 10" (the heaviest set of the last session) */
export function lastTimeText(s: Session | null, bw: boolean): string | null {
  if (!s?.sets.length) return null;
  const top = s.sets.reduce((a, b) => (b.kg > a.kg || (b.kg === a.kg && (b.reps ?? 0) > (a.reps ?? 0)) ? b : a));
  return `Last time: ${kgLabel(top.kg, bw)} × ${top.reps ?? "max"}`;
}

/** Top of the plan's rep range: "8–10" → 10, "12 each leg" → 12, "max" → null */
export const planTop = (reps: string) => { const n = reps.match(/\d+/g); return n ? Number(n[n.length - 1]) : null; };

/** If every set last time reached the top of the plan's range, suggest the next step */
export function progressionHint(name: string, planReps: string, last: Session | null): string | null {
  const top = planTop(planReps);
  if (!top || !last?.sets.length || !last.sets.every((s) => s.reps !== null && s.reps >= top)) return null;
  if (isBodyweight(name) && last.sets.every((s) => s.kg === 0)) return "Every set hit the top last time: try +1 rep per set today.";
  return `Every set hit ${top} reps last time: try +${increment(name)} kg today.`;
}

export interface Best { kg: number; e1rm: number; reps: number }
export function bestOf(sessions: Session[]): Best {
  const b: Best = { kg: 0, e1rm: 0, reps: 0 };
  for (const s of sessions) for (const x of s.sets) {
    b.kg = Math.max(b.kg, x.kg);
    if (x.reps !== null) { b.reps = Math.max(b.reps, x.reps); if (x.kg > 0) b.e1rm = Math.max(b.e1rm, e1rm(x.kg, x.reps)); }
  }
  return b;
}

export type PrKind = "weight" | "e1rm" | "reps";
/**
 * Is this set a new personal record against everything before it?
 * Weighted: heaviest kg, or best estimated 1RM. Bodyweight-only: most reps. Needs at least one earlier set.
 */
export function prOf(before: Session[], set: LoggedSet, bw: boolean): PrKind | null {
  if (!before.some((s) => s.sets.length) || set.reps === null) return null;
  const b = bestOf(before);
  if (set.kg > 0) {
    if (set.kg > b.kg) return "weight";
    if (e1rm(set.kg, set.reps) > b.e1rm + 0.01) return "e1rm";
    return null;
  }
  return bw && b.kg === 0 && set.reps > b.reps ? "reps" : null;
}

/** Ticked sets of the given days, grouped by the exercise name done (after swaps). Weighted sets need a kg. */
export function sessionsFromTicks(args: {
  date: string; days: PlanDay[]; ticks: Record<string, boolean>; kg: Record<string, number>;
  swaps: Record<string, number>; setups: Record<string, ExerciseSetup>;
}): Record<string, Session> {
  const out: Record<string, Session> = {};
  for (const d of args.days) {
    d.exercises.forEach((e, i) => {
      const name = shownName(e, args.swaps[d.key + i]);
      const setup = normalizeSetup(args.setups[d.plan + i], e);
      for (let x = 0; x < setup.sets; x++) {
        const id = `${d.key}${i}-${x}`;
        if (!args.ticks[id]) continue;
        const kg = args.kg[id] ?? (isBodyweight(name) ? 0 : undefined);
        if (kg === undefined) continue;
        (out[name] ??= { date: args.date, sets: [] }).sets.push({ kg, reps: repsNumber(setup.reps[x]) });
      }
    });
  }
  return out;
}

/** Add one day's sessions to the log (replacing that date if it was saved before) */
export function addSessions(lifts: Lifts, sessions: Record<string, Session>): Lifts {
  const next: Lifts = { ...lifts };
  for (const [name, s] of Object.entries(sessions)) {
    next[name] = [...(next[name] ?? []).filter((x) => x.date !== s.date), s].sort((a, b) => (a.date < b.date ? -1 : 1));
  }
  return next;
}

export interface PrRecord { exercise: string; date: string; kind: PrKind; kg: number; reps: number; prev: Best }
/** Every PR in the log, newest first: each set that beat everything before it */
export function prList(lifts: Lifts): PrRecord[] {
  const out: PrRecord[] = [];
  for (const [name, sessions] of Object.entries(lifts)) {
    const bw = isBodyweight(name);
    sessions.forEach((s, i) => {
      const before = sessions.slice(0, i);
      // One record per exercise per day: the best PR set that day (by estimated 1RM, or reps for bodyweight)
      const score = (kg: number, reps: number) => (kg > 0 ? e1rm(kg, reps) : reps);
      let best: PrRecord | null = null;
      for (const set of s.sets) {
        const kind = prOf(before, set, bw);
        if (kind && set.reps !== null && (!best || score(set.kg, set.reps) > score(best.kg, best.reps)))
          best = { exercise: name, date: s.date, kind, kg: set.kg, reps: set.reps, prev: bestOf(before) };
      }
      if (best) out.push(best);
    });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Total kg moved: Σ kg × reps over the ticked sets with a weight */
export const volume = (sessions: Record<string, Session>) =>
  Object.values(sessions).reduce((a, s) => a + s.sets.reduce((b, x) => b + x.kg * (x.reps ?? 0), 0), 0);
