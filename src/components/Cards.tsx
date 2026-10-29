// Exercise, finisher, stretch and swim cards.
import React from "react";
import { Pressable, Text, View } from "react-native";
import type { Day, Exercise, Rep } from "../data/types";
import { REP_OPTIONS, SET_OPTIONS } from "../data/plan";
import { ALTERNATIVES } from "../data/muscles";
import { STRETCHES, ROUND_OPTIONS } from "../data/stretches";
import { SWIM_BLOCKS, SWIM_MUSCLES } from "../data/swim";
import {
  cuesOf, musclesOf, normalizeSetup, repLabel, repSuffix, repSummary, shownName, stretchOptions, stretchSetup,
  stretchSteps, stretchUnit, swimName, swimSteps,
} from "../logic";
import { useStore } from "../store";
import { useTimer } from "../timer";
import { fonts, useColors } from "../theme";
import { ShowPassButton } from "../passes";
import { Btn, Check, CollapsibleCard, HowTo, MuscleBox, OptionPicker, T, images, openLink, youtube } from "./ui";

/* ---------------- exercise ---------------- */

export function ExerciseCard({ day, index, exercise: e, open, onToggle }: { day: Day; index: number; exercise: Exercise; open: boolean; onToggle: () => void }) {
  const c = useColors();
  const { setups, setSetup, ticks, setTick, swaps, setSwap } = useStore();
  const timer = useTimer();
  const [swapOpen, setSwapOpen] = React.useState(false);
  const key = day.key + index;
  const setup = normalizeSetup(setups[key], e);
  const name = shownName(e, swaps[key]);
  const swapped = name !== e.name;
  const allowMax = e.reps.includes("max");
  const repOpts: Rep[] = allowMax ? ["max", ...REP_OPTIONS] : REP_OPTIONS;
  const done = Array.from({ length: setup.sets }, (_, s) => !!ticks[`${key}-${s}`]);
  const mm = musclesOf(name);
  const suffix = repSuffix(e);

  const changeSets = (n: number) => {
    const reps = setup.reps.slice(0, n);
    while (reps.length < n) reps.push(reps[reps.length - 1]);
    setSetup(key, { sets: n, reps });
  };

  return (
    <CollapsibleCard
      title={name + (swapped ? "  ⇄" : "")}
      meta={(swapped ? `Instead of ${e.name}` : `Plan: ${e.sets} × ${e.reps}`) + ` · rest ${e.rest}s`}
      badge={repSummary(setup) + (suffix ? ` ${suffix}` : "")}
      done={done.filter(Boolean).length}
      total={setup.sets}
      open={open}
      onToggle={onToggle}
      complete={done.every(Boolean)}
    >
      {mm ? <MuscleBox main={mm.main} helps={mm.helps} /> : null}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center", marginTop: 12 }}>
        <T variant="label">Sets</T>
        <OptionPicker label="Number of sets" value={setup.sets} options={SET_OPTIONS} onChange={changeSets} />
        <T variant="label">All sets</T>
        <OptionPicker<Rep> label="Reps for every set" value={null} placeholder="reps…" options={repOpts} format={repLabel}
          onChange={(r) => setSetup(key, { sets: setup.sets, reps: Array(setup.sets).fill(r) })} />
        {setups[key] ? <Pressable onPress={() => setSetup(key, null)}><Text style={{ color: c.muted, textDecorationLine: "underline", fontSize: 13 }}>Reset to plan</Text></Pressable> : null}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {setup.reps.map((r, s) => (
          <Check key={s} on={done[s]} label={`Set ${s + 1}`} onPress={() => {
            const on = !done[s];
            setTick(`${key}-${s}`, on);
            if (on) timer.rest(e.rest, name);
          }}>
            <OptionPicker<Rep> label={`Reps for set ${s + 1}`} value={r} options={repOpts} format={repLabel}
              onChange={(v) => { const reps = [...setup.reps]; reps[s] = v; setSetup(key, { sets: setup.sets, reps }); }} />
          </Check>
        ))}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        <Btn kind="primary" title={`Rest ${e.rest}s`} onPress={() => timer.rest(e.rest, name)} />
        {ALTERNATIVES[e.name] ? <Btn title="⇄ Swap" onPress={() => setSwapOpen(!swapOpen)} /> : null}
        <Btn title="▶ Watch demo" onPress={() => openLink(youtube(name))} />
        <Btn title="See images" onPress={() => openLink(images(name))} />
      </View>

      {swapOpen && ALTERNATIVES[e.name] ? (
        <View style={{ marginTop: 10, borderWidth: 1, borderStyle: "dashed", borderColor: c.accent, borderRadius: 10, padding: 10, gap: 6 }}>
          <T variant="muted" style={{ fontFamily: fonts.bodyBold }}>Machine or bench busy? Do this instead today:</T>
          {[e.name, ...ALTERNATIVES[e.name]].map((o, j) => {
            const cur = (swaps[key] || 0) === j;
            const works = musclesOf(o);
            return (
              <Pressable key={o} accessibilityRole="button" accessibilityState={{ selected: cur }}
                onPress={() => { setSwap(key, j); setSwapOpen(false); }}
                style={{ borderWidth: cur ? 2 : 1, borderColor: cur ? c.done : c.line, backgroundColor: c.bg, borderRadius: 8, padding: 10 }}>
                <Text style={{ color: c.ink, fontFamily: fonts.bodyBold, fontSize: 15 }}>{cur ? "✓ " : ""}{o}</Text>
                <Text style={{ color: c.muted, fontSize: 12, marginTop: 2 }}>{j === 0 ? "Original" : works ? `Works ${works.main.join(", ")}` : ""}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <HowTo items={cuesOf(name)} />
    </CollapsibleCard>
  );
}

/* ---------------- finisher ---------------- */

export function FinisherCard({ day }: { day: Day }) {
  const c = useColors();
  const { ticks, setTick } = useStore();
  const id = day.key + "fin";
  const on = !!ticks[id];
  return (
    <View style={{ backgroundColor: on ? c.doneSoft : c.surface, borderColor: on ? c.done : c.line, borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View><T variant="title">Finisher</T><T variant="muted">Last ~10 min of the hour</T></View>
      </View>
      <T>{day.finisher} Then do the cool-down in the Stretching tab.</T>
      <View style={{ flexDirection: "row" }}><Check on={on} label="Done" onPress={() => setTick(id, !on)} /></View>
    </View>
  );
}

/* ---------------- stretch ---------------- */

export function StretchCard({ stretchKey, tickBase, open, onToggle }: { stretchKey: string; tickBase: string; open: boolean; onToggle: () => void }) {
  const { stretchSetups, setStretchSetup, ticks, setTick } = useStore();
  const timer = useTimer();
  const c = useColors();
  const s = STRETCHES[stretchKey];
  const setup = stretchSetup(stretchKey, stretchSetups[stretchKey]);
  const done = Array.from({ length: setup.rounds }, (_, r) => !!ticks[`${tickBase}-${r}`]);
  const type = s.type === "hold" ? "Static hold" : s.type === "reps" ? "Dynamic move" : "";
  return (
    <CollapsibleCard
      title={s.name}
      meta={<Text><Text style={{ color: c.accentText, fontFamily: fonts.bodyBold }}>{s.area}</Text>{type ? ` · ${type}` : ""}</Text>}
      badge={`${setup.rounds} × ${stretchUnit(stretchKey, setup.value)}`}
      done={done.filter(Boolean).length}
      total={setup.rounds}
      open={open}
      onToggle={onToggle}
      complete={done.every(Boolean)}
    >
      <MuscleBox main={s.muscles} helps={[]} stretch />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center", marginTop: 12 }}>
        <T variant="label">Rounds</T>
        <OptionPicker label="Rounds" value={setup.rounds} options={ROUND_OPTIONS} onChange={(r) => setStretchSetup(stretchKey, { ...setup, rounds: r })} />
        <T variant="label">{s.type === "hold" ? "Hold (sec)" : s.type === "reps" ? "Reps" : "Time (sec)"}</T>
        <OptionPicker label={s.type === "reps" ? "Reps" : "Seconds"} value={setup.value} options={stretchOptions(stretchKey)} onChange={(v) => setStretchSetup(stretchKey, { ...setup, value: v })} />
        {stretchSetups[stretchKey] ? <Pressable onPress={() => setStretchSetup(stretchKey, null)}><Text style={{ color: c.muted, textDecorationLine: "underline", fontSize: 13 }}>Reset</Text></Pressable> : null}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {done.map((on, r) => <Check key={r} on={on} label={`Round ${r + 1}`} onPress={() => setTick(`${tickBase}-${r}`, !on)} />)}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        <Btn kind="primary" title="⏱ Start timer" onPress={() => timer.run(stretchSteps(stretchKey, tickBase, setup), "Done!", "Stretch finished")} />
        <Btn title="▶ Watch demo" onPress={() => openLink(youtube(s.name + " stretch"))} />
        <Btn title="See images" onPress={() => openLink(images(s.name + " stretch"))} />
      </View>
      <HowTo items={s.cues} />
    </CollapsibleCard>
  );
}

/* ---------------- swim ---------------- */

export function SwimCard({ day, open, onToggle }: { day: Day; open: boolean; onToggle: () => void }) {
  const c = useColors();
  const { ticks, setTick } = useStore();
  const timer = useTimer();
  const done = SWIM_BLOCKS.map((_, j) => !!ticks[`${day.key}W${j}`]);
  const total = SWIM_BLOCKS.reduce((a, b) => a + b.minutes, 0);
  return (
    <CollapsibleCard
      title={"Swim" + (day.rest ? " · Recovery" : "")}
      titleColor={c.pool}
      borderColor={c.pool}
      meta={day.rest ? "Easy recovery swim · no gym today" : "Right after the gym · keep it easy after leg day"}
      badge={`${total} min`}
      done={done.filter(Boolean).length}
      total={SWIM_BLOCKS.length}
      open={open}
      onToggle={onToggle}
      complete={done.every(Boolean)}
    >
      <MuscleBox main={SWIM_MUSCLES.main} helps={SWIM_MUSCLES.helps} />
      <View style={{ gap: 8, marginTop: 12 }}>
        {SWIM_BLOCKS.map((b, j) => {
          const on = done[j];
          const text = day.rest && j === 2 ? "Freestyle or breaststroke at a very easy pace. Rest as often as you like; today is for recovery." : b.text;
          return (
            <Pressable key={j} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => setTick(`${day.key}W${j}`, !on)}
              style={{ borderWidth: 1, borderColor: on ? c.done : c.line, backgroundColor: on ? c.doneSoft : "transparent", borderRadius: 10, padding: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: on ? c.done : c.muted, backgroundColor: on ? c.done : "transparent", alignItems: "center", justifyContent: "center" }}>
                  {on ? <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>✓</Text> : null}
                </View>
                <T variant="bold">{swimName(day.rest, j)}</T>
                <T variant="muted" style={{ fontFamily: fonts.bodyBold }}>{b.minutes} min</T>
              </View>
              <T variant="muted" style={{ marginTop: 4, marginLeft: 26, fontSize: 14 }}>{text}</T>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        <Btn kind="primary" color={c.pool} title="▶ Start swim timer" onPress={() => timer.run(swimSteps(day), "Done!", "Swim complete")} />
        <Btn title="▶ Watch technique" onPress={() => openLink(youtube("freestyle breathing for beginners swimming"))} />
        <ShowPassButton kind="swim" />
      </View>
      <HowTo title="Swim tips" items={[
        "For the first 3–4 weeks keep every swim easy. Build technique and breathing first.",
        "Breathe out slowly under water, and breathe in only when you turn your head.",
        day.rest ? "Monday is your recovery day, so keep the pace gentle." : "Your legs are tired after leg day, so let your arms do more of the work and keep a gentle kick.",
        "Have a light snack 1.5–2 hours before. Don't swim on a full stomach.",
        "Drink water before and after. You sweat in the pool too.",
        "If a shoulder hurts, stop and rest. Don't push through shoulder pain.",
      ]} />
    </CollapsibleCard>
  );
}
