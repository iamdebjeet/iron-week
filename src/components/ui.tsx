// Small shared building blocks: text, buttons, option picker, collapsible card, progress dots.
import React, { useState } from "react";
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextProps, View, ViewStyle } from "react-native";
import { fonts, useColors } from "../theme";
import { BodyDiagram } from "./BodyDiagram";

export function T({ style, variant = "body", ...rest }: TextProps & { variant?: "body" | "muted" | "display" | "title" | "label" | "bold" }) {
  const c = useColors();
  const v = {
    body: { color: c.ink, fontFamily: fonts.body, fontSize: 15 },
    muted: { color: c.muted, fontFamily: fonts.body, fontSize: 13 },
    bold: { color: c.ink, fontFamily: fonts.bodyBold, fontSize: 15 },
    display: { color: c.ink, fontFamily: fonts.display, fontSize: 30, textTransform: "uppercase" as const },
    title: { color: c.ink, fontFamily: fonts.displayBold, fontSize: 21 },
    label: { color: c.muted, fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" as const },
  }[variant];
  return <Text style={[v, style]} {...rest} />;
}

export function Btn({ title, onPress, kind = "plain", style, small, color }: {
  title: string; onPress: () => void; kind?: "plain" | "primary" | "danger"; style?: ViewStyle; small?: boolean; color?: string;
}) {
  const c = useColors();
  const bg = kind === "primary" ? color ?? c.accent : kind === "danger" ? c.warn : c.bg;
  const fg = kind === "primary" ? (color ? "#fff" : c.accentInk) : kind === "danger" ? "#fff" : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        { backgroundColor: bg, borderColor: kind === "plain" ? c.line : bg, borderWidth: 1, borderRadius: 9,
          paddingVertical: small ? 6 : 9, paddingHorizontal: small ? 10 : 13, opacity: pressed ? 0.7 : 1 },
        style,
      ]}
    >
      <Text style={{ color: fg, fontFamily: fonts.bodyBold, fontSize: small ? 13 : 14 }}>{title}</Text>
    </Pressable>
  );
}

