import { MET, burnedToday, distanceKm, kcalOf, paceMinPerKm, stepStatus, strideM, briskPhase } from "../activity";

describe("stride and distance", () => {
  test("stride = height × 0.415 (male) / 0.413 (female) / 0.414 (unspecified)", () => {
    expect(strideM(172, "male")).toBeCloseTo(0.7138, 4);
    expect(strideM(172, "female")).toBeCloseTo(0.71036, 4);
    expect(strideM(172, "unspecified")).toBeCloseTo(0.71208, 4);
    expect(strideM(null, "male")).toBeCloseTo(0.7055, 4); // 170 cm until height is known
  });

  test("distance = steps × stride", () => {
    expect(distanceKm(8000, strideM(172, "male"))).toBeCloseTo(5.71, 2);
  });

  test("pace in min/km, none for very short walks", () => {
    expect(paceMinPerKm(1800, 2.5)).toBe(12);
    expect(paceMinPerKm(30, 0.01)).toBeNull();
  });
});

describe("steps bands", () => {
  test("Low < goal/2, Good up to the goal, Excellent at the goal", () => {
    expect([3999, 4000, 7999, 8000].map((n) => stepStatus(n, 8000))).toEqual(["low", "good", "good", "excellent"]);
    expect(stepStatus(4999, 10000)).toBe("low");
  });
});

describe("calories (MET × kg × hours)", () => {
  test("MET values", () => {
    expect(MET).toEqual({ lifting: 5.0, swim: 7.0, recoverySwim: 6.0, briskWalk: 4.3, walk: 3.5, stretch: 2.3 });
    expect(kcalOf(5, 70, 60)).toBe(350);
  });

  test("a full day adds up per activity", () => {
    const b = burnedToday({
      weightKg: 70, gymMin: 60, swimMin: 38, recoverySwim: false, stretchMin: 12,
      walks: [{ start: 0, end: 30 * 60_000, steps: 3500, brisk: true }],
    });
    expect(b).toEqual({ gym: 350, swim: 310, walk: 151, stretch: 32, total: 843 });
  });

  test("recovery swim uses MET 6.0; weight defaults to 70 kg", () => {
    expect(burnedToday({ weightKg: null, gymMin: 0, swimMin: 38, recoverySwim: true, walks: [], stretchMin: 0 }).swim).toBe(266);
  });

  test("brisk mode switches every 3 minutes", () => {
    expect([0, 179, 180, 359, 360].map(briskPhase)).toEqual(["easy", "easy", "fast", "fast", "easy"]);
  });
});
