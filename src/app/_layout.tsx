// Root layout: app-wide providers, fonts, splash screen, theme, and the big timer (shown over every tab).
import React, { useEffect } from "react";
import { Appearance, View, useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
// Import only the weights the app uses, so the app stays small.
import { Barlow_400Regular } from "@expo-google-fonts/barlow/400Regular";
import { Barlow_500Medium } from "@expo-google-fonts/barlow/500Medium";
import { Barlow_600SemiBold } from "@expo-google-fonts/barlow/600SemiBold";
import { BarlowCondensed_700Bold } from "@expo-google-fonts/barlow-condensed/700Bold";
import { BarlowCondensed_800ExtraBold } from "@expo-google-fonts/barlow-condensed/800ExtraBold";
import { ReloadProvider } from "../reload";
import { StoreProvider, useStore } from "../store";
import { TimerProvider } from "../timer";
import { PassesProvider } from "../passes";
import { scheduleReminders, setupChannels } from "../notifications";
import { useColors } from "../theme";
import { BigTimer } from "../components/TimerViews";

SplashScreen.preventAutoHideAsync().catch(() => {});

function Root() {
  const { ready, prefs, plan } = useStore();
  const c = useColors();
  const scheme = useColorScheme();
  const [fontsLoaded] = useFonts({ Barlow_400Regular, Barlow_500Medium, Barlow_600SemiBold, BarlowCondensed_700Bold, BarlowCondensed_800ExtraBold });
  const show = ready && fontsLoaded;
  useEffect(() => { setupChannels().catch(() => {}); }, []);
  // Theme choice in Me overrides the phone's setting; useColorScheme() (and so useColors) follows it.
  useEffect(() => { if (ready) Appearance.setColorScheme(prefs.theme === "system" ? "auto" : prefs.theme); }, [ready, prefs.theme]);
  useEffect(() => { if (show) SplashScreen.hideAsync().catch(() => {}); }, [show]);
  // Daily reminders follow the reminder settings and the user's week; reschedule whenever either changes.
  useEffect(() => {
    if (ready && prefs.onboarded) scheduleReminders(prefs.reminders, prefs.hour, prefs.minute, plan).catch(() => {});
  }, [ready, prefs.onboarded, prefs.reminders, prefs.hour, prefs.minute, plan]);
  if (!show) return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  return (
    <TimerProvider>
      <PassesProvider>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />
        <BigTimer />
      </PassesProvider>
    </TimerProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ReloadProvider>
          <StoreProvider>
            <Root />
          </StoreProvider>
        </ReloadProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
