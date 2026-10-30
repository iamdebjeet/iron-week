// Walking zone: pick a goal, walk with live time / steps / distance / pace, optional brisk mode
// (switch easy ↔ fast every 3 min). On finish the steps are checked against Health Connect and saved.
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Switch, Text, Vibration, View } from "react-native";
import { router } from "expo-router";
import { Pedometer } from "expo-sensors";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fmt } from "../logic";
import { BRISK_SWITCH_SEC, WALK_GOALS, type WalkGoal, briskPhase, distanceKm, paceFmt, paceMinPerKm, walkGoalLabel, walkMinutes } from "../logic/activity";
import { previousDates, weekdayOf } from "../logic/history";
import { readSteps } from "../health";
import { cancelWalkAlerts, ensurePermission, notifyNow, scheduleWalkAlerts } from "../notifications";
import { useActivity } from "../activity";
import { useNow } from "../hooks/useNow";
import { useStore } from "../store";
import { fonts, useColors } from "../theme";
import { Btn, T } from "../components/ui";

const KEEP_AWAKE = "iron-week-walk";
const SHORT: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

export function WalkScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { addWalk, walks, history, today } = useStore();
  const a = useActivity();
  const now = useNow(1000);
  const [goal, setGoal] = useState<WalkGoal>(WALK_GOALS[1]);
  const [brisk, setBrisk] = useState(false);
  const [start, setStart] = useState<number | null>(null);
  const [steps, setSteps] = useState(0);
  const [sensor, setSensor] = useState<"unknown" | "ok" | "none">("unknown");
  const [done, setDone] = useState<{ min: number; steps: number } | null>(null);
  const sub = useRef<{ remove: () => void } | null>(null);
  const goalHit = useRef(false);
  const lastPhase = useRef<string | null>(null);

  useEffect(() => () => { sub.current?.remove(); deactivateKeepAwake(KEEP_AWAKE).catch(() => {}); }, []);

  const elapsed = start ? Math.max(0, Math.floor((now.getTime() - start) / 1000)) : 0;
  const km = distanceKm(steps, a.stride);
  const progress = goal.kind === "min" ? elapsed / (goal.value * 60) : steps / goal.value;
  const phase = brisk && start ? briskPhase(elapsed) : null;

  // Live cues while the screen is open (the notifications cover a locked phone)
  useEffect(() => {
    if (!start || !phase || lastPhase.current === phase) return;
    if (lastPhase.current) Vibration.vibrate([0, 200, 100, 200]);
    lastPhase.current = phase;
  }, [start, phase]);
  const reached = !!start && progress >= 1;
  useEffect(() => {
    if (!reached || goalHit.current) return;
    goalHit.current = true;
    Vibration.vibrate([0, 400, 150, 400]);
    if (goal.kind === "steps") notifyNow("Walk goal reached 🎉", `${goal.value.toLocaleString("en-IN")} steps. Keep going or finish your walk.`).catch(() => {});
  }, [reached, goal]);

  const begin = async () => {
    const t = Date.now();
    setStart(t); setSteps(0); setDone(null); goalHit.current = false; lastPhase.current = null;
    activateKeepAwakeAsync(KEEP_AWAKE).catch(() => {});
    if (await ensurePermission()) scheduleWalkAlerts(t, goal.kind === "min" ? goal.value : null, brisk, BRISK_SWITCH_SEC).catch(() => {});
    try {
      const perm = await Pedometer.requestPermissionsAsync();
      if (perm.granted && (await Pedometer.isAvailableAsync())) {
        setSensor("ok");
        sub.current = Pedometer.watchStepCount((r) => setSteps(r.steps));
      } else setSensor("none");
    } catch { setSensor("none"); }
  };

  const finish = async () => {
    if (!start) return;
    const end = Date.now();
    sub.current?.remove(); sub.current = null;
    deactivateKeepAwake(KEEP_AWAKE).catch(() => {});
    cancelWalkAlerts().catch(() => {});
    // Health Connect has the fuller count (it keeps counting with the screen off); take the larger one.
    const hc = await readSteps(new Date(start), new Date(end)).catch(() => null);
    const final = Math.max(steps, hc ?? 0);
    addWalk({ start, end, steps: final, brisk });
    setDone({ min: Math.round((end - start) / 60_000), steps: final });
    setStart(null);
    a.refresh();
  };

  const last7 = [...previousDates(today, 6), today].map((d) => ({
    d, label: d === today ? "Today" : SHORT[weekdayOf(d)],
    min: d === today ? walks.reduce((x, w) => x + walkMinutes(w), 0) : history[d]?.walkMin ?? 0,
  }));
  const maxMin = Math.max(30, ...last7.map((x) => x.min));
  const stat = (label: string, value: string) => (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ fontFamily: fonts.display, fontSize: 28, color: c.ink }}>{value}</Text>
      <T variant="label">{label}</T>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32, paddingHorizontal: Math.max(16, insets.left), gap: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <T variant="display" style={{ fontSize: 30 }}>Walking zone</T>
        <Btn title={start ? "Minimize" : "Close ✕"} onPress={() => router.back()} />
      </View>

      {start ? (
        <View style={{ alignItems: "center", gap: 14, borderWidth: 1.5, borderColor: c.done, borderRadius: 16, padding: 18, backgroundColor: c.surface }}>
          {phase ? (
            <Text style={{ fontFamily: fonts.display, fontSize: 24, color: phase === "fast" ? c.warn : c.good, textTransform: "uppercase" }}>
              {phase === "fast" ? "💨 Walk fast" : "🚶 Walk easy"} · {fmt(BRISK_SWITCH_SEC - (elapsed % BRISK_SWITCH_SEC))}
            </Text>
          ) : null}
          <Text style={{ fontFamily: fonts.display, fontSize: 72, color: c.ink, fontVariant: ["tabular-nums"] }} accessibilityLabel={`${Math.floor(elapsed / 60)} minutes`}>{fmt(elapsed)}</Text>
          <View style={{ flexDirection: "row", alignSelf: "stretch" }}>
            {stat("Steps", sensor === "none" ? "–" : steps.toLocaleString("en-IN"))}
            {stat("Km", km.toFixed(2))}
            {stat("Pace", paceFmt(paceMinPerKm(elapsed, km)))}
          </View>
          <View style={{ alignSelf: "stretch", gap: 4 }}>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: c.line, overflow: "hidden" }}>
              <View style={{ width: `${Math.min(100, progress * 100)}%`, height: "100%", borderRadius: 4, backgroundColor: c.done }} />
            </View>
            <T variant="muted" style={{ textAlign: "center" }}>Goal: {walkGoalLabel(goal)}{progress >= 1 ? " · reached 🎉" : ""}</T>
          </View>
          {sensor === "none" ? <T variant="muted" style={{ textAlign: "center" }}>No live step sensor; Health Connect fills in the steps when you finish.</T> : null}
          <Btn kind="primary" title="■ Finish walk" onPress={finish} style={{ paddingHorizontal: 28, paddingVertical: 12 }} />
        </View>
      ) : (
        <View style={{ gap: 14 }}>
          {done ? (
            <View style={{ borderWidth: 1.5, borderColor: c.done, borderRadius: 14, padding: 14, backgroundColor: c.surface, gap: 4 }}>
              <T variant="title">Walk saved ✓</T>
              <T variant="muted">{done.min} min · {done.steps.toLocaleString("en-IN")} steps · {distanceKm(done.steps, a.stride).toFixed(2)} km. Walks work your calves, glutes and hamstrings.</T>
            </View>
          ) : null}
          <T variant="label">Goal</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {WALK_GOALS.map((g) => {
              const sel = g.kind === goal.kind && g.value === goal.value;
              return (
                <Pressable key={g.kind + g.value} onPress={() => setGoal(g)} accessibilityRole="radio" accessibilityState={{ selected: sel }}
                  style={{ minHeight: 44, paddingHorizontal: 14, justifyContent: "center", borderRadius: 10, borderWidth: sel ? 1.5 : 1, borderColor: sel ? c.accent : c.line, backgroundColor: c.surface }}>
                  <Text style={{ fontFamily: sel ? fonts.bodyBold : fonts.bodyMedium, color: sel ? c.accentText : c.ink }}>{walkGoalLabel(g)}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 12, padding: 12 }}>
            <View style={{ flex: 1 }}>
              <T variant="bold">Brisk mode</T>
              <T variant="muted">A beep every 3 min to switch between easy and fast walking.</T>
            </View>
            <Switch value={brisk} onValueChange={setBrisk} accessibilityLabel="Brisk mode" trackColor={{ true: c.done, false: c.line }} />
          </View>
          <Btn kind="primary" color={c.done} title="▶ Start walk" onPress={begin} style={{ alignItems: "center", paddingVertical: 14 }} />
        </View>
      )}

      <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, gap: 8 }}>
        <T variant="label">Walks · last 7 days</T>
        {last7.map((x) => (
          <View key={x.d} style={{ flexDirection: "row", alignItems: "center", gap: 10 }} accessible accessibilityLabel={`${x.label}: ${x.min} minutes`}>
            <Text style={{ width: 44, fontFamily: x.label === "Today" ? fonts.bodyBold : fonts.bodyMedium, color: c.ink, fontSize: 13 }}>{x.label}</Text>
            <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: c.line, overflow: "hidden" }}>
              <View style={{ width: `${(x.min / maxMin) * 100}%`, height: "100%", borderRadius: 4, backgroundColor: x.min >= 20 ? c.done : c.muted }} />
            </View>
            <Text style={{ width: 52, textAlign: "right", fontFamily: fonts.bodyMedium, color: c.muted, fontSize: 13 }}>{x.min} min</Text>
          </View>
        ))}
        <T variant="muted" style={{ fontSize: 12 }}>A walk of 20 min or more keeps your streak going.</T>
      </View>
    </ScrollView>
  );
}
