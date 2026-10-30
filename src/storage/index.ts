// Everything is saved on the phone with AsyncStorage. This module owns the key names,
// typed load/save helpers and the schema version, so saved data can be migrated safely.
import AsyncStorage from "@react-native-async-storage/async-storage";

export const KEYS = {
  setups: "setups",
  stretch: "stretchSetups",
  daily: "daily",
  prefs: "prefs",
  passes: "passes",
  profile: "profile",
  week: "week",
  quotes: "quotes",
  history: "history",
  schemaVersion: "schemaVersion",
} as const;

/** Every key holding user data: these go into a backup (the schema version travels separately) */
export const DATA_KEYS: string[] = Object.values(KEYS).filter((k) => k !== KEYS.schemaVersion);

/**
 * 1: the original single-screen app (setups, stretchSetups, daily, prefs, passes), no version key.
 * 2: adds profile, week, quotes (saved favourites) and history (one summary per day). Version 1 keys keep their shape: saved sets stay keyed by the workout's
 *    source day ("tue0" = Push A, first exercise), so they follow the workout to any day.
 */
export const SCHEMA_VERSION = 2;

type Migration = (get: (k: string) => Promise<string | null>, set: (k: string, v: string) => Promise<void>) => Promise<void>;

/** Steps to go from version n to n + 1, by n */
const MIGRATIONS: Record<number, Migration> = {
  1: async () => {}, // nothing to rewrite: v2 only adds new keys
};

/** Run any pending migrations. Safe to call on every launch. */
export async function migrate(): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.schemaVersion);
  let v = raw ? Number(raw) : 1;
  while (v < SCHEMA_VERSION) {
    await MIGRATIONS[v]?.((k) => AsyncStorage.getItem(k), (k, val) => AsyncStorage.setItem(k, val));
    v++;
    await AsyncStorage.setItem(KEYS.schemaVersion, String(v));
  }
}

export async function loadMany(keys: string[]): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of await AsyncStorage.multiGet(keys)) {
    if (v) { try { out[k] = JSON.parse(v); } catch {} }
  }
  return out;
}

export const save = (k: string, v: unknown) => AsyncStorage.setItem(k, JSON.stringify(v)).catch(() => {});