export const openLink = (url: string) => Linking.openURL(url).catch(() => {});
export const youtube = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + " proper form")}`;
export const images = (q: string) => `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q + " exercise form")}`;

/** A compact dropdown: shows the value, opens a list to pick from */
export function OptionPicker<V extends string | number>({ label, value, options, onChange, format = String, placeholder }: {
  label?: string; value: V | null; options: V[]; onChange: (v: V) => void; format?: (v: V) => string; placeholder?: string;
}) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ? `${label}: ${value === null ? placeholder : format(value)}` : undefined}
        onPress={() => setOpen(true)}
        style={{ flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: c.line, backgroundColor: c.bg, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 9 }}
      >
        <Text style={{ color: c.ink, fontFamily: fonts.bodyBold, fontSize: 14 }}>{value === null ? placeholder : format(value)}</Text>
        <Text style={{ color: c.muted, fontSize: 10 }}>▼</Text>
      </Pressable>
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim, justifyContent: "center", padding: 32 }]} onPress={() => setOpen(false)}>
          <View style={{ backgroundColor: c.surface, borderRadius: 14, maxHeight: "70%", paddingVertical: 8 }}>
            {label ? <T variant="label" style={{ paddingHorizontal: 18, paddingVertical: 10 }}>{label}</T> : null}
            <ScrollView>
              {options.map((o) => (
                <Pressable key={String(o)} onPress={() => { onChange(o); setOpen(false); }}
                  style={({ pressed }) => ({ paddingVertical: 13, paddingHorizontal: 18, backgroundColor: o === value ? c.doneSoft : pressed ? c.bg : "transparent" })}>
                  <Text style={{ color: c.ink, fontFamily: o === value ? fonts.bodyBold : fonts.body, fontSize: 16 }}>{o === value ? "✓  " : ""}{format(o)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export function Dots({ done, total }: { done: number; total: number }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: "row", gap: 3 }} accessibilityLabel={`${done} of ${total} done`}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={{ width: 7, height: 7, borderRadius: 4, borderWidth: 1.5, borderColor: i < done ? c.done : c.muted, backgroundColor: i < done ? c.done : "transparent" }} />
      ))}
    </View>
  );
}

/** Card with a tappable header; the body shows only when open */
export function CollapsibleCard({ title, titleColor, meta, badge, done, total, open, onToggle, complete, borderColor, children }: {
  title: React.ReactNode; titleColor?: string; meta?: React.ReactNode; badge: string; done: number; total: number;
  open: boolean; onToggle: () => void; complete?: boolean; borderColor?: string; children: React.ReactNode;
}) {
  const c = useColors();
  return (
    <View style={{ backgroundColor: complete ? c.doneSoft : c.surface, borderColor: complete ? c.done : borderColor ?? c.line, borderWidth: 1, borderRadius: 12, padding: 14, paddingVertical: open ? 14 : 11 }}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={onToggle} style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <T variant="title" style={titleColor ? { color: titleColor } : undefined}>{title}</T>
          {meta && !(complete && !open) ? <T variant="muted" style={{ marginTop: 2 }}>{meta}</T> : null}
        </View>
        <View style={{ alignItems: "flex-end", gap: 6 }}>
          <View style={{ borderWidth: 1, borderColor: c.line, backgroundColor: c.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ color: c.ink, fontFamily: fonts.displayBold, fontSize: 15 }}>{badge}</Text>
          </View>
          <Dots done={done} total={total} />
        </View>
        <Text style={{ color: c.muted, fontSize: 14, width: 16, textAlign: "center", transform: [{ rotate: open ? "180deg" : "0deg" }] }}>▼</Text>
      </Pressable>
      {open ? <View style={{ marginTop: 4 }}>{children}</View> : null}
    </View>
  );
}

/** Body diagram with a Main / Helps legend */
export function MuscleBox({ main, helps, stretch }: { main: string[]; helps: string[]; stretch?: boolean }) {
  const c = useColors();
  if (!main.length) return null;
  const Row = ({ color, label, list }: { color: string; label: string; list: string[] }) => (
    <View style={{ flexDirection: "row", gap: 7, alignItems: "flex-start" }}>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color, marginTop: 4 }} />
      <Text style={{ flex: 1, color: c.ink, fontFamily: fonts.body, fontSize: 14 }}><Text style={{ fontFamily: fonts.bodyBold }}>{label}: </Text>{list.join(", ")}</Text>
    </View>
  );
  return (
    <View style={{ flexDirection: "row", gap: 14, alignItems: "center", marginTop: 12, padding: 10, borderRadius: 10, backgroundColor: c.bg }}>
      <BodyDiagram main={main} helps={helps} />
      <View style={{ flex: 1, gap: 6 }}>
        <Row color={c.hit} label={stretch ? "Stretches" : "Main"} list={main} />
        {!stretch && helps.length ? <Row color={c.help} label="Helps" list={helps} /> : null}
      </View>
    </View>
  );
}

/** "How to do it" list that opens on tap */
export function HowTo({ title = "How to do it", items }: { title?: string; items: string[] }) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginTop: 10 }}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)}>
        <T variant="bold">{open ? "▾" : "▸"} {title}</T>
      </Pressable>
      {open ? items.map((x, i) => (
        <Text key={i} style={{ color: c.ink, fontFamily: fonts.body, fontSize: 14, marginTop: 6, marginLeft: 6 }}>{i + 1}. {x}</Text>
      )) : null}
    </View>
  );
}

export function Check({ on, label, onPress, children }: { on: boolean; label: string; onPress: () => void; children?: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: on ? c.done : c.line, backgroundColor: on ? c.done : "transparent", borderRadius: 8, paddingVertical: 5, paddingLeft: 10, paddingRight: children ? 6 : 10 }}>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={label} onPress={onPress} hitSlop={6}
        style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
        <View style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: on ? "#fff" : c.muted, alignItems: "center", justifyContent: "center" }}>
          {on ? <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>✓</Text> : null}
        </View>
        <Text style={{ color: on ? "#fff" : c.ink, fontFamily: fonts.bodyBold, fontSize: 14 }}>{label}</Text>
      </Pressable>
      {children}
    </View>
  );
}
