// Today tab: greeting + session chip, day tabs, Workout / Stretch / Swim views, muscles worked.
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { STRETCHES, STRETCH_PLANS } from "../data/stretches";
import { SWIM_BLOCKS } from "../data/swim";
import type { PlanDay } from "../data/types";
import { DAY_ORDER, FULL_DAY, groupMinutes, localDate, normalizeSetup, stretchSetup, stretchSteps, stretchTickBase, todayKey } from "../logic";
import { useStore } from "../store";
import { useTimer } from "../timer";
import { ShowPassButton } from "../passes";
import { fonts, useColors } from "../theme";
import { ExerciseCard, FinisherCard, StretchCard, SwimCard } from "../components/Cards";
import { MusclesWorked, WeeklyOverview } from "../components/Panels";
import { SessionChip } from "../components/TimerViews";
import { QuoteCard } from "../components/QuoteCard";
import { WaterChip } from "../components/Water";
import { BurnedChip, StepsChip } from "../components/Activity";
import { useNow } from "../hooks/useNow";
import { contextLine, pickQuote, type QuoteContext } from "../logic/quotes";
import { isGymMode } from "../logic/time";
import { useProgress } from "../progress";
import { WorkoutSummary } from "../components/WorkoutSummary";
import { UpdateBanner } from "../components/UpdateBanner";
import { Btn, T } from "../components/ui";

type View3 = "workout" | "stretch" | "swim";
const VIEW_LABEL: Record<View3, string> = { workout: "Workout", stretch: "Stretch", swim: "Swim" };

