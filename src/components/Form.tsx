// Form pieces shared by the welcome setup, My week and the Me tab.
import React from "react";
import { Pressable, Text, TextInput, View, type KeyboardTypeOptions } from "react-native";
import type { DayKey } from "../data/types";
import { FULL_DAY } from "../logic";
import { type DayKind, WEEK, nextKind } from "../logic/plan";
import { fonts, useColors } from "../theme";
import { T } from "./ui";

export function Field({ label, value, onChange, unit, keyboard = "default", placeholder, maxLength }: {
  label: string; value: string; onChange: (s: string) => void; unit?: string; keyboard?: KeyboardTypeOptions; placeholder?: string; maxLength?: number;
}) {
  const c = useColors();
  return (
    <View style={{ gap: 6, flex: 1 }}>
      <T variant="label">{label}</T>
      <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, borderRadius: 10, paddingHorizontal: 12, minHeight: 48 }}>
        <TextInput value={value} onChangeText={onChange} keyboardType={keyboard} placeholder={placeholder} placeholderTextColor={c.muted} maxLength={maxLength}
          accessibilityLabel={label} selectionColor={c.accent}
          style={{ flex: 1, color: c.ink, fontFamily: fonts.bodyMedium, fontSize: 16, paddingVertical: 10 }} />
        {unit ? <Text style={{ color: c.muted, fontFamily: fonts.body, fontSize: 14 }}>{unit}</Text> : null}
      </View>
    </View>
  );
}

/** Row of choices, one selected: yellow border on the picked one */
export function Choice<V extends string>({ options, value, onChange, label }: { options: { key: V; label: string }[]; value: V; onChange: (v: V) => void; label?: string }) {
  const c = useColors();
  return (
    <View style={{ gap: 6 }}>
      {label ? <T variant="label">{label}</T> : null}
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {options.map((o) => {
          const sel = o.key === value;
          return (
            <Pressable key={o.key} onPress={() => onChange(o.key)} accessibilityRole="radio" accessibilityState={{ selected: sel }}
              style={({ pressed }) => ({ flexGrow: 1, flexBasis: 90, minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 10, borderRadius: 10,
                borderWidth: sel ? 1.5 : 1, borderColor: sel ? c.accent : c.line, backgroundColor: c.surface, opacity: pressed ? 0.7 : 1 })}>
              <Text style={{ fontFamily: sel ? fonts.bodyBold : fonts.bodyMedium, fontSize: 14, color: sel ? c.accentText : c.ink, textAlign: "center" }}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const KIND_LABEL: Record<DayKind, string> = { gym: "Gym", swim: "Swim", both: "Gym + Swim", rest: "Rest" };

/** Mon–Sun chips; tap cycles Gym → Swim → Gym+Swim → Rest */
export function WeekPicker({ days, onChange }: { days: Record<DayKey, DayKind>; onChange: (d: Record<DayKey, DayKind>) => void }) {
  const c = useColors();
  const look = (k: DayKind) => ({
    border: k === "gym" || k === "both" ? c.accent : k === "swim" ? c.pool : c.line,
    under: k === "swim" || k === "both" ? c.pool : undefined,
    text: k === "rest" ? c.muted : k === "swim" ? c.pool : c.accentText,
  });
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", gap: 5 }}>
        {WEEK.map((d) => {
          const k = days[d], l = look(k);
          return (
            <Pressable key={d} onPress={() => onChange({ ...days, [d]: nextKind(k) })} accessibilityRole="button"
              accessibilityLabel={`${FULL_DAY[d]}: ${KIND_LABEL[k]}`} accessibilityHint="Tap to change"
              style={({ pressed }) => ({ flex: 1, minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1.5, borderColor: l.border,
                borderBottomWidth: l.under ? 4 : 1.5, borderBottomColor: l.under ?? l.border, backgroundColor: c.surface, opacity: pressed ? 0.7 : 1 })}>
              <Text style={{ fontFamily: fonts.displayBold, fontSize: 15, textTransform: "uppercase", color: k === "rest" ? c.muted : c.ink }}>{FULL_DAY[d].slice(0, 3)}</Text>
              <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 9.5, color: l.text }} numberOfLines={1}>{k === "both" ? "Gym+Sw" : KIND_LABEL[k]}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: "row", gap: 14, flexWrap: "wrap" }}>
        {([["Gym", c.accent], ["Swim", c.pool], ["Rest", c.line]] as const).map(([l, col]) => (
          <View key={l} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: col }} />
            <T variant="muted" style={{ fontSize: 12 }}>{l}</T>
          </View>
        ))}
        <T variant="muted" style={{ fontSize: 12 }}>· Tap a day to change it</T>
      </View>
    </View>
  );
}

/** One label · value line inside a summary box */
export function InfoRow({ label, value }: { label: string; value: string }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 4 }}>
      <Text style={{ fontFamily: fonts.body, color: c.muted, fontSize: 14 }}>{label}</Text>
      <Text style={{ fontFamily: fonts.bodyBold, color: c.ink, fontSize: 14, flexShrink: 1, textAlign: "right" }}>{value}</Text>
    </View>
  );
}
