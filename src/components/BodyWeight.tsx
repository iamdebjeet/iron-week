// Body weight on Track: latest weight, change this month, a sparkline of recent entries and a log box.
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import { type BodyEntry, useStore } from "../store";
import { fonts, useColors } from "../theme";
import { T } from "./ui";

/** Change since the last entry before this month (or the month's first entry) */
export function monthChange(entries: BodyEntry[], today: string): number | null {
  const month = today.slice(0, 7);
  const inMonth = entries.filter((e) => e.date.startsWith(month));
  if (!inMonth.length) return null;
  const before = [...entries].reverse().find((e) => e.date < `${month}-01`);
  const base = before ?? inMonth[0];
  return Math.round((inMonth[inMonth.length - 1].kg - base.kg) * 10) / 10;
}

function Sparkline({ values }: { values: number[] }) {
  const c = useColors();
  if (values.length < 2) return null;
  const W = 120, H = 36, min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (W - 6) + 3, H - 3 - ((v - min) / span) * (H - 6)]);
  const last = pts[pts.length - 1];
  return (
    <Svg width={W} height={H} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={c.accent} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <Circle cx={last[0]} cy={last[1]} r={4} fill={c.accent} stroke={c.surface} strokeWidth={2} />
    </Svg>
  );
}

export function BodyWeightCard() {
  const c = useColors();
  const { body, profile, logWeight, today } = useStore();
  const latest = body.length ? body[body.length - 1].kg : profile.weightKg;
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const change = monthChange(body, today);
  const log = () => {
    const n = Number(text.replace(",", "."));
    if (!Number.isFinite(n) || n < 25 || n > 300) { setMsg("Enter your weight in kg, e.g. 70.5"); return; }
    logWeight(Math.round(n * 10) / 10);
    setText(""); setMsg("Saved. Your profile weight is updated too.");
  };
  return (
    <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <T variant="label">⚖️ Body weight</T>
        <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12, color: c.muted }}>{body.length} {body.length === 1 ? "entry" : "entries"}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <View>
          <Text style={{ fontFamily: fonts.display, fontSize: 34, color: c.ink }}>{latest ? `${latest}` : "–"}<Text style={{ fontFamily: fonts.body, fontSize: 15, color: c.muted }}> kg</Text></Text>
          <T variant="muted">{change === null ? "Log your weight to see the trend" : `${change > 0 ? "+" : ""}${change} kg this month`}</T>
        </View>
        <Sparkline values={body.slice(-30).map((e) => e.kg)} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: c.line, backgroundColor: c.bg, borderRadius: 9, paddingHorizontal: 10, minHeight: 44, flex: 1 }}>
          <TextInput value={text} onChangeText={setText} keyboardType="decimal-pad" placeholder={latest ? String(latest) : "70.5"} placeholderTextColor={c.muted}
            accessibilityLabel="Today's body weight in kg" maxLength={5} onSubmitEditing={log} returnKeyType="done"
            style={{ flex: 1, color: c.ink, fontFamily: fonts.bodyMedium, fontSize: 16 }} />
          <Text style={{ color: c.muted, fontFamily: fonts.body }}>kg</Text>
        </View>
        <Pressable onPress={log} accessibilityRole="button" accessibilityLabel="Log weight"
          style={({ pressed }) => ({ backgroundColor: c.accent, borderRadius: 9, paddingHorizontal: 16, minHeight: 44, justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
          <Text style={{ fontFamily: fonts.bodyBold, color: c.accentInk }}>+ Log</Text>
        </Pressable>
      </View>
      {msg ? <T variant="muted">{msg}</T> : null}
    </View>
  );
}
