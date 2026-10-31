import type { DaySummary } from "../history";
import { DEFAULT_WEEK, buildDays } from "../plan";
import { dayCounts, isLightWeek, missedYesterday, monthGrid, streak, weekNumber } from "../streak";

const plan = buildDays(DEFAULT_WEEK); // Mon is the rest (swim-only) day
const day = (k: string) => plan.find((d) => d.key === k)!;
const sum = (date: string, sets: number, swim = 0, walkMin = 0): DaySummary => ({
  date, workout: { done: sets, total: 17 }, swim: { done: swim, total: 4 }, stretch: { done: 0, total: 10 },
  walkMin, waterMl: 0, waterGoalMl: 3000, steps: 0, kcal: 0,
});
// Sun 1 Nov: gym · Mon 2: planned rest · Tue 3: gym · Wed 4: gym + swim
const history = { "2026-11-01": sum("2026-11-01", 5), "2026-11-03": sum("2026-11-03", 12), "2026-11-04": sum("2026-11-04", 10, 2) };
const base = { history, plan, startDate: "2026-11-01" };

describe("which days count", () => {
  test("a planned rest day counts", () => expect(dayCounts(undefined, day("mon"))).toBe(true));
  test("a gym day needs ≥1 set, a swim block or a 20-min walk", () => {
    expect(dayCounts(sum("x", 0), day("tue"))).toBe(false);
    expect(dayCounts(sum("x", 1), day("tue"))).toBe(true);
    expect(dayCounts(sum("x", 0, 1), day("tue"))).toBe(true);
    expect(dayCounts(sum("x", 0, 0, 19), day("tue"))).toBe(false);
    expect(dayCounts(sum("x", 0, 0, 20), day("tue"))).toBe(true);
  });
});

describe("streak", () => {
  test("today can't break it before it's over", () => {
    expect(streak({ ...base, today: "2026-11-05", todaySummary: sum("2026-11-05", 0) })).toBe(4);
  });
  test("today counts once a set is ticked", () => {
    expect(streak({ ...base, today: "2026-11-05", todaySummary: sum("2026-11-05", 1) })).toBe(5);
  });
  test("a skipped gym day resets it and marks the missed day", () => {
    expect(streak({ ...base, today: "2026-11-06", todaySummary: sum("2026-11-06", 0) })).toBe(0);
    expect(missedYesterday(history, plan, "2026-11-06", "2026-11-01")).toBe(true);
  });
  test("nothing before the start date counts or counts as missed", () => {
    expect(missedYesterday({}, plan, "2026-11-01", "2026-11-01")).toBe(false);
  });
});

describe("light week and calendar", () => {
  test("every 7th training week is light", () => {
    expect(weekNumber("2026-11-01", "2026-11-07")).toBe(1);
    expect(weekNumber("2026-11-01", "2026-11-08")).toBe(2);
    expect(isLightWeek(weekNumber("2026-11-01", "2026-12-13"))).toBe(true);
    expect(isLightWeek(weekNumber("2026-11-01", "2026-12-06"))).toBe(false);
  });
  test("Mon-first month grid", () => {
    const g = monthGrid(2026, 10); // November 2026 starts on a Sunday
    expect(g[0]).toEqual([null, null, null, null, null, null, "2026-11-01"]);
    expect(g.flat().filter(Boolean)).toHaveLength(30);
  });
});
