import { QUOTES } from "../../data/quotes";
import { DEFAULT_WEEK, buildDays } from "../plan";
import { contextLine, pickQuote } from "../quotes";
import { isGymMode, isQuiet } from "../time";

const plan = buildDays(DEFAULT_WEEK);
const wed = plan.find((d) => d.key === "wed")!;
const base = { day: wed, streak: 0, missedYesterday: false, prYesterday: false };

describe("daily quote", () => {
  test("ids are unique and stable", () => expect(new Set(QUOTES.map((q) => q.id)).size).toBe(QUOTES.length));
  test("same date + context = same quote; ↻ steps through the pool", () => {
    expect(pickQuote("2026-11-04", base).id).toBe(pickQuote("2026-11-04", base).id);
    expect(pickQuote("2026-11-04", base, 1).id).not.toBe(pickQuote("2026-11-04", base).id);
  });
  test("context picks the pool: PR > missed > streak > the day's training", () => {
    expect(pickQuote("2026-11-04", { ...base, prYesterday: true }).tags).toContain("pr");
    expect(pickQuote("2026-11-04", { ...base, missedYesterday: true }).tags).toContain("missed");
    expect(pickQuote("2026-11-04", { ...base, streak: 5 }).tags).toContain("streak");
    expect(pickQuote("2026-11-04", base).tags).toContain("leg");
  });
  test("context line", () => expect(contextLine({ ...base, streak: 12 })).toBe("Leg day · Swim · 12-day streak 🔥"));
});

describe("quiet hours and gym mode", () => {
  const q = { quietStart: 22 * 60 + 30, quietEnd: 7 * 60 };
  test("quiet hours wrap past midnight", () => {
    expect([23 * 60, 6 * 60 + 59, 7 * 60, 19 * 60].map((m) => isQuiet(m, q))).toEqual([true, true, false, false]);
  });
  const at = (h: number, m: number) => new Date(2026, 10, 4, h, m);
  test("gym mode from 15 min before the gym to the end of the swim, or while the session runs", () => {
    expect(isGymMode(at(19, 44), wed, 1200, 1255, false)).toBe(false);
    expect(isGymMode(at(19, 46), wed, 1200, 1255, false)).toBe(true);
    expect(isGymMode(at(21, 34), wed, 1200, 1255, false)).toBe(true);
    expect(isGymMode(at(21, 36), wed, 1200, 1255, false)).toBe(false);
    expect(isGymMode(at(10, 0), wed, 1200, 1255, true)).toBe(true);
  });
});
