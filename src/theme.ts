import { useColorScheme } from "react-native";

const light = {
  bg: "#f3f4f2", surface: "#ffffff", ink: "#1b1f22", muted: "#5f676c", line: "#dfe2df",
  accent: "#e0a100", accentInk: "#1b1f22", accentText: "#8a5a00",
  done: "#2f8a57", doneSoft: "#e3f2e9", warn: "#c2410c",
  figure: "#cfd3cf", hit: "#e4572e", help: "#f3b39c", pool: "#1a78b8",
  spotify: "#1DB954", spotifyText: "#118a3d", ytm: "#FF0000", ytmText: "#d40000",
  scrim: "rgba(10,12,14,0.55)",
  // Status colours (water, steps, diet bands). Darker than the dark-mode ones so they read on white;
  // very high / too much are pulled apart (orange vs crimson) so they don't look alike. Always shown with a label too.
  low: "#a87400", good: "#1a78b8", excellent: "#2f8a57", veryHigh: "#d9640a", tooMuch: "#b0124a",
};

const dark: typeof light = {
  bg: "#121518", surface: "#1b1f23", ink: "#eef0ee", muted: "#9aa3a8", line: "#2c3237",
  accent: "#f2b621", accentInk: "#121518", accentText: "#f2b621",
  done: "#4cc282", doneSoft: "#17301f", warn: "#fb8a4c",
  figure: "#6f7a83", hit: "#ff6a3d", help: "#c0705a", pool: "#55b6ee",
  spotify: "#1ED760", spotifyText: "#1ED760", ytm: "#FF4E45", ytmText: "#FF6B63",
  scrim: "rgba(0,0,0,0.6)",
  low: "#f2b621", good: "#55b6ee", excellent: "#4cc282", veryHigh: "#fb8a4c", tooMuch: "#ff5a5a",
};

export type Colors = typeof light;

export const fonts = {
  display: "BarlowCondensed_800ExtraBold",
  displayBold: "BarlowCondensed_700Bold",
  body: "Barlow_400Regular",
  bodyMedium: "Barlow_500Medium",
  bodyBold: "Barlow_600SemiBold",
};

export function useColors(): Colors {
  return useColorScheme() === "dark" ? dark : light;
}
