// App updates. Two kinds:
// - Over-the-air (expo-updates / EAS Update): new JS for this build. Checked when the app opens and from
//   Me → Updates; installing = download + restart, never while a timer is running.
//   With auto-install on, it downloads quietly and applies when you leave the app.
// - New APK (native changes): a public latest.json says which build is newest; if it's newer than this one,
//   "Download & install" opens the APK link.
// OTA only works in installed release builds (not Expo Go or a development build).
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppState, Linking } from "react-native";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { type LatestApk, newerApk, parseLatest, updateMessage } from "./logic/updates";
import { useStore } from "./store";
import { useTimer } from "./timer";

export const otaSupported = Updates.isEnabled && !__DEV__;
const LATEST_URL = (Constants.expoConfig?.extra?.latestJsonUrl as string | undefined) ?? null;

async function fetchLatest(): Promise<LatestApk | null> {
  if (!LATEST_URL) return null;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(LATEST_URL, { signal: ctrl.signal, headers: { "Cache-Control": "no-cache" } });
    return res.ok ? parseLatest(await res.json()) : null;
  } finally { clearTimeout(t); }
}

interface UpdatesApi {
  checking: boolean;
  lastChecked: Date | null;
  /** Result of the last check, in words */
  note: string;
  /** An over-the-air update is available or downloaded */
  ota: { message: string; ready: boolean; downloading: boolean } | null;
  /** A newer APK from latest.json */
  apk: LatestApk | null;
  /** A timer is running, so restarting would interrupt it */
  timerBusy: boolean;
  check: () => Promise<void>;
  install: () => Promise<void>;
  openApk: () => void;
}
const Ctx = createContext<UpdatesApi | null>(null);

export function UpdatesProvider({ children }: { children: React.ReactNode }) {
  const { prefs } = useStore();
  const timer = useTimer();
  const u = Updates.useUpdates();
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [note, setNote] = useState("");
  const [apk, setApk] = useState<LatestApk | null>(null);
  const timerBusy = timer.status === "running" || timer.session.running;

  const check = useCallback(async () => {
    setChecking(true);
    const [ota, latest] = await Promise.allSettled([otaSupported ? Updates.checkForUpdateAsync() : Promise.resolve(null), fetchLatest()]);
    const newer = latest.status === "fulfilled" ? newerApk(latest.value, Application.nativeBuildVersion) : null;
    setApk(newer);
    const otaFound = ota.status === "fulfilled" && !!ota.value?.isAvailable;
    setNote(
      otaFound || newer ? "An update is available."
        : ota.status === "rejected" && latest.status === "rejected" ? "Couldn't check. Are you online?"
        : !otaSupported ? "You're up to date. (Quick updates work in the installed app, not Expo Go or a development build.)"
        : "You're up to date.",
    );
    setLastChecked(new Date());
    setChecking(false);
  }, []);

  // Check when the app opens
  useEffect(() => { const t = setTimeout(check, 0); return () => clearTimeout(t); }, [check]);

  const install = useCallback(async () => {
    if (!otaSupported || timerBusy) return;
    try {
      if (!u.isUpdatePending) await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch { setNote("The update didn't download. Try again in a moment."); }
  }, [timerBusy, u.isUpdatePending]);

  // Auto-install: download quietly, apply when the app goes to the background (never during a timer)
  useEffect(() => {
    if (!prefs.autoUpdate || !otaSupported) return;
    if (u.isUpdateAvailable && !u.isUpdatePending && !u.isDownloading) Updates.fetchUpdateAsync().catch(() => {});
  }, [prefs.autoUpdate, u.isUpdateAvailable, u.isUpdatePending, u.isDownloading]);
  useEffect(() => {
    if (!prefs.autoUpdate || !otaSupported || !u.isUpdatePending) return;
    const sub = AppState.addEventListener("change", (s) => { if (s === "background" && !timerBusy) Updates.reloadAsync().catch(() => {}); });
    return () => sub.remove();
  }, [prefs.autoUpdate, u.isUpdatePending, timerBusy]);

  const info = u.downloadedUpdate ?? u.availableUpdate;
  const ota = useMemo(() => (otaSupported && (u.isUpdateAvailable || u.isUpdatePending)
    ? { message: updateMessage(info?.manifest, info?.createdAt), ready: u.isUpdatePending, downloading: u.isDownloading }
    : null), [u.isUpdateAvailable, u.isUpdatePending, u.isDownloading, info]);

  const value = useMemo<UpdatesApi>(() => ({
    checking, lastChecked, note, ota, apk, timerBusy, check, install,
    openApk: () => { if (apk) Linking.openURL(apk.apkUrl).catch(() => {}); },
  }), [checking, lastChecked, note, ota, apk, timerBusy, check, install]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppUpdates() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppUpdates must be used inside UpdatesProvider");
  return v;
}

/** What's running now, for Me → Updates */
export const buildInfo = () => ({
  version: Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? "?",
  versionCode: Application.nativeBuildVersion ?? "?",
  channel: Updates.channel,
  runtimeVersion: Updates.runtimeVersion,
  updateId: Updates.updateId,
  createdAt: Updates.createdAt,
  embedded: Updates.isEmbeddedLaunch,
});
