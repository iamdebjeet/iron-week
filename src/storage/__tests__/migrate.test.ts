import AsyncStorage from "@react-native-async-storage/async-storage";
import { DATA_KEYS, KEYS, SCHEMA_VERSION, migrate } from "../index";

// jest.mock factories run before imports, so they must use require()
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock("@react-native-async-storage/async-storage", () => require("@react-native-async-storage/async-storage/jest/async-storage-mock"));

beforeEach(() => AsyncStorage.clear());

describe("storage migration", () => {
  test("a version-1 install (no version key) is upgraded without touching its data", async () => {
    const v1 = { setups: JSON.stringify({ tue0: { sets: 4, reps: [8, 8, 8, 8] } }), daily: JSON.stringify({ date: "2026-10-30", ticks: { "tue0-0": true }, swaps: {} }), prefs: JSON.stringify({ reminders: true, hour: 19, minute: 0 }) };
    await AsyncStorage.multiSet(Object.entries(v1));
    await migrate();
    expect(await AsyncStorage.getItem(KEYS.schemaVersion)).toBe(String(SCHEMA_VERSION));
    for (const [k, v] of Object.entries(v1)) expect(await AsyncStorage.getItem(k)).toBe(v);
  });

  test("running it again is a no-op", async () => {
    await AsyncStorage.setItem(KEYS.schemaVersion, String(SCHEMA_VERSION));
    await AsyncStorage.setItem(KEYS.setups, "{}");
    await migrate();
    expect(await AsyncStorage.getItem(KEYS.setups)).toBe("{}");
  });

  test("every data key is backed up; the version key travels separately", () => {
    expect(DATA_KEYS).toContain("history");
    expect(DATA_KEYS).not.toContain(KEYS.schemaVersion);
  });
});
