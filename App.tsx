import React, { useEffect } from "react";
import { View, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
// Import only the weights the app uses, so the app stays small.
import { Barlow_400Regular } from "@expo-google-fonts/barlow/400Regular";
import { Barlow_500Medium } from "@expo-google-fonts/barlow/500Medium";
import { Barlow_600SemiBold } from "@expo-google-fonts/barlow/600SemiBold";
import { BarlowCondensed_700Bold } from "@expo-google-fonts/barlow-condensed/700Bold";
import { BarlowCondensed_800ExtraBold } from "@expo-google-fonts/barlow-condensed/800ExtraBold";
import { StoreProvider, useStore } from "./src/store";
import { TimerProvider } from "./src/timer";
import { HomeScreen } from "./src/HomeScreen";
import { PassesProvider } from "./src/passes";
import { setupChannels } from "./src/notifications";
import { useColors } from "./src/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

function Root() {
  const { ready } = useStore();
  const c = useColors();
  const [fontsLoaded] = useFonts({ Barlow_400Regular, Barlow_500Medium, Barlow_600SemiBold, BarlowCondensed_700Bold, BarlowCondensed_800ExtraBold });
  const show = ready && fontsLoaded;
  useEffect(() => { setupChannels().catch(() => {}); }, []);
  useEffect(() => { if (show) SplashScreen.hideAsync().catch(() => {}); }, [show]);
  if (!show) return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  return (
    <TimerProvider>
      <PassesProvider>
        <HomeScreen />
      </PassesProvider>
    </TimerProvider>
  );
}

export default function App() {
  const scheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
