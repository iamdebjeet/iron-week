// A short message at the top of the screen (e.g. "🏆 New PR"), gone after a few seconds.
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts, useColors } from "./theme";

const Ctx = createContext<(text: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState<string | null>(null);
  const hide = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (hide.current) clearTimeout(hide.current); }, []);
  const show = useCallback((t: string) => {
    setText(t);
    if (hide.current) clearTimeout(hide.current);
    hide.current = setTimeout(() => setText(null), 3500);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      {text ? (
        <View pointerEvents="none" accessibilityLiveRegion="polite"
          style={{ position: "absolute", top: insets.top + 10, left: 16, right: 16, alignItems: "center" }}>
          <View style={{ backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.accent, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 15, color: c.ink, textAlign: "center" }}>{text}</Text>
          </View>
        </View>
      ) : null}
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