const greeting = (hour: number) => (hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");

export function TodayScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { setups, stretchSetups, ticks, resetDay, plan, profile, week, favQuotes, toggleFavQuote, quoteOffset, nextQuote, setPrefs } = useStore();
  const progressInfo = useProgress();
  const timer = useTimer();
  const now = useNow();
  const hour = now.getHours();
  const [dayKey, setDayKey] = useState(todayKey());
  const [view, setView] = useState<View3>("workout");
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const [weekly, setWeekly] = useState(false);
  const [summary, setSummary] = useState(false);
  // The summary also opens by itself once when the 60-min session runs out (if any set was done).
  const [seenEnd, setSeenEnd] = useState<number | null>(null);
  const endedAt = timer.session.endedAt;
  const [resetArmed, setResetArmed] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const day = plan.find((d) => d.key === dayKey)!;
  // 3-way switch on gym + swim days, 2-way otherwise. A swim-only day opens on its swim.
  const views: View3[] = day.rest ? (day.swim ? ["swim", "stretch"] : ["stretch"]) : day.swim ? ["workout", "stretch", "swim"] : ["workout", "stretch"];
  const v = views.includes(view) ? view : views[0];

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  // Quote and gym mode are about today (not the day tab being looked at).
  const today = plan.find((d) => d.key === DAY_ORDER[now.getDay()])!;
  const qctx: QuoteContext = { day: today, streak: progressInfo.streak, missedYesterday: progressInfo.missedYesterday, prYesterday: progressInfo.prYesterday };
  const quote = pickQuote(localDate(now), qctx, quoteOffset);
  const gymMode = isGymMode(now, today, week.gymStart, week.swimStart, timer.session.running);

  const isOpen = (id: string, auto: boolean) => (id in opened ? opened[id] : auto);
  const toggle = (id: string, cur: boolean) => setOpened((o) => ({ ...o, [id]: !cur }));

  const setDone = (d: PlanDay, i: number) => {
    const s = normalizeSetup(setups[d.plan + i], d.exercises[i]);
    return Array.from({ length: s.sets }, (_, x) => !!ticks[`${d.key}${i}-${x}`]);
  };
  const firstOpenEx = day.exercises.findIndex((_, i) => !setDone(day, i).every(Boolean));
  const doneSets = day.exercises.reduce((a, _, i) => a + setDone(day, i).filter(Boolean).length, 0);
  const totalSets = day.exercises.reduce((a, e, i) => a + normalizeSetup(setups[day.plan + i], e).sets, 0);
  const nTicks = Object.keys(ticks).filter((k) => k.startsWith(day.key)).length;

  const onReset = () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    if (!resetArmed) { setResetArmed(true); resetTimer.current = setTimeout(() => setResetArmed(false), 4000); return; }
    setResetArmed(false); resetDay(day.key); setOpened({});
  };

  const swimCard = () => {
    const id = "w-" + day.key;
    const allDone = SWIM_BLOCKS.every((_, j) => ticks[`${day.key}W${j}`]);
    const o = isOpen(id, !allDone);
    return <SwimCard day={day} open={o} onToggle={() => toggle(id, o)} />;
  };

  const progress = (done: number, total: number) => (
    <View style={{ height: 6, backgroundColor: c.line, borderRadius: 3, overflow: "hidden", marginVertical: 10 }}>
      <View style={{ width: `${total ? (done / total) * 100 : 0}%`, height: "100%", backgroundColor: c.done }} />
    </View>
  );

  const stretchGroup = (g: "w" | "c") => {
    const keys = STRETCH_PLANS[day.plan][g];
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
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: Math.max(16, insets.left) }}>
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <View style={{ flexShrink: 1 }}>
            <T variant="muted" style={{ fontFamily: fonts.bodyMedium }}>{greeting(hour)}{profile.name ? `, ${profile.name}` : ""}</T>
            <T variant="display" style={{ fontSize: 34 }}>{FULL_DAY[day.key]}</T>
          </View>
          <SessionChip />
        </View>
        {gymMode ? null : <View style={{ marginTop: 12 }}><UpdateBanner /></View>}

        {/* Gym mode: quote and water chip share one slim line so the workout fills the screen */}
        <View style={gymMode ? { marginTop: 12, flexDirection: "row", gap: 8 } : { marginTop: 12, gap: 10 }}>
          {gymMode ? <WaterChip slim /> : null}
          <View style={{ flex: gymMode ? 1 : undefined }}>
            <QuoteCard quote={quote} context={contextLine(qctx)} saved={favQuotes.includes(quote.id)} onSave={() => toggleFavQuote(quote.id)} onAnother={nextQuote} slim={gymMode} />
          </View>
          {gymMode ? null : (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1.3 }}><WaterChip /></View>
              <View style={{ flex: 1, gap: 8 }}><StepsChip /><BurnedChip /></View>
            </View>
          )}
        </View>

        {/* Day tabs */}
        <View style={{ flexDirection: "row", gap: 5, marginTop: 16, marginBottom: 14 }}>
          {plan.map((d) => {
            const sel = d.key === dayKey;
            const swim = d.swim;
            return (
              <Pressable key={d.key} accessibilityRole="tab" accessibilityState={{ selected: sel }} accessibilityLabel={FULL_DAY[d.key]} onPress={() => setDayKey(d.key)}
                style={{ flex: 1, alignItems: "center", paddingTop: 7, paddingBottom: 5, minHeight: 44, borderRadius: 8, borderWidth: 1,
                  borderColor: sel ? c.accent : c.line, backgroundColor: sel ? c.accent : c.surface, borderBottomWidth: swim ? 3 : 1, borderBottomColor: swim ? c.pool : sel ? c.accent : c.line }}>
                <Text maxFontSizeMultiplier={1.4} style={{ fontFamily: fonts.displayBold, fontSize: 15, color: sel ? c.accentInk : c.ink, textTransform: "uppercase" }}>{d.short}</Text>
                <Text maxFontSizeMultiplier={1.4} style={{ fontFamily: fonts.bodyMedium, fontSize: 9.5, color: sel ? c.accentInk : c.muted }} numberOfLines={1}>{d.rest ? (d.swim ? "Swim" : "Rest") : d.title.split(" · ")[0]}</Text>
              </Pressable>
            );
          })}
        </View>

        {day.rest ? (
          <View style={{ borderWidth: 1, borderStyle: "dashed", borderColor: c.line, borderRadius: 12, padding: 18, alignItems: "center", marginBottom: 12 }}>
            <T variant="display" style={{ fontSize: 26 }}>{day.swim ? "No gym · Swim day" : "Rest day"}</T>
            <T variant="muted" style={{ textAlign: "center", marginTop: 4 }}>{day.swim ? "No gym today. Do your easy recovery swim, then the optional recovery stretch." : "No gym or swim today. The recovery stretch is there if you want it."} Sleep well and eat enough protein.</T>
          </View>
        ) : null}

        {/* Workout / Stretch / Swim switch */}
        {views.length > 1 ? <View style={{ flexDirection: "row", borderWidth: 1, borderColor: c.line, borderRadius: 10, overflow: "hidden", marginBottom: 16, backgroundColor: c.surface }}>
          {views.map((k) => (
            <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: v === k }} onPress={() => setView(k)}
              style={{ flex: 1, paddingVertical: 10, minHeight: 44, justifyContent: "center", alignItems: "center", backgroundColor: v === k ? c.ink : "transparent" }}>
              <Text style={{ fontFamily: fonts.displayBold, fontSize: 16, textTransform: "uppercase", color: v === k ? c.bg : k === "swim" ? c.pool : c.muted, letterSpacing: 0.5 }}>{VIEW_LABEL[k]}</Text>
            </Pressable>
          ))}
        </View> : null}

        {v === "workout" ? (
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 10 }}>
              <T variant="display" style={{ fontSize: 26, flexShrink: 1 }}>{day.title}</T>
              <T variant="muted" style={{ fontFamily: fonts.bodyBold }}>{doneSets} / {totalSets} sets</T>
            </View>
            {progress(doneSets, totalSets)}
            {progressInfo.lightWeek ? (
              <View style={{ borderWidth: 1.5, borderColor: c.good, borderRadius: 12, padding: 12, marginBottom: 12, gap: 6 }}>
                <T variant="bold">🌤 Light week (week {progressInfo.week})</T>
                <T variant="muted">Every 7th week: use about 60% of your usual weight, same reps. Your joints and muscles catch up, and you come back stronger.</T>
                <View style={{ flexDirection: "row" }}><Btn small title="Got it" onPress={() => setPrefs({ lightWeekSeen: progressInfo.week })} /></View>
              </View>
            ) : null}
            <View style={{ borderWidth: 1, borderStyle: "dashed", borderColor: c.line, borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <T variant="muted" style={{ fontSize: 14 }}><Text style={{ color: c.ink, fontFamily: fonts.bodyBold }}>0–8 min warm-up: </Text>5 min treadmill or cycle, then the warm-up moves in the Stretch tab, then 1–2 light sets of the first exercise.</T>
              <View style={{ flexDirection: "row", marginTop: 8 }}><ShowPassButton kind="gym" /></View>
            </View>
            <View style={{ gap: 12 }}>
              {day.exercises.map((e, i) => {
                const id = `x-${day.key}${i}`;
                const o = isOpen(id, i === firstOpenEx);
                return <ExerciseCard key={id} day={day} index={i} exercise={e} open={o} onToggle={() => toggle(id, o)} />;
              })}
              <FinisherCard day={day} />
              {doneSets ? <Btn kind="primary" title="✓ Finish workout" onPress={() => setSummary(true)} style={{ alignItems: "center" }} /> : null}
            </View>
          </View>
        ) : v === "swim" ? (
          <View style={{ gap: 12 }}>{swimCard()}</View>
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

      <WeeklyOverview visible={weekly} onClose={() => setWeekly(false)} />
      <WorkoutSummary visible={summary || (!!endedAt && endedAt !== seenEnd && doneSets > 0)} onClose={() => { setSummary(false); setSeenEnd(endedAt); }} day={day} doneSets={doneSets} totalSets={totalSets} />
    </View>
  );
}
