// Welcome setup: 4 short steps on first launch (all skippable), reopened from Me → profile → Edit.
import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FULL_DAY } from "../logic";
import { REMINDER_TIMES, buildDays, timeLabel, workoutShort, type WeekSetup } from "../logic/plan";
import {
  BASE_WATER_L, EXPERIENCE_LABEL, GENDER_LABEL, GOAL_LABEL, STEP_GOAL, parseNum,
  type Experience, type Gender, type Goal, type Profile,
} from "../logic/profile";
import { ensurePermission } from "../notifications";
import { useStore } from "../store";
import { fonts, useColors } from "../theme";
import { Choice, Field, InfoRow, WeekPicker } from "../components/Form";
import { WeekTimes } from "../components/WeekEditor";
import { T } from "../components/ui";

const STEPS = ["Let's set you up", "Your goal", "Your week", "Reminders"];
const SUBTITLES = [
  "So water, calories and walk distance fit you. Saved only on this phone.",
  "This sets your food targets and how the plan talks to you.",
  "Tap a day to switch it between gym, swim, both or rest.",
  "A nudge with today's plan, and water reminders when they arrive.",
];
const opts = <K extends string>(labels: Record<K, string>) => (Object.keys(labels) as K[]).map((key) => ({ key, label: labels[key] }));
const numText = (n: number | null) => (n === null ? "" : String(n));

