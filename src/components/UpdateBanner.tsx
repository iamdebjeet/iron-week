// Update banners: a quick (over-the-air) update with one-tap install, and a newer APK to download.
import React, { useState } from "react";
import { Text, View } from "react-native";
import { useAppUpdates } from "../updates";
import { fonts, useColors } from "../theme";
import { Btn, T } from "./ui";

export function UpdateBanner({ dismissible = true }: { dismissible?: boolean }) {
  const c = useColors();
  const u = useAppUpdates();
  const [hidden, setHidden] = useState(false);
  if (hidden || (!u.ota && !u.apk)) return null;
  return (
    <View style={{ gap: 8 }}>
      {u.ota ? (
        <View style={{ borderWidth: 1.5, borderColor: c.accent, backgroundColor: c.surface, borderRadius: 12, padding: 12, gap: 8 }} accessibilityLiveRegion="polite">
          <Text style={{ fontFamily: fonts.bodyBold, color: c.ink, fontSize: 14 }}>✨ {u.ota.ready ? "Update ready" : "Update available"}</Text>
          <T variant="muted" style={{ color: c.ink }}>{u.ota.message}</T>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {u.timerBusy ? (
              <T variant="muted">Finish your timer first; the app restarts to update.</T>
            ) : (
              <Btn small kind="primary" title={u.ota.downloading ? "Downloading…" : "Update now"} onPress={() => { if (!u.ota?.downloading) u.install(); }} />
            )}
            {dismissible ? <Btn small title="Later" onPress={() => setHidden(true)} /> : null}
          </View>
        </View>
      ) : null}
      {u.apk ? (
        <View style={{ borderWidth: 1.5, borderColor: c.good, backgroundColor: c.surface, borderRadius: 12, padding: 12, gap: 8 }}>
          <Text style={{ fontFamily: fonts.bodyBold, color: c.ink, fontSize: 14 }}>📦 New version available: {u.apk.version}</Text>
          {u.apk.notes ? <T variant="muted" style={{ color: c.ink }}>{u.apk.notes}</T> : null}
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Btn small kind="primary" title="Download & install" onPress={u.openApk} />
            {dismissible ? <Btn small title="Later" onPress={() => setHidden(true)} /> : null}
          </View>
          <T variant="muted" style={{ fontSize: 12 }}>Opens the APK download. Your data stays: installing over the app keeps everything on the phone.</T>
        </View>
      ) : null}
    </View>
  );
}
