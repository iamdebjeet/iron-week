// Pure helpers shared by the screens: defaults, timer steps and the muscle map.
import { DAYS, FINISHER_MOVES, REP_OPTIONS } from "./data/plan";
import { STRETCHES, STRETCH_PLANS, HOLD_OPTIONS, STRETCH_REP_OPTIONS, TIME_OPTIONS } from "./data/stretches";
import { ALTERNATIVES, EXERCISE_MUSCLES, EXTRA_EXERCISES, MUSCLES } from "./data/muscles";
import { SWIM_BLOCKS } from "./data/swim";
import type { Day, Exercise, ExerciseSetup, MuscleUse, Rep, StretchSetup, TimerStep } from "./data/types";

export const DAY_ORDER = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]; // index = Date.getDay()
export const FULL_DAY: Record<string, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday",
};

/** Today's key by the phone's local time */
export const todayKey = () => DAY_ORDER[new Date().getDay()];
/** Local date like 2026-11-01, used to reset ticks and swaps each day */
export const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const getDay = (key: string): Day => DAYS.find((d) => d.key === key)!;

export const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, "0")}`;

/* ---------- exercises ---------- */

/** "10 each leg" -> "each leg" */
export const repSuffix = (e: Exercise) => (e.reps.match(/each \w+/) || [""])[0];

export function defaultSetup(e: Exercise): ExerciseSetup {
  const m = e.reps.match(/\d+/);
  let r: Rep = m ? +m[0] : "max";
  if (r !== "max") {
    const target = r;
    r = REP_OPTIONS.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a));
  }
  return { sets: e.sets, reps: Array(e.sets).fill(r) };
}

export function normalizeSetup(saved: ExerciseSetup | undefined, e: Exercise): ExerciseSetup {
  const d = defaultSetup(e);
  if (!saved) return d;
  const reps = saved.reps.slice(0, saved.sets);
  while (reps.length < saved.sets) reps.push(reps.length ? reps[reps.length - 1] : d.reps[0]);
  return { sets: saved.sets, reps };
}

export const repLabel = (r: Rep) => (r === "max" ? "Max" : String(r));

export function repSummary(s: ExerciseSetup) {
  const unique = [...new Set(s.reps)];
  return unique.length === 1 ? `${s.sets} × ${repLabel(unique[0])}` : s.reps.map(repLabel).join(" / ");
}

export const musclesOf = (name: string): MuscleUse | undefined => EXERCISE_MUSCLES[name] || EXTRA_EXERCISES[name];

export function cuesOf(name: string): string[] {
  if (EXTRA_EXERCISES[name]) return EXTRA_EXERCISES[name].cues;
  for (const d of DAYS) {
    const e = d.exercises.find((x) => x.name === name);
    if (e) return e.cues;
  }
  return [];
}

/** Name to show, after any swap chosen for today (0 = original) */
export function shownName(e: Exercise, swapIndex: number | undefined) {
  return swapIndex && ALTERNATIVES[e.name] ? ALTERNATIVES[e.name][swapIndex - 1] : e.name;
}

/* ---------- stretches ---------- */

export const stretchOptions = (key: string) => {
  const t = STRETCHES[key].type;
  return t === "hold" ? HOLD_OPTIONS : t === "reps" ? STRETCH_REP_OPTIONS : TIME_OPTIONS;
};

export const stretchSetup = (key: string, saved?: StretchSetup): StretchSetup =>
  saved || { rounds: 1, value: STRETCHES[key].value };

export function stretchUnit(key: string, value: number) {
  const s = STRETCHES[key];
  return (s.type === "reps" ? `${value} reps` : `${value}s`) + (s.sides > 1 ? " each side" : "");
}

const stretchSeconds = (key: string, value: number) =>
  STRETCHES[key].type === "reps" ? Math.round(value * STRETCHES[key].pace) : value;

export function stretchSteps(key: string, tickBase: string, setup: StretchSetup): TimerStep[] {
  const s = STRETCHES[key];
  const sec = stretchSeconds(key, setup.value);
  const out: TimerStep[] = [];
  for (let r = 0; r < setup.rounds; r++) {
    for (let side = 0; side < s.sides; side++) {
      if (side > 0) out.push({ label: `Switch side · ${s.name}`, seconds: 5 });
      out.push({
        label: (s.type === "reps" ? `${setup.value} reps · ` : "") + s.name +
          (s.sides > 1 ? ` · Side ${side + 1}` : "") + (setup.rounds > 1 ? ` · Round ${r + 1}` : ""),
        seconds: sec,
        tick: side === s.sides - 1 ? `${tickBase}-${r}` : undefined,
      });
    }
    if (r < setup.rounds - 1) out.push({ label: `Rest · ${s.name}`, seconds: 10 });
  }
  return out;
}

export function groupMinutes(keys: string[], setups: Record<string, StretchSetup>) {
  let secs = 0;
  keys.forEach((k) => {
    const c = stretchSetup(k, setups[k]);
    const s = STRETCHES[k];
    secs += 5 + c.rounds * s.sides * stretchSeconds(k, c.value) + c.rounds * (s.sides - 1) * 5 + (c.rounds - 1) * 10;
  });
  return Math.max(1, Math.round(secs / 60));
}

export const stretchTickBase = (dayKey: string, group: "w" | "c", i: number) => `${dayKey}S${group}${i}`;

/* ---------- swim ---------- */

export const swimName = (rest: boolean | undefined, i: number) => (rest && i === 2 ? "Recovery swim" : SWIM_BLOCKS[i].name);
export const swimSteps = (day: Day): TimerStep[] =>
  SWIM_BLOCKS.map((b, i) => ({ label: `Swim · ${swimName(day.rest, i)}`, seconds: b.minutes * 60, tick: `${day.key}W${i}` }));

/* ---------- muscle map ---------- */

export interface MuscleStat {
  direct: number;
  help: number;
  exercises: Set<string>;
  stretches: Set<string>;
  rounds: number;
  items: { day: string; name: string; info: string; kind: 0 | 1 | 2 }[];
}

export function collectMuscles(
  days: Day[],
  setupOf: (day: Day, i: number, e: Exercise) => ExerciseSetup,
  nameOf: (day: Day, i: number, e: Exercise) => string,
  stretchSetups: Record<string, StretchSetup>,
) {
  const M: Record<string, MuscleStat> = {};
  MUSCLES.forEach((m) => (M[m] = { direct: 0, help: 0, exercises: new Set(), stretches: new Set(), rounds: 0, items: [] }));
  const addEx = (day: string, name: string, sets: number) => {
    const mm = musclesOf(name);
    if (!mm) return;
    mm.main.forEach((m) => { M[m].direct += sets; M[m].exercises.add(name); M[m].items.push({ day, name, info: `${sets} sets · Main`, kind: 0 }); });
    mm.helps.forEach((m) => { M[m].help += sets; M[m].exercises.add(name); M[m].items.push({ day, name, info: `${sets} sets · Helps`, kind: 1 }); });
  };
  days.forEach((d) => {
    d.exercises.forEach((e, i) => addEx(d.short, nameOf(d, i, e), setupOf(d, i, e).sets));
    (FINISHER_MOVES[d.key] || []).forEach(([n, s]) => addEx(d.short, n, s));
    const plan = STRETCH_PLANS[d.key];
    (["w", "c"] as const).forEach((g) =>
      plan[g].forEach((k) => {
        const r = stretchSetup(k, stretchSetups[k]).rounds;
        STRETCHES[k].muscles.forEach((m) => {
          M[m].stretches.add(STRETCHES[k].name);
          M[m].rounds += r;
          M[m].items.push({ day: d.short, name: STRETCHES[k].name, info: g === "w" ? "Warm-up stretch" : "Cool-down stretch", kind: 2 });
        });
      }),
    );
  });
  Object.values(M).forEach((x) => x.items.sort((a, b) => a.kind - b.kind));
  return M;
}
