import { e1rm, increment, isBodyweight, prList, prOf, progressionHint, sessionsFromTicks, volume, type Session } from "../lifts";
import { DEFAULT_WEEK, buildDays } from "../plan";

const s1: Session = { date: "2026-11-03", sets: [{ kg: 40, reps: 10 }, { kg: 40, reps: 10 }, { kg: 40, reps: 10 }] };

describe("estimated 1RM and PRs", () => {
  test("Epley: kg × (1 + reps / 30)", () => {
    expect(e1rm(40, 10)).toBeCloseTo(53.33, 2);
    expect(e1rm(100, 0)).toBe(100);
  });

  test("heavier weight, or a better estimated max, is a PR", () => {
    expect(prOf([s1], { kg: 42.5, reps: 8 }, false)).toBe("weight");
    expect(prOf([s1], { kg: 40, reps: 12 }, false)).toBe("e1rm");
    expect(prOf([s1], { kg: 37.5, reps: 10 }, false)).toBeNull();
  });

  test("no PR on the very first session (it's the baseline)", () => {
    expect(prOf([], { kg: 40, reps: 10 }, false)).toBeNull();
  });

  test("bodyweight-only moves: most reps", () => {
    expect(prOf([{ date: "x", sets: [{ kg: 0, reps: 8 }] }], { kg: 0, reps: 9 }, true)).toBe("reps");
  });

  test("PR list keeps the previous best", () => {
    const list = prList({ "Romanian Deadlift": [s1, { date: "2026-11-06", sets: [{ kg: 42.5, reps: 8 }] }] });
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ exercise: "Romanian Deadlift", kg: 42.5, reps: 8, kind: "weight", prev: { kg: 40 } });
  });
});

describe("progression hint", () => {
  test("every set at the top of the range: +5 kg for heavy lower body, +2.5 kg otherwise", () => {
    expect(progressionHint("Romanian Deadlift", "8–10", s1)).toMatch(/\+5 kg/);
    expect(progressionHint("Flat Barbell Bench Press", "8–10", s1)).toMatch(/\+2\.5 kg/);
    expect(increment("Leg Extension")).toBe(2.5);
  });

  test("one set short: no hint", () => {
    expect(progressionHint("Romanian Deadlift", "8–10", { ...s1, sets: [...s1.sets.slice(0, 2), { kg: 40, reps: 9 }] })).toBeNull();
  });

  test("bodyweight: +1 rep", () => {
    expect(isBodyweight("Pull-ups / Assisted Pull-ups")).toBe(true);
    expect(progressionHint("Pull-ups / Assisted Pull-ups", "6–8", { date: "x", sets: [{ kg: 0, reps: 8 }] })).toMatch(/\+1 rep/);
  });
});

describe("sessions from ticks", () => {
  test("ticked sets with a kg are logged under the exercise done; volume = Σ kg × reps", () => {
    const days = buildDays(DEFAULT_WEEK);
    const s = sessionsFromTicks({ date: "2026-11-06", days, ticks: { "fri0-0": true, "fri0-1": true, "fri1-0": true }, kg: { "fri0-0": 40, "fri0-1": 42.5 }, swaps: {}, setups: {} });
    expect(Object.keys(s)).toEqual(["Romanian Deadlift"]); // fri1 ticked without kg: skipped
    expect(s["Romanian Deadlift"].sets).toHaveLength(2);
    expect(volume(s)).toBe((40 + 42.5) * s["Romanian Deadlift"].sets[0].reps!);
  });
});
