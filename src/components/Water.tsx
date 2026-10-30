// Water tracker pieces: status badge, banded bar, add row, the full strip (Track), the chip (Today),
// the progress ring and the 7-day chart (details). Status is always written out, never colour alone.
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Rect, Text as SvgText } from "react-native-svg";
import { router } from "expo-router";
import { type WaterStatus, AMOUNTS, AMOUNT_NOTE, STATUS_LABEL, STATUS_MESSAGE, bandEdges, litres, statusOf } from "../logic/water";
import { timeLabel } from "../logic/plan";
import { minutesOf } from "../logic/time";
import { useStore } from "../store";
import { useWater } from "../water";
import { type Colors, fonts, useColors } from "../theme";
import { OptionPicker, T } from "./ui";

export const statusColor = (c: Colors, s: WaterStatus) => c[s];
const ICON: Record<WaterStatus, string> = { low: "●", good: "●", excellent: "✓", veryHigh: "▲", tooMuch: "✕" };

export function StatusBadge({ status }: { status: WaterStatus }) {
  const c = useColors();
  const col = statusColor(c, status);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: col, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 2 }}>
      <Text style={{ color: col, fontSize: 10 }}>{ICON[status]}</Text>
      <Text style={{ color: c.ink, fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

/** Bar in the status colour, with ticks at the band edges (scale ends 0.5 L past the last edge) */
export function WaterBar({ ml, goalMl, ticks = true }: { ml: number; goalMl: number; ticks?: boolean }) {
  const c = useColors();
  const edges = bandEdges(goalMl), max = edges[3] + 500;
  const pct = (x: number) => `${Math.min(100, (Math.max(0, x) / max) * 100)}%` as const;
  return (
    <View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: c.line, overflow: "hidden" }}>
        <View style={{ width: pct(ml), height: "100%", borderRadius: 4, backgroundColor: statusColor(c, statusOf(ml, goalMl)) }} />
        {edges.map((e) => <View key={e} style={{ position: "absolute", left: pct(e), top: 0, bottom: 0, width: 2, backgroundColor: c.surface }} />)}
      </View>
      {ticks ? (
        <View style={{ height: 14 }}>
          {edges.map((e) => (
            <Text key={e} style={{ position: "absolute", left: pct(e), transform: [{ translateX: -8 }], fontFamily: fonts.bodyMedium, fontSize: 10, color: c.muted }}>{litres(e)}</Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** Amount dropdown (remembers the last pick), + Add, ↶ Undo and the next reminder time */
export function AddRow({ showNext = true }: { showNext?: boolean }) {
  const c = useColors();
  const { prefs, setWater, addWater, undoWater, water } = useStore();
  const { next, now } = useWater();
  const amount = prefs.water.lastAmount;
  const nextText = next ? (next.getDate() === now.getDate() ? timeLabel(minutesOf(next)) : "tomorrow") : null;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <OptionPicker label="How much did you drink?" value={amount} options={AMOUNTS} onChange={(ml) => setWater({ lastAmount: ml })}
        format={(ml) => `${ml} ml${AMOUNT_NOTE[ml] ? ` · ${AMOUNT_NOTE[ml]}` : ""}`} />
      <Pressable onPress={() => addWater(amount)} accessibilityRole="button" accessibilityLabel={`Add ${amount} ml`}
        style={({ pressed }) => ({ backgroundColor: c.accent, borderRadius: 9, paddingHorizontal: 14, minHeight: 40, justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
        <Text style={{ fontFamily: fonts.bodyBold, color: c.accentInk, fontSize: 14 }}>+ Add</Text>
      </Pressable>
      <Pressable onPress={undoWater} disabled={!water.length} accessibilityRole="button" accessibilityLabel="Undo last drink"
        style={({ pressed }) => ({ borderWidth: 1, borderColor: c.line, borderRadius: 9, paddingHorizontal: 12, minHeight: 40, justifyContent: "center", opacity: !water.length ? 0.4 : pressed ? 0.7 : 1 })}>
        <Text style={{ fontFamily: fonts.bodyBold, color: c.ink, fontSize: 14 }}>↶ Undo</Text>
      </Pressable>
      {showNext && nextText ? <T variant="muted" style={{ marginLeft: "auto" }}>⏰ {nextText}</T> : null}
    </View>
  );
}

function Warning({ text }: { text: string }) {
  const c = useColors();
  return (
    <View style={{ borderWidth: 1.5, borderStyle: "dashed", borderColor: c.tooMuch, borderRadius: 9, padding: 9 }}>
      <Text style={{ fontFamily: fonts.bodyBold, color: c.ink, fontSize: 13 }}><Text style={{ color: c.tooMuch }}>⚠ </Text>{text}</Text>
    </View>
  );
}

/** Full water strip (Track tab); tap the top to open the details */
export function WaterCard() {
  const c = useColors();
  const { ml, goalMl, status, warning } = useWater();
  return (
    <View style={{ backgroundColor: c.surface, borderWidth: 1.5, borderColor: statusColor(c, status), borderRadius: 14, padding: 14, gap: 10 }}>
      <Pressable onPress={() => router.push("/water")} accessibilityRole="button" accessibilityLabel={`Water today ${litres(ml)} of ${litres(goalMl)} litres, ${STATUS_LABEL[status]}. Open details`} style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <T variant="label">💧 Water today</T>
          <StatusBadge status={status} />
        </View>
        <Text style={{ fontFamily: fonts.display, fontSize: 34, color: c.ink }}>{litres(ml)} L <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 15, color: c.muted }}>/ {litres(goalMl)} L</Text></Text>
        <WaterBar ml={ml} goalMl={goalMl} />
        <Text style={{ fontFamily: fonts.bodyBold, fontSize: 14, color: c.ink }}>{STATUS_MESSAGE[status]}</Text>
      </Pressable>
      {warning ? <Warning text={warning} /> : null}
      <AddRow />
    </View>
  );
}

/** Compact chip for Today; `slim` (gym mode) is a single pill */
export function WaterChip({ slim }: { slim?: boolean }) {
  const c = useColors();
  const { prefs, addWater } = useStore();
  const { ml, goalMl, status, warning } = useWater();
  const col = statusColor(c, status);
  if (slim) {
    return (
      <Pressable onPress={() => router.push("/water")} accessibilityRole="button" accessibilityLabel={`Water ${litres(ml)} of ${litres(goalMl)} litres, ${STATUS_LABEL[status]}`}
        style={{ flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: col, borderRadius: 10, paddingHorizontal: 10, minHeight: 40, backgroundColor: c.surface }}>
        <Text style={{ fontSize: 13 }}>💧</Text>
        <Text style={{ fontFamily: fonts.display, fontSize: 17, color: c.ink }}>{litres(ml)}<Text style={{ fontFamily: fonts.body, fontSize: 12, color: c.muted }}> / {litres(goalMl)} L</Text></Text>
      </Pressable>
    );
  }
  return (
    <View style={{ backgroundColor: c.surface, borderWidth: 1.5, borderColor: col, borderRadius: 12, padding: 10, gap: 6 }}>
      <Pressable onPress={() => router.push("/water")} accessibilityRole="button" accessibilityLabel={`Water ${litres(ml)} of ${litres(goalMl)} litres, ${STATUS_LABEL[status]}. Open details`} style={{ gap: 6 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <T variant="label">💧 Water</T>
          <StatusBadge status={status} />
        </View>
        <Text style={{ fontFamily: fonts.display, fontSize: 24, color: c.ink }}>{litres(ml)} L <Text style={{ fontFamily: fonts.body, fontSize: 13, color: c.muted }}>/ {litres(goalMl)} L</Text></Text>
        <WaterBar ml={ml} goalMl={goalMl} ticks={false} />
        <Text numberOfLines={2} style={{ fontFamily: fonts.bodyMedium, fontSize: 12, color: warning ? c.ink : c.muted }}>{warning ? `⚠ ${warning}` : STATUS_MESSAGE[status]}</Text>
      </Pressable>
      <Pressable onPress={() => addWater(prefs.water.lastAmount)} accessibilityRole="button" accessibilityLabel={`Add ${prefs.water.lastAmount} ml`}
        style={({ pressed }) => ({ alignSelf: "flex-start", backgroundColor: c.accent, borderRadius: 8, paddingHorizontal: 10, minHeight: 36, justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
        <Text style={{ fontFamily: fonts.bodyBold, color: c.accentInk, fontSize: 13 }}>+ {prefs.water.lastAmount} ml</Text>
      </Pressable>
    </View>
  );
}

const R = 52, CIRC = 2 * Math.PI * R;

export function WaterRing({ ml, goalMl, size = 200 }: { ml: number; goalMl: number; size?: number }) {
  const c = useColors();
  const status = statusOf(ml, goalMl);
  const p = Math.min(1, ml / goalMl);
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }} accessible accessibilityLabel={`${litres(ml)} of ${litres(goalMl)} litres, ${STATUS_LABEL[status]}`}>
      <Svg width={size} height={size} viewBox="0 0 120 120" style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={60} cy={60} r={R} stroke={c.line} strokeWidth={9} fill="none" />
        <Circle cx={60} cy={60} r={R} stroke={statusColor(c, status)} strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray={`${CIRC} ${CIRC}`} strokeDashoffset={CIRC * (1 - p)} />
      </Svg>
      <Text style={{ fontFamily: fonts.display, fontSize: size * 0.2, color: c.ink }}>{litres(ml)} L</Text>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: c.muted }}>goal {litres(goalMl)} L</Text>
      <View style={{ marginTop: 6 }}><StatusBadge status={status} /></View>
    </View>
  );
}

export interface ChartDay { date: string; label: string; ml: number; goalMl: number; today: boolean }

/** 7 bars coloured by that day's status. Tap a bar to read it out; the band list above is the legend. */
export function WaterWeekChart({ days }: { days: ChartDay[] }) {
  const c = useColors();
  const [picked, setPicked] = useState(days.length - 1);
  const W = 300, H = 120, top = 16, base = H - 18;
  const max = Math.max(...days.map((d) => Math.max(d.ml, d.goalMl)), 1);
  const slot = W / days.length, bw = Math.min(26, slot - 10);
  const sel = days[picked];
  const selStatus = statusOf(sel.ml, sel.goalMl);
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontFamily: fonts.bodyBold, fontSize: 13, color: c.ink }}>
        {sel.today ? "Today" : sel.label} · {litres(sel.ml)} L of {litres(sel.goalMl)} L · {sel.ml ? STATUS_LABEL[selStatus] : "nothing logged"}
      </Text>
      <View>
        <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
          <Rect x={0} y={base} width={W} height={1} fill={c.line} />
          {days.map((d, i) => {
            const h = d.ml ? Math.max(4, ((base - top) * d.ml) / max) : 0;
            const x = i * slot + (slot - bw) / 2;
            const s = statusOf(d.ml, d.goalMl);
            return (
              <React.Fragment key={d.date}>
                {h ? <Rect x={x} y={base - h} width={bw} height={h} rx={4} fill={statusColor(c, s)} opacity={i === picked ? 1 : 0.85} /> : null}
                {i === picked ? <Rect x={x - 2} y={top - 2} width={bw + 4} height={base - top + 4} rx={6} fill="none" stroke={c.ink} strokeWidth={1.5} /> : null}
                {s === "tooMuch" && d.ml ? <SvgText x={x + bw / 2} y={base - h - 4} fill={c.ink} fontSize={11} fontWeight="700" textAnchor="middle">!</SvgText> : null}
                <SvgText x={x + bw / 2} y={H - 4} fill={d.today ? c.ink : c.muted} fontSize={10} fontWeight={d.today ? "700" : "400"} textAnchor="middle">{d.today ? "Today" : d.label}</SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
        {/* Tap targets larger than the bars */}
        <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, flexDirection: "row" }}>
          {days.map((d, i) => (
            <Pressable key={d.date} style={{ flex: 1 }} onPress={() => setPicked(i)} accessibilityRole="button"
              accessibilityLabel={`${d.today ? "Today" : d.label}: ${litres(d.ml)} litres, ${d.ml ? STATUS_LABEL[statusOf(d.ml, d.goalMl)] : "nothing logged"}`} />
          ))}
        </View>
      </View>
    </View>
  );
}
