// The one screen: day tabs, Workout / Stretching views, muscles worked, timers.
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DAYS } from "./data/plan";
import { STRETCHES, STRETCH_PLANS } from "./data/stretches";
import { SWIM_BLOCKS, SWIM_DAYS } from "./data/swim";
import type { Day } from "./data/types";
import { FULL_DAY, groupMinutes, getDay, normalizeSetup, stretchSetup, stretchSteps, stretchTickBase, todayKey } from "./logic";
import { useStore } from "./store";
import { useTimer } from "./timer";
import { ShowPassButton, usePasses } from "./passes";
import { fonts, useColors } from "./theme";
import { ExerciseCard, FinisherCard, StretchCard, SwimCard } from "./components/Cards";
import { MusclesWorked, MusicButtons, SettingsSheet, WeeklyOverview } from "./components/Panels";
import { BigTimer, TimerDock } from "./components/TimerViews";
import { Btn, T } from "./components/ui";

export function HomeScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { setups, stretchSetups, ticks, resetDay } = useStore();
  const timer = useTimer();
  const passes = usePasses();
  const [dayKey, setDayKey] = useState(todayKey());
  const [view, setView] = useState<"workout" | "stretch">("workout");
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const [weekly, setWeekly] = useState(false);
  const [settings, setSettings] = useState(false);
  const [resetArmed, setResetArmed] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const day = getDay(dayKey);
  const v = day.rest ? "stretch" : view;
  const swimDay = SWIM_DAYS.includes(day.key);

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  const isOpen = (id: string, auto: boolean) => (id in opened ? opened[id] : auto);
  const toggle = (id: string, cur: boolean) => setOpened((o) => ({ ...o, [id]: !cur }));

  const setDone = (d: Day, i: number) => {
    const s = normalizeSetup(setups[d.key + i], d.exercises[i]);
    return Array.from({ length: s.sets }, (_, x) => !!ticks[`${d.key}${i}-${x}`]);
  };
  const firstOpenEx = day.exercises.findIndex((_, i) => !setDone(day, i).every(Boolean));
  const doneSets = day.exercises.reduce((a, _, i) => a + setDone(day, i).filter(Boolean).length, 0);
  const totalSets = day.exercises.reduce((a, e, i) => a + normalizeSetup(setups[day.key + i], e).sets, 0);
  const nTicks = Object.keys(ticks).filter((k) => k.startsWith(day.key)).length;

  const onReset = () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    if (!resetArmed) { setResetArmed(true); resetTimer.current = setTimeout(() => setResetArmed(false), 4000); return; }
    setResetArmed(false); resetDay(day.key); setOpened({});
  };

  const swimCard = (auto: boolean) => {
    const id = "w-" + day.key;
    const allDone = SWIM_BLOCKS.every((_, j) => ticks[`${day.key}W${j}`]);
    const o = isOpen(id, auto && !allDone);
    return <SwimCard day={day} open={o} onToggle={() => toggle(id, o)} />;
  };

  const progress = (done: number, total: number) => (
    <View style={{ height: 6, backgroundColor: c.line, borderRadius: 3, overflow: "hidden", marginVertical: 10 }}>
      <View style={{ width: `${total ? (done / total) * 100 : 0}%`, height: "100%", backgroundColor: c.done }} />
    </View>
  );

  const stretchGroup = (g: "w" | "c") => {
    const keys = STRETCH_PLANS[day.key][g];
    let total = 0, done = 0;
    keys.forEach((k, i) => { const r = stretchSetup(k, stretchSetups[k]).rounds; for (let x = 0; x < r; x++) { total++; if (ticks[`${stretchTickBase(day.key, g, i)}-${x}`]) done++; } });
    const firstOpen = keys.findIndex((k, i) => { const r = stretchSetup(k, stretchSetups[k]).rounds; return !Array.from({ length: r }, (_, x) => ticks[`${stretchTickBase(day.key, g, i)}-${x}`]).every(Boolean); });
    const routine = () => {
      const steps = keys.flatMap((k, i) => [
        { label: `Get ready · ${STRETCHES[k].name}`, seconds: 5 },
        ...stretchSteps(k, stretchTickBase(day.key, g, i), stretchSetup(k, stretchSetups[k])),
      ]);
      timer.run(steps, "Done!", g === "w" ? "Warm-up complete" : "Cool-down complete");
    };
    return (
      <View key={g} style={{ marginBottom: 26 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <T variant="display" style={{ fontSize: 26 }}>{g === "w" ? "Warm-up mobility" : "Cool-down stretches"}</T>
          <T variant="muted" style={{ fontFamily: fonts.bodyBold }}>{done} / {total}</T>
        </View>
        <T variant="muted">{g === "w" ? "Full-body moves before lifting, right after 5 min of cardio" : "Head-to-toe stretches after the finisher, changing each day"} · {keys.length} moves · about {groupMinutes(keys, stretchSetups)} min</T>
        {progress(done, total)}
        <Btn kind="primary" title={`▶ Start full ${g === "w" ? "warm-up" : "cool-down"} (guided timer)`} onPress={routine} style={{ alignItems: "center", marginBottom: 12 }} />
        <View style={{ gap: 12 }}>
          {keys.map((k, i) => {
            const id = `s-${day.key}${g}${i}`;
            const o = isOpen(id, i === firstOpen);
            return <StretchCard key={id} stretchKey={k} tickBase={stretchTickBase(day.key, g, i)} open={o} onToggle={() => toggle(id, o)} />;
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 180 + insets.bottom, paddingHorizontal: Math.max(16, insets.left) }}>
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <T variant="display" style={{ fontSize: 34 }}>Iron Week</T>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Entry passes" onPress={passes.openManager} hitSlop={8}
              style={{ borderWidth: 1, borderColor: c.line, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text style={{ color: c.ink, fontFamily: fonts.bodyBold }}>🎫 Passes</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Reminder settings" onPress={() => setSettings(true)} hitSlop={8}
              style={{ borderWidth: 1, borderColor: c.line, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text style={{ color: c.ink, fontFamily: fonts.bodyBold }}>⏰</Text>
            </Pressable>
          </View>
        </View>
        <View style={{ marginTop: 10 }}><MusicButtons /></View>

        {/* Day tabs */}
        <View style={{ flexDirection: "row", gap: 5, marginTop: 16, marginBottom: 14 }}>
          {DAYS.map((d) => {
            const sel = d.key === dayKey;
            const swim = SWIM_DAYS.includes(d.key);
            return (
              <Pressable key={d.key} accessibilityRole="tab" accessibilityState={{ selected: sel }} onPress={() => setDayKey(d.key)}
                style={{ flex: 1, alignItems: "center", paddingTop: 7, paddingBottom: 5, borderRadius: 8, borderWidth: 1,
                  borderColor: sel ? c.accent : c.line, backgroundColor: sel ? c.accent : c.surface, borderBottomWidth: swim ? 3 : 1, borderBottomColor: swim ? c.pool : sel ? c.accent : c.line }}>
                <Text style={{ fontFamily: fonts.displayBold, fontSize: 15, color: sel ? c.accentInk : c.ink, textTransform: "uppercase" }}>{d.short}</Text>
                <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 9.5, color: sel ? c.accentInk : c.muted }} numberOfLines={1}>{d.rest ? "Swim" : d.title.split(" · ")[0]}</Text>
              </Pressable>
            );
          })}
        </View>

        {day.rest ? (
          <View style={{ gap: 12, marginBottom: 22 }}>
            <View style={{ borderWidth: 1, borderStyle: "dashed", borderColor: c.line, borderRadius: 12, padding: 18, alignItems: "center" }}>
              <T variant="display" style={{ fontSize: 26 }}>Gym closed · Swim day</T>
              <T variant="muted" style={{ textAlign: "center", marginTop: 4 }}>No gym today. Do your easy recovery swim, then the optional recovery stretch below. Sleep well and eat enough protein.</T>
            </View>
            {swimCard(true)}
          </View>
        ) : (
          <View style={{ flexDirection: "row", borderWidth: 1, borderColor: c.line, borderRadius: 10, overflow: "hidden", marginBottom: 16, backgroundColor: c.surface }}>
            {(["workout", "stretch"] as const).map((k) => (
              <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: v === k }} onPress={() => setView(k)}
                style={{ flex: 1, paddingVertical: 10, alignItems: "center", backgroundColor: v === k ? c.ink : "transparent" }}>
                <Text style={{ fontFamily: fonts.displayBold, fontSize: 16, textTransform: "uppercase", color: v === k ? c.bg : c.muted, letterSpacing: 0.5 }}>{k === "workout" ? "Workout" : "Stretching"}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {v === "workout" ? (
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 10 }}>
              <T variant="display" style={{ fontSize: 26, flexShrink: 1 }}>{day.title}</T>
              <T variant="muted" style={{ fontFamily: fonts.bodyBold }}>{doneSets} / {totalSets} sets</T>
            </View>
            {progress(doneSets, totalSets)}
            <View style={{ borderWidth: 1, borderStyle: "dashed", borderColor: c.line, borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <T variant="muted" style={{ fontSize: 14 }}><Text style={{ color: c.ink, fontFamily: fonts.bodyBold }}>0–8 min warm-up: </Text>5 min treadmill or cycle, then the warm-up moves in the Stretching tab, then 1–2 light sets of the first exercise.</T>
              <View style={{ flexDirection: "row", marginTop: 8 }}><ShowPassButton kind="gym" /></View>
            </View>
            <View style={{ gap: 12 }}>
              {day.exercises.map((e, i) => {
                const id = `x-${day.key}${i}`;
                const o = isOpen(id, i === firstOpenEx);
                return <ExerciseCard key={id} day={day} index={i} exercise={e} open={o} onToggle={() => toggle(id, o)} />;
              })}
              <FinisherCard day={day} />
              {swimDay ? swimCard(firstOpenEx === -1) : null}
            </View>
          </View>
        ) : (
          <View>{stretchGroup("w")}{stretchGroup("c")}</View>
        )}

        {nTicks ? (
          <View style={{ alignItems: "center", marginTop: 18 }}>
            <Btn small kind={resetArmed ? "danger" : "plain"} onPress={onReset}
              title={resetArmed ? `Tap again to clear ${nTicks} tick${nTicks === 1 ? "" : "s"} for ${FULL_DAY[day.key]}` : `↺ Reset ${FULL_DAY[day.key]}'s ticks`} />
          </View>
        ) : null}

        <MusclesWorked day={day} onWeekly={() => setWeekly(true)} />
      </ScrollView>

      <TimerDock />
      <BigTimer />
      <WeeklyOverview visible={weekly} onClose={() => setWeekly(false)} />
      <SettingsSheet visible={settings} onClose={() => setSettings(false)} />
    </View>
  );
}
