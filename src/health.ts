// Health Connect (Android): today's steps and, if a watch writes them, active calories.
// The library has native code that isn't in Expo Go, so it's loaded lazily and only in an installed build;
// in Expo Go (or on iOS) everything here reports "unavailable" and the app falls back gracefully.
import { Linking, Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

type HC = typeof import("react-native-health-connect");

export type HealthStatus = "expo-go" | "unsupported" | "not-installed" | "update-required" | "available";

export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let hc: HC | null | undefined;
function load(): HC | null {
  if (hc !== undefined) return hc;
  if (isExpoGo || Platform.OS !== "android") return (hc = null);
  // A top-level import would crash Expo Go (no native module), so load it only here.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  try { hc = require("react-native-health-connect") as HC; } catch { hc = null; }
  return hc;
}

let ready = false;
export async function healthStatus(): Promise<HealthStatus> {
  if (isExpoGo) return "expo-go";
  const m = load();
  if (!m) return "unsupported";
  const s = await m.getSdkStatus();
  if (s === m.SdkAvailabilityStatus.SDK_UNAVAILABLE) return "not-installed";
  if (s === m.SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) return "update-required";
  if (!ready) ready = await m.initialize();
  return ready ? "available" : "unsupported";
}

const PERMS = [
  { accessType: "read", recordType: "Steps" },
  { accessType: "read", recordType: "ActiveCaloriesBurned" },
] as const;

/** Which of steps / active calories we may read (without asking) */
export async function grantedReads(): Promise<{ steps: boolean; kcal: boolean }> {
  const m = load();
  if (!m || !ready) return { steps: false, kcal: false };
  const g = await m.getGrantedPermissions();
  const has = (t: string) => g.some((p) => "recordType" in p && p.recordType === t && p.accessType === "read");
  return { steps: has("Steps"), kcal: has("ActiveCaloriesBurned") };
}

/** Show the Health Connect permission screen */
export async function askHealthPermission() {
  const m = load();
  if (!m || !ready) return { steps: false, kcal: false };
  await m.requestPermission([...PERMS]);
  return grantedReads();
}

const range = (start: Date, end: Date) => ({ operator: "between" as const, startTime: start.toISOString(), endTime: end.toISOString() });

export async function readSteps(start: Date, end: Date): Promise<number | null> {
  const m = load();
  if (!m || !ready) return null;
  const r = await m.aggregateRecord({ recordType: "Steps", timeRangeFilter: range(start, end) });
  return r.COUNT_TOTAL ?? 0;
}

/** Active calories written by a watch or another app; null when there are none */
export async function readActiveKcal(start: Date, end: Date): Promise<number | null> {
  const m = load();
  if (!m || !ready) return null;
  const r = await m.aggregateRecord({ recordType: "ActiveCaloriesBurned", timeRangeFilter: range(start, end) });
  const kcal = r.ACTIVE_CALORIES_TOTAL?.inKilocalories ?? 0;
  return kcal > 0 ? Math.round(kcal) : null;
}

/** Android 13 and older need the Health Connect app from the Play Store (14+ has it built in) */
export const openHealthConnectInStore = () =>
  Linking.openURL("market://details?id=com.google.android.apps.healthdata").catch(() =>
    Linking.openURL("https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata").catch(() => {}));

export const openHealthSettings = () => { try { load()?.openHealthConnectSettings(); } catch {} };