export function WelcomeScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const edit = useLocalSearchParams<{ edit?: string }>().edit === "1";
  const store = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(store.profile.name);
  const [gender, setGender] = useState<Gender>(store.profile.gender);
  const [age, setAge] = useState(numText(store.profile.age));
  const [height, setHeight] = useState(numText(store.profile.heightCm));
  const [weight, setWeight] = useState(numText(store.profile.weightKg));
  const [goal, setGoal] = useState<Goal>(store.profile.goal);
  const [experience, setExperience] = useState<Experience>(store.profile.experience);
  const [week, setWeek] = useState<WeekSetup>(store.week);
  // A brand-new user gets the daily reminder switched on by default.
  const [remind, setRemind] = useState(edit ? store.prefs.reminders : true);
  const [remindAt, setRemindAt] = useState(store.prefs.hour * 60 + store.prefs.minute);
  const [water, setWater] = useState(store.prefs.waterReminders);
  const [saving, setSaving] = useState(false);

  const nums = { age: parseNum(age, 10, 100), heightCm: parseNum(height, 100, 250), weightKg: parseNum(weight, 25, 300) };
  const bad = (s: string, v: number | null) => (s.trim() && v === null ? "Check this number" : "");
  const plan = buildDays(week);
  const last = step === STEPS.length - 1;

  // Leave only once `onboarded` is saved in state, or the tabs would redirect straight back here.
  const [leaving, setLeaving] = useState(false);
  const onboarded = store.prefs.onboarded;
  useEffect(() => {
    if (leaving && onboarded) { if (edit) router.back(); else router.replace("/"); }
  }, [leaving, onboarded, edit]);
  const leave = () => setLeaving(true);
  const skip = () => { if (!edit) store.setPrefs({ onboarded: true }); leave(); };
  const finish = async () => {
    setSaving(true);
    const profile: Profile = { name: name.trim(), gender, ...nums, goal, experience };
    store.setProfile(profile);
    store.setWeek(week);
    const allowed = remind ? await ensurePermission() : false;
    store.setPrefs({ onboarded: true, reminders: allowed, hour: Math.floor(remindAt / 60), minute: remindAt % 60, waterReminders: water });
    leave();
  };

  const body = [
    <View key="about" style={{ gap: 16 }}>
      <Field label="Name" value={name} onChange={setName} placeholder="Your first name" maxLength={30} />
      <Choice label="Gender" options={opts(GENDER_LABEL)} value={gender} onChange={setGender} />
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1, gap: 4 }}><Field label="Age" value={age} onChange={setAge} unit="years" keyboard="number-pad" maxLength={3} /><Err text={bad(age, nums.age)} /></View>
        <View style={{ flex: 1, gap: 4 }}><Field label="Height" value={height} onChange={setHeight} unit="cm" keyboard="number-pad" maxLength={3} /><Err text={bad(height, nums.heightCm)} /></View>
      </View>
      <View style={{ gap: 4 }}><Field label="Weight" value={weight} onChange={setWeight} unit="kg" keyboard="decimal-pad" maxLength={5} /><Err text={bad(weight, nums.weightKg)} /></View>
    </View>,
    <View key="goal" style={{ gap: 18 }}>
      <Choice label="Main goal" options={opts(GOAL_LABEL)} value={goal} onChange={setGoal} />
      <Choice label="Experience" options={opts(EXPERIENCE_LABEL)} value={experience} onChange={setExperience} />
    </View>,
    <View key="week" style={{ gap: 18 }}>
      <WeekPicker days={week.days} onChange={(days) => setWeek((w) => ({ ...w, days }))} />
      <WeekTimes week={week} onChange={(p) => setWeek((w) => ({ ...w, ...p }))} />
      <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 12, padding: 14, gap: 2 }}>
        <T variant="label" style={{ marginBottom: 4 }}>Your plan</T>
        {plan.map((d) => (
          <InfoRow key={d.key} label={FULL_DAY[d.key]} value={(d.workout ? workoutShort(d.workout) : d.swim ? "Recovery swim" : "Rest") + (d.swim && d.workout ? " + Swim" : "")} />
        ))}
      </View>
      <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 12, padding: 14, gap: 2 }}>
        <T variant="label" style={{ marginBottom: 4 }}>Your goals</T>
        <InfoRow label="Your goal" value={`${GOAL_LABEL[goal]} · ${EXPERIENCE_LABEL[experience]}`} />
        <InfoRow label="Water goal" value={`${BASE_WATER_L} L · +0.5 gym · +0.5 swim`} />
        <InfoRow label="Step goal" value={`${STEP_GOAL.toLocaleString("en-IN")} steps`} />
        <T variant="muted" style={{ fontSize: 12, marginTop: 6 }}>You can change these later in Me → Goals.</T>
      </View>
      <View style={{ borderWidth: 1, borderColor: c.pool, borderRadius: 12, padding: 12 }}>
        <T variant="muted" style={{ color: c.ink }}>💡 Legs are placed on your swim days, so your shoulders are fresh in the pool.</T>
      </View>
    </View>,
    <View key="notify" style={{ gap: 16 }}>
      <SwitchRow title="Daily reminder" text="Today's workout and swim, even when the app is closed." value={remind} onChange={setRemind} />
      {remind ? (
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {REMINDER_TIMES.filter((m) => m % 30 === 0).map((m) => {
            const sel = m === remindAt;
            return (
              <Pressable key={m} onPress={() => setRemindAt(m)} accessibilityRole="radio" accessibilityState={{ selected: sel }}
                style={{ minHeight: 44, paddingHorizontal: 12, justifyContent: "center", borderRadius: 10, borderWidth: sel ? 1.5 : 1, borderColor: sel ? c.accent : c.line, backgroundColor: c.surface }}>
                <Text style={{ fontFamily: sel ? fonts.bodyBold : fonts.bodyMedium, color: sel ? c.accentText : c.ink }}>{timeLabel(m)}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      <SwitchRow title="Water reminders" text="Gentle nudges to drink, paused during gym and swim. They start when the water tracker arrives." value={water} onChange={setWater} />
      <T variant="muted" style={{ fontSize: 12 }}>Your phone will ask once to allow notifications.</T>
    </View>,
  ];

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 24, paddingHorizontal: Math.max(16, insets.left), gap: 14 }}>
        {/* progress bar */}
        <View style={{ flexDirection: "row", gap: 6 }} accessibilityLabel={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((_, i) => <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= step ? c.accent : c.line }} />)}
        </View>
        <T variant="display" style={{ fontSize: 32, marginTop: 8 }}>{STEPS[step]}</T>
        <T variant="muted" style={{ marginBottom: 6 }}>{SUBTITLES[step]}</T>
        {body[step]}
      </ScrollView>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: Math.max(16, insets.left), paddingTop: 10, paddingBottom: insets.bottom + 12, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.bg }}>
        <Pressable onPress={step === 0 ? skip : () => setStep(step - 1)} accessibilityRole="button" hitSlop={8}
          style={{ minHeight: 48, minWidth: 64, justifyContent: "center", paddingHorizontal: 8 }}>
          <Text style={{ fontFamily: fonts.bodyBold, color: c.muted, fontSize: 15 }}>{step === 0 ? (edit ? "Cancel" : "Skip") : "Back"}</Text>
        </Pressable>
        <Pressable onPress={last ? finish : () => setStep(step + 1)} disabled={saving} accessibilityRole="button"
          style={({ pressed }) => ({ flex: 1, minHeight: 52, borderRadius: 12, backgroundColor: c.accent, alignItems: "center", justifyContent: "center", opacity: pressed || saving ? 0.7 : 1 })}>
          <Text style={{ fontFamily: fonts.bodyBold, color: c.accentInk, fontSize: 16 }}>{last ? (edit ? "Save" : "Start training") : "Next →"}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Err({ text }: { text: string }) {
  const c = useColors();
  return text ? <Text style={{ color: c.warn, fontFamily: fonts.bodyMedium, fontSize: 12 }}>{text}</Text> : null;
}

function SwitchRow({ title, text, value, onChange }: { title: string; text: string; value: boolean; onChange: (v: boolean) => void }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 12, padding: 14 }}>
      <View style={{ flex: 1 }}>
        <T variant="bold">{title}</T>
        <T variant="muted">{text}</T>
      </View>
      <Switch value={value} onValueChange={onChange} accessibilityLabel={title} trackColor={{ true: c.done, false: c.line }} />
    </View>
  );
}
