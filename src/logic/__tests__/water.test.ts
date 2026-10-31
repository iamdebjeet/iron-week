import { goalFor, nextReminder, reminderText, speedWarning, statusOf, trainingWindows, DEFAULT_WATER, bandRange } from "../water";

const at = (h: number, m = 0, day = 4) => new Date(2026, 10, day, h, m); // Wed 4 Nov 2026
const quiet = { quietStart: 22 * 60 + 30, quietEnd: 7 * 60 };
const legsSwim = { rest: false, swim: true } as const;
const windows = trainingWindows(legsSwim, 20 * 60, 20 * 60 + 55);

describe("water bands", () => {
  test("with G = 3 L the bands are 0–2 / 2–3 / 3–4 / 4–5 / 5+", () => {
    expect(statusOf(1999, 3000)).toBe("low");
    expect(statusOf(2000, 3000)).toBe("good");
    expect(statusOf(2999, 3000)).toBe("good");
    expect(statusOf(3000, 3000)).toBe("excellent");
    expect(statusOf(4000, 3000)).toBe("excellent");
    expect(statusOf(4001, 3000)).toBe("veryHigh");
    expect(statusOf(5000, 3000)).toBe("veryHigh");
    expect(statusOf(5001, 3000)).toBe("tooMuch");
  });

  test("bands move with the goal", () => {
    expect(bandRange("good", 3500)).toBe("2.5 – 3.5 L");
    expect(bandRange("tooMuch", 3500)).toBe("over 5.5 L");
  });

  test("goal: +0.5 L on gym days and +0.5 L on swim days, stacking", () => {
    expect(goalFor({ rest: true, swim: false }, 3000)).toBe(3000);
    expect(goalFor({ rest: false, swim: false }, 3000)).toBe(3500);
    expect(goalFor({ rest: true, swim: true }, 3000)).toBe(3500);
    expect(goalFor(legsSwim, 3000)).toBe(4000);
  });
});

describe("speed warning", () => {
  const now = at(12).getTime();
  const min = (n: number) => now - n * 60_000;

  test("more than 1 L in the last 60 minutes warns", () => {
    expect(speedWarning([{ at: min(50), ml: 400 }, { at: min(20), ml: 400 }, { at: now, ml: 400 }], now))
      .toBe("Slow down: 1.2 L in the last hour. Give your body time.");
  });

  test("exactly 1 L, or drinks older than an hour, don't", () => {
    expect(speedWarning([{ at: min(10), ml: 500 }, { at: now, ml: 500 }], now)).toBeNull();
    expect(speedWarning([{ at: min(61), ml: 750 }, { at: now, ml: 500 }], now)).toBeNull();
  });
});

describe("reminder timing", () => {
  const base = { settings: DEFAULT_WATER, quiet, windows };

  test("one interval (2 h) after the last drink", () => {
    expect(nextReminder({ ...base, now: at(10, 5), lastDrinkAt: at(10).getTime(), status: "low" })).toEqual(at(12));
  });

  test("before any drink: interval after active hours start", () => {
    expect(nextReminder({ ...base, now: at(9), lastDrinkAt: null, status: "low" })).toEqual(at(10));
  });

  test("after a reminder fires, the next one stays put between clock ticks", () => {
    const a = nextReminder({ ...base, now: at(12, 30), lastDrinkAt: at(10).getTime(), status: "low" });
    const b = nextReminder({ ...base, now: at(12, 31), lastDrinkAt: at(10).getTime(), status: "low" });
    expect(a).toEqual(at(14));
    expect(b).toEqual(a);
  });

  test("paused during gym + swim: moved to the end of the swim", () => {
    expect(nextReminder({ ...base, now: at(18, 35), lastDrinkAt: at(18, 30).getTime(), status: "good" })).toEqual(at(21, 35));
  });

  test("past active hours: next morning at 8:00", () => {
    expect(nextReminder({ ...base, now: at(20, 50), lastDrinkAt: at(20, 45).getTime(), status: "good" })).toEqual(at(8, 0, 5));
  });

  test("stops for the day at Excellent or above", () => {
    for (const s of ["excellent", "veryHigh", "tooMuch"] as const)
      expect(nextReminder({ ...base, now: at(15), lastDrinkAt: at(15).getTime(), status: s })).toEqual(at(8, 0, 5));
  });

  test("reminder text shows status, total and what's left", () => {
    expect(reminderText(1200, 3000)).toEqual({ title: "💧 Low · 1.2 L so far", body: "Drink some water now. 1.8 L to go." });
  });
});
