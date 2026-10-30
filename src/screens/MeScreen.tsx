// Me tab: profile header and a settings list. Rows for later phases show "Soon".
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePasses } from "../passes";
import { type ThemePref, useStore } from "../store";
import { fonts, useColors } from "../theme";
import { MusicButtons, SettingsSheet } from "../components/Panels";
import { T } from "../components/ui";

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
  const { prefs, setPrefs } = useStore();
  const { passes, openManager } = usePasses();
  const [notif, setNotif] = useState(false);
  const [open, setOpen] = useState<"music" | "theme" | "about" | null>(null);
  const flip = (k: typeof open) => setOpen((o) => (o === k ? null : k));
  const passInfo = [passes.gym ? "Gym ✓" : null, passes.swim ? "Swim ✓" : null].filter(Boolean).join(" · ") || "None yet";

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: Math.max(16, insets.left), gap: 16 }}>
        {/* Profile header (filled in by the welcome setup in the next phase) */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.accent, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 28, color: c.accentInk }}>?</Text>
          </View>
          <View style={{ flex: 1 }}>
            <T variant="display" style={{ fontSize: 28 }}>Your profile</T>
            <T variant="muted">Name, goal and body stats come with the welcome setup.</T>
          </View>
        </View>

        <View style={{ backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.line, overflow: "hidden" }}>
          <View style={{ marginTop: -1 }}>
            <Row icon="🎫" title="Entry passes" detail={passInfo} onPress={openManager} />
            <Row icon="📅" title="My week" soon />
            <Row icon="🔔" title="Notifications" detail={prefs.reminders ? `Daily ${time12(prefs.hour, prefs.minute)}` : "Off"} onPress={() => setNotif(true)} />
            <Row icon="🎯" title="Goals" soon />
            <Row icon="🎵" title="Music" detail="Spotify · YouTube Music" open={open === "music"} onPress={() => flip("music")}>
              <MusicButtons />
            </Row>
            <Row icon="❝" title="Saved quotes" soon />
            <Row icon="💾" title="Backup / restore" soon />
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
