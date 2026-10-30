// Me tab: profile header and a settings list. Rows for later phases show "Soon".
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FULL_DAY } from "../logic";
import { EXPERIENCE_LABEL, GOAL_LABEL, bmi } from "../logic/profile";
import { usePasses } from "../passes";
import { type ThemePref, useStore } from "../store";
import { fonts, useColors } from "../theme";
import { MusicButtons, SettingsSheet } from "../components/Panels";
import { Btn, T } from "../components/ui";

const time12 = (h: number, m: number) => `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
const THEMES: { key: ThemePref; label: string }[] = [{ key: "system", label: "System" }, { key: "light", label: "Light" }, { key: "dark", label: "Dark" }];

function Row({ icon, title, detail, onPress, soon, open, children }: {
  icon: string; title: string; detail?: string; onPress?: () => void; soon?: boolean; open?: boolean; children?: React.ReactNode;
}) {
  const c = useColors();
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: c.line }}>
      <Pressable onPress={soon ? undefined : onPress} disabled={soon} accessibilityRole="button" accessibilityState={{ disabled: soon, expanded: open }}
        accessibilityLabel={soon ? `${title}, coming soon` : detail ? `${title}, ${detail}` : title}
        style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, paddingHorizontal: 14, opacity: soon ? 0.5 : pressed ? 0.7 : 1 })}>
        <Text style={{ fontSize: 18, width: 24, textAlign: "center" }}>{icon}</Text>
        <Text style={{ flex: 1, fontFamily: fonts.bodyBold, fontSize: 15, color: c.ink }}>{title}</Text>
        {soon ? (
          <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: c.muted, borderWidth: 1, borderColor: c.line, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>SOON</Text>
        ) : detail ? <Text style={{ fontFamily: fonts.body, fontSize: 13, color: c.muted, maxWidth: "45%", textAlign: "right" }} numberOfLines={1}>{detail}</Text> : null}
      </Pressable>
      {open && children ? <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>{children}</View> : null}
    </View>
  );
}

export function MeScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { prefs, setPrefs, profile, plan } = useStore();
  const { passes, openManager } = usePasses();
  const [notif, setNotif] = useState(false);
  const [open, setOpen] = useState<"music" | "theme" | "about" | null>(null);
  const flip = (k: typeof open) => setOpen((o) => (o === k ? null : k));
  const b = bmi(profile);
  const stats: [string, string][] = [
    ["Age", profile.age ? String(profile.age) : "–"],
    ["cm", profile.heightCm ? String(profile.heightCm) : "–"],
    ["kg", profile.weightKg ? String(profile.weightKg) : "–"],
    ["BMI", b !== null ? b.toFixed(1) : "–"],
  ];
  const short = (keys: string[]) => keys.map((k) => FULL_DAY[k].slice(0, 2)).join(" ");
  const gym = plan.filter((d) => !d.rest).map((d) => d.key), swim = plan.filter((d) => d.swim).map((d) => d.key);
  const weekInfo = [gym.length ? `Gym ${short(gym)}` : "", swim.length ? `Swim ${short(swim)}` : ""].filter(Boolean).join(" · ") || "All rest";
  const passInfo = [passes.gym ? "Gym ✓" : null, passes.swim ? "Swim ✓" : null].filter(Boolean).join(" · ") || "None yet";

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: Math.max(16, insets.left), gap: 16 }}>
        {/* Profile header */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.accent, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 28, color: c.accentInk }}>{profile.name ? profile.name[0].toUpperCase() : "?"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <T variant="display" style={{ fontSize: 28 }} numberOfLines={1}>{profile.name || "Your profile"}</T>
            <T variant="muted">{GOAL_LABEL[profile.goal]} · {EXPERIENCE_LABEL[profile.experience]}</T>
          </View>
          <Btn title="Edit" onPress={() => router.push("/welcome?edit=1")} />
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {stats.map(([label, value]) => (
            <View key={label} accessible accessibilityLabel={`${label}: ${value}`}
              style={{ flex: 1, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 12, paddingVertical: 10, alignItems: "center" }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 24, color: c.ink }}>{value}</Text>
              <T variant="label">{label}</T>
            </View>
          ))}
        </View>
        {b !== null ? <T variant="muted" style={{ fontSize: 12, marginTop: -8 }}>BMI is a rough guide only; it doesn’t tell muscle from fat.</T> : null}

        <View style={{ backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.line, overflow: "hidden" }}>
          <View style={{ marginTop: -1 }}>
            <Row icon="🎫" title="Entry passes" detail={passInfo} onPress={openManager} />
            <Row icon="📅" title="My week" detail={weekInfo} onPress={() => router.push("/week")} />
            <Row icon="🔔" title="Notifications" detail={prefs.reminders ? `Daily ${time12(prefs.hour, prefs.minute)}` : "Off"} onPress={() => setNotif(true)} />
            <Row icon="🎯" title="Goals" soon />
            <Row icon="🎵" title="Music" detail="Spotify · YouTube Music" open={open === "music"} onPress={() => flip("music")}>
              <MusicButtons />
            </Row>
            <Row icon="❝" title="Saved quotes" soon />
            <Row icon="💾" title="Backup / restore" detail={prefs.lastBackup ? `Last: ${new Date(prefs.lastBackup).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : "Never"} onPress={() => router.push("/backup")} />
            <Row icon="🌗" title="Theme" detail={THEMES.find((x) => x.key === prefs.theme)?.label} open={open === "theme"} onPress={() => flip("theme")}>
              <View style={{ flexDirection: "row", borderWidth: 1, borderColor: c.line, borderRadius: 10, overflow: "hidden" }}>
                {THEMES.map((x) => {
                  const sel = prefs.theme === x.key;
                  return (
                    <Pressable key={x.key} onPress={() => setPrefs({ theme: x.key })} accessibilityRole="button" accessibilityState={{ selected: sel }}
                      style={{ flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", backgroundColor: sel ? c.ink : "transparent" }}>
                      <Text style={{ fontFamily: fonts.displayBold, fontSize: 16, textTransform: "uppercase", color: sel ? c.bg : c.muted }}>{x.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Row>
            <Row icon="ℹ️" title="About Iron Week" detail={`v${Constants.expoConfig?.version ?? "1.0.0"}`} open={open === "about"} onPress={() => flip("about")}>
              <T variant="muted">Your gym and swim planner. Everything is saved only on this phone: no account, no server.</T>
            </Row>
          </View>
        </View>
      </ScrollView>
      <SettingsSheet visible={notif} onClose={() => setNotif(false)} />
    </View>
  );
}
