// Rest / stretch / swim timer (a queue of steps) and the 60-minute session timer.
// Step end times are absolute, so the timer stays correct after the phone is locked,
// and a local notification is scheduled for every step so you still get alerted.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState, Vibration } from "react-native";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import type { TimerStep } from "./data/types";
import { cancelIds, ensurePermission, scheduleStepAlerts } from "./notifications";
import { useStore } from "./store";

interface Run { steps: TimerStep[]; ends: number[]; index: number; doneText: string; doneLabel: string }

// What the screens show, copied out of the run so render never reads refs or the clock.
interface Snap { label: string; next: string; left: number; total: number; multi: boolean }
const IDLE: Snap = { label: "Timer", next: "", left: 0, total: 1, multi: false };
function snapOf(r: Run | null, now: number): Snap {
  if (!r) return IDLE;
  const step = r.index < r.steps.length ? r.steps[r.index] : null;
  if (!step) return { ...IDLE, label: r.doneLabel, multi: r.steps.length > 1 };
  const after = r.steps[r.index + 1];
  return {
    label: step.label,
    next: after ? `Next: ${after.label}` : "",
    left: Math.max(0, Math.ceil((r.ends[r.index] - now) / 1000)),
    total: step.seconds,
    multi: r.steps.length > 1,
  };
}

interface TimerApi {
  status: "idle" | "running" | "done";
  label: string;
  next: string;
  left: number;      // seconds left in the current step
  total: number;     // seconds in the current step
  multi: boolean;    // more than one step (shows Skip)
  bigVisible: boolean;
  run: (steps: TimerStep[], doneText?: string, doneLabel?: string) => void;
  rest: (seconds: number, name: string) => void;
  skip: () => void;
  addTime: (seconds: number) => void;
  stop: () => void;
  showBig: () => void;
  minimizeBig: () => void;
  session: { left: number; running: boolean; toggle: () => void; reset: () => void };
}

const Ctx = createContext<TimerApi | null>(null);
const SESSION = 60 * 60;
const KEEP_AWAKE = "iron-week-timer";

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { setTick, prefs, setPrefs } = useStore();
  const runRef = useRef<Run | null>(null);
  const alertIds = useRef<string[]>([]);
  const [snap, setSnap] = useState<Snap>(IDLE);
  const rerender = useCallback(() => setSnap(snapOf(runRef.current, Date.now())), []);
  const [status, setStatus] = useState<TimerApi["status"]>("idle");
  const [bigVisible, setBigVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // session timer
  const [sessionEnd, setSessionEnd] = useState<number | null>(null);
  const [sessionLeft, setSessionLeft] = useState(SESSION);
  const sessionIds = useRef<string[]>([]);

  const reschedule = useCallback(async () => {
    const ids = alertIds.current;
    alertIds.current = [];
    await cancelIds(ids);
    const r = runRef.current;
    if (!r || !(await ensurePermission())) return;
    const pending = r.steps.slice(r.index).map((s, i) => ({ label: s.label, endsAt: r.ends[r.index + i] }));
    alertIds.current = await scheduleStepAlerts(pending);
  }, []);

  const finish = useCallback(() => {
    setStatus("done");
    Vibration.vibrate([0, 300, 150, 300, 150, 300]);
    deactivateKeepAwake(KEEP_AWAKE).catch(() => {});
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setBigVisible(false), 4000);
  }, []);

  // Advance through any steps whose end time has passed (also catches up after the phone was locked).
  const advance = useCallback(() => {
    const r = runRef.current;
    if (!r || r.index >= r.steps.length) return;
    const now = Date.now();
    let moved = false;
    while (r.index < r.steps.length && now >= r.ends[r.index]) {
      const t = r.steps[r.index].tick;
      if (t) setTick(t, true);
      r.index++;
      moved = true;
    }
    if (moved) {
      if (r.index >= r.steps.length) finish();
      else if (AppState.currentState === "active") Vibration.vibrate(250);
    }
    rerender();
  }, [finish, setTick, rerender]);

  useEffect(() => {
    const iv = setInterval(() => {
      if (runRef.current && status === "running") advance();
      if (sessionEnd) {
        const left = Math.max(0, Math.ceil((sessionEnd - Date.now()) / 1000));
        setSessionLeft(left);
        if (left === 0) { setSessionEnd(null); Vibration.vibrate([0, 500, 200, 500]); }
      }
    }, 250);
    return () => clearInterval(iv);
  }, [advance, status, sessionEnd]);

  const run = useCallback<TimerApi["run"]>((steps, doneText = "GO!", doneLabel = "Next set") => {
    if (!steps.length) return;
    let t = Date.now();
    const ends = steps.map((s) => (t += s.seconds * 1000));
    runRef.current = { steps, ends, index: 0, doneText, doneLabel };
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setStatus("running");
    setBigVisible(prefs.bigTimer);
    activateKeepAwakeAsync(KEEP_AWAKE).catch(() => {});
    reschedule();
    rerender();
  }, [prefs.bigTimer, reschedule, rerender]);

  const api = useMemo<TimerApi>(() => {
    const shift = (ms: number) => {
      const r = runRef.current;
      if (!r) return;
      for (let i = r.index; i < r.ends.length; i++) r.ends[i] += ms;
    };
    return {
      status,
      ...snap,
      bigVisible,
      run,
      rest: (seconds, name) => run([{ label: `Rest · ${name}`, seconds }], "GO!", "Next set"),
      skip: () => {
        const cur = runRef.current;
        if (!cur || cur.index >= cur.steps.length) return;
        shift(Date.now() - cur.ends[cur.index]);
        advance();
        reschedule();
      },
      addTime: (seconds) => { shift(seconds * 1000); if (runRef.current) runRef.current.steps[runRef.current.index].seconds += seconds; reschedule(); rerender(); },
      stop: () => {
        runRef.current = null;
        rerender();
        setStatus("idle");
        setBigVisible(false);
        cancelIds(alertIds.current);
        alertIds.current = [];
        deactivateKeepAwake(KEEP_AWAKE).catch(() => {});
      },
      showBig: () => { setPrefs({ bigTimer: true }); if (status !== "idle") setBigVisible(true); },
      minimizeBig: () => { setPrefs({ bigTimer: false }); setBigVisible(false); },
      session: {
        left: sessionLeft,
        running: !!sessionEnd,
        toggle: async () => {
          await cancelIds(sessionIds.current);
          sessionIds.current = [];
          if (sessionEnd) { setSessionEnd(null); return; } // pause
          const end = Date.now() + sessionLeft * 1000;
          setSessionEnd(end);
          if (await ensurePermission()) {
            const alerts = [{ label: "Session over. Great work!", endsAt: end }];
            if (sessionLeft > 600) alerts.unshift({ label: "10 minutes left: time for the finisher", endsAt: end - 600_000 });
            sessionIds.current = await scheduleStepAlerts(alerts, "session");
          }
        },
        reset: () => { cancelIds(sessionIds.current); sessionIds.current = []; setSessionEnd(null); setSessionLeft(SESSION); },
      },
    };
  }, [status, snap, bigVisible, run, sessionLeft, sessionEnd, advance, reschedule, rerender, setPrefs]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useTimer() {
  const t = useContext(Ctx);
  if (!t) throw new Error("useTimer must be used inside TimerProvider");
  return t;
}
