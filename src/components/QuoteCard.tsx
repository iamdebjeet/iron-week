// Today's quote: big yellow quote mark, the quote, a context line, ♡ save and ↻ another.
// In gym mode it shrinks to one slim line (tap to open it again).
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { Quote } from "../data/quotes";
import { fonts, useColors } from "../theme";

export function QuoteCard({ quote, context, saved, onSave, onAnother, slim }: {
  quote: Quote; context: string; saved: boolean; onSave: () => void; onAnother: () => void; slim: boolean;
}) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  if (slim && !open) {
    return (
      <Pressable onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`Quote: ${quote.text}. Tap to show`}
        style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: c.line, borderRadius: 10, paddingHorizontal: 12, minHeight: 40, backgroundColor: c.surface }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 22, color: c.accent, marginTop: 6 }}>❝</Text>
        <Text numberOfLines={1} style={{ flex: 1, fontFamily: fonts.bodyMedium, fontSize: 13, color: c.muted }}>{quote.text}</Text>
      </Pressable>
    );
  }
  const btn = { width: 44, height: 44, alignItems: "center" as const, justifyContent: "center" as const, borderRadius: 10 };
  return (
    <View style={{ flexDirection: "row", gap: 10, borderWidth: 1, borderColor: c.line, borderLeftWidth: 3, borderLeftColor: c.accent, borderRadius: 12, padding: 12, backgroundColor: c.surface }}>
      <Text style={{ fontFamily: fonts.display, fontSize: 40, lineHeight: 44, color: c.accent }} accessibilityElementsHidden importantForAccessibility="no">❝</Text>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontFamily: fonts.bodyBold, fontSize: 15.5, lineHeight: 21, color: c.ink }}>{quote.text}</Text>
        {quote.by ? <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: c.muted }}>— {quote.by}</Text> : null}
        <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12, color: c.accentText }}>{context}</Text>
      </View>
      <View style={{ justifyContent: "space-between" }}>
        <Pressable onPress={onSave} style={btn} accessibilityRole="button" accessibilityLabel={saved ? "Remove from saved quotes" : "Save quote"} accessibilityState={{ selected: saved }}>
          <Text style={{ fontSize: 20, color: saved ? c.tooMuch : c.muted }}>{saved ? "♥" : "♡"}</Text>
        </Pressable>
        <Pressable onPress={onAnother} style={btn} accessibilityRole="button" accessibilityLabel="Show another quote">
          <Text style={{ fontSize: 20, color: c.muted }}>↻</Text>
        </Pressable>
      </View>
    </View>
  );
}
