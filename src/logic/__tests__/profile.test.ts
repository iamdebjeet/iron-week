import { bmi, bmiCategory } from "../profile";

describe("BMI", () => {
  test("weight / height², one decimal; unknown until both are set", () => {
    expect(bmi({ heightCm: 172, weightKg: 70 })).toBe(23.7);
    expect(bmi({ heightCm: null, weightKg: 70 })).toBeNull();
  });

  test("WHO bands, edges included where the table says", () => {
    const cases: [number, string][] = [
      [18.4, "under"], [18.5, "healthy"], [24.9, "healthy"], [25.0, "over"], [29.9, "over"],
      [30.0, "obese1"], [34.9, "obese1"], [35.0, "obese2"], [39.9, "obese2"], [40.0, "obese3"], [52, "obese3"],
    ];
    for (const [b, cat] of cases) expect([b, bmiCategory(b)]).toEqual([b, cat]);
  });
});
