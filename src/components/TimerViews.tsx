// Bottom timer bar and the full-screen big timer.
import React from "react";
import { Modal, Pressable, Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fmt } from "../logic";
import { useTimer } from "../timer";
import { fonts, useColors } from "../theme";
import { Btn, T } from "./ui";

export function TimerDock() {
  const c = useColors();
  const t = useTimer();
  const insets = useSafeAreaInsets();
  const running = t.status === "running";
  const box = { flex: 1, borderWidth: 1, borderColor: running ? c.done : t.status === "done" ? c.warn : c.line, borderRadius: 10, padding: 9, gap: 5 };
  return (
    <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.line,
      paddingTop: 8, paddingBottom: 8 + insets.bottom, paddingHorizontal: Math.max(12, insets.left), flexDirection: "row", gap: 10 }}>
      <View style={[box, { borderColor: t.session.running ? c.done : c.line }]}>
        <T variant="label">Session (60 min)</T>
        <Text style={{ fontFamily: fonts.display, fontSize: 30, color: t.session.running ? c.done : c.ink, fontVariant: ["tabular-nums"] }}>{fmt(t.session.left)}</Text>
        <View style={{ flexDirection: "row", gap: 6 }}>
          <Btn small kind="primary" title={t.session.running ? "Pause" : t.session.left < 3600 ? "Resume" : "Start"} onPress={t.session.toggle} />
          <Btn small title="Reset" onPress={t.session.reset} />
        </View>
      </View>
      <View style={box}>
        <T variant="label" numberOfLines={1}>{t.status === "idle" ? "Timer" : t.label}</T>
        <Text style={{ fontFamily: fonts.display, fontSize: 30, color: running ? c.done : t.status === "done" ? c.warn : c.ink, fontVariant: ["tabular-nums"] }}>
          {t.status === "done" ? "GO!" : fmt(t.left)}
        </Text>
        <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
          {running ? (
            <>
              <Btn small title="Stop" onPress={t.stop} />
              <Btn small title="⤢ Big" onPress={t.showBig} />
            </>
          ) : (
            [60, 90, 120].map((s) => <Btn key={s} small title={s === 120 ? "2m" : `${s}s`} onPress={() => t.rest(s, "Rest")} />)
          )}
        </View>
      </View>
    </View>
  );
}

const R = 54, CIRC = 2 * Math.PI * R;

export function BigTimer() {
  const c = useColors();
  const t = useTimer();
  const { width, height } = useWindowDimensions();
  const size = Math.min(width * 0.78, height * 0.48, 420);
  const done = t.status === "done";
  const last = t.status === "running" && t.left <= 5;
  const color = done ? c.accent : last ? c.warn : c.done;
  const progress = done ? 1 : Math.max(0, Math.min(1, t.left / t.total));
  return (
    <Modal visible={t.bigVisible && t.status !== "idle"} animationType="fade" onRequestClose={t.minimizeBig} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center", padding: 20, gap: 18 }} onPress={() => done && t.minimizeBig()}>
        <Text style={{ fontFamily: fonts.displayBold, fontSize: 26, color: c.ink, textTransform: "uppercase", textAlign: "center" }}>{t.label}</Text>
        <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
          <Svg width={size} height={size} viewBox="0 0 120 120" style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
            <Circle cx={60} cy={60} r={R} stroke={c.line} strokeWidth={8} fill="none" />
            <Circle cx={60} cy={60} r={R} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round"
              strokeDasharray={`${CIRC} ${CIRC}`} strokeDashoffset={CIRC * (1 - progress)} />
          </Svg>
          <Text style={{ fontFamily: fonts.display, fontSize: size * 0.3, color: done ? c.accentText : last ? c.warn : c.ink, fontVariant: ["tabular-nums"] }}>
            {done ? "GO!" : fmt(t.left)}
          </Text>
        </View>
        <T variant="muted" style={{ fontSize: 16, minHeight: 22, textAlign: "center" }}>{done ? "" : t.next}</T>
        {!done ? (
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Btn title="+15s" onPress={() => t.addTime(15)} style={{ paddingHorizontal: 20, paddingVertical: 12 }} />
            {t.multi ? <Btn title="Skip" onPress={t.skip} style={{ paddingHorizontal: 20, paddingVertical: 12 }} /> : null}
            <Btn title="Stop" onPress={t.stop} style={{ paddingHorizontal: 20, paddingVertical: 12 }} />
          </View>
        ) : null}
        <Pressable onPress={t.minimizeBig} hitSlop={10}><Text style={{ color: c.muted, textDecorationLine: "underline", fontFamily: fonts.bodyBold }}>Minimize ▾</Text></Pressable>
      </Pressable>
    </Modal>
  );
}
