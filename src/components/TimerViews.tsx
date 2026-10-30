// Session timer chip (+ its long-press sheet) and the full-screen big timer.
// The mini bar shown while the big timer is minimized lives in TabBar.tsx.
import React, { useState } from "react";
import { Modal, Pressable, Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { fmt } from "../logic";
import { useTimer } from "../timer";
import { fonts, useColors } from "../theme";
import { Btn, T } from "./ui";

/** "⏱ 42:18 left": tap to start/pause the 60-min session, long-press for reset and quick rest timers. */
export function SessionChip() {
  const c = useColors();
  const t = useTimer();
  const [sheet, setSheet] = useState(false);
  const s = t.session;
  const started = s.running || s.left < 3600;
  return (
    <>
      <Pressable onPress={s.toggle} onLongPress={() => setSheet(true)} hitSlop={6} accessibilityRole="button"
        accessibilityLabel={`Session timer, ${fmt(s.left)} left, ${s.running ? "running" : "paused"}`} accessibilityHint="Tap to start or pause. Long-press for more."
        style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: s.running ? c.done : c.line,
          backgroundColor: s.running ? c.doneSoft : c.surface, borderRadius: 10, paddingHorizontal: 10, minHeight: 40, opacity: pressed ? 0.7 : 1 })}>
        <Text style={{ fontSize: 14 }}>⏱</Text>
        <Text style={{ fontFamily: fonts.display, fontSize: 20, color: s.running ? c.done : c.ink, fontVariant: ["tabular-nums"] }}>{fmt(s.left)}</Text>
        <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12, color: c.muted }}>{started ? (s.running ? "left" : "paused") : "start"}</Text>
      </Pressable>
      <SessionSheet visible={sheet} onClose={() => setSheet(false)} />
    </>
  );
}

function SessionSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = useColors();
  const t = useTimer();
  const s = t.session;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: c.scrim, justifyContent: "center", padding: 24 }} onPress={onClose}>
        <Pressable style={{ backgroundColor: c.surface, borderRadius: 16, padding: 18, gap: 12 }} onPress={() => {}}>
          <T variant="display" style={{ fontSize: 24 }}>Session (60 min)</T>
          <Text style={{ fontFamily: fonts.display, fontSize: 44, color: s.running ? c.done : c.ink, fontVariant: ["tabular-nums"] }}>{fmt(s.left)}</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Btn kind="primary" title={s.running ? "Pause" : s.left < 3600 ? "Resume" : "Start"} onPress={s.toggle} />
            <Btn title="Reset" onPress={s.reset} />
          </View>
          <T variant="label" style={{ marginTop: 6 }}>Quick rest timer</T>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[60, 90, 120].map((sec) => <Btn key={sec} title={sec === 120 ? "2m" : `${sec}s`} onPress={() => { t.rest(sec, "Rest"); onClose(); }} />)}
          </View>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}><Btn title="Close" onPress={onClose} /></View>
        </Pressable>
      </Pressable>
    </Modal>
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
  // Water reminders pause during the session; instead the big timer says "Sip water" for a minute every 15 min.
  const elapsed = 3600 - t.session.left;
  const sip = t.session.running && elapsed >= 900 && elapsed % 900 < 60;
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
        {sip ? <Text style={{ fontFamily: fonts.bodyBold, fontSize: 16, color: c.ink, borderWidth: 1.5, borderColor: c.good, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 }}>💧 Sip water</Text> : null}
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
