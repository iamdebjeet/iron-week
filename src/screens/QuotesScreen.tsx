// Me → Saved quotes: the quotes you hearted, newest first.
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QUOTE_BY_ID } from "../data/quotes";
import { useStore } from "../store";
import { fonts, useColors } from "../theme";
import { Btn, T } from "../components/ui";

export function QuotesScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { favQuotes, toggleFavQuote } = useStore();
  const list = favQuotes.map((id) => QUOTE_BY_ID[id]).filter(Boolean);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32, paddingHorizontal: Math.max(16, insets.left), gap: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <T variant="display" style={{ fontSize: 30 }}>Saved quotes</T>
        <Btn title="Done" onPress={() => router.back()} />
      </View>
      {list.length ? list.map((q) => (
        <View key={q.id} style={{ flexDirection: "row", gap: 10, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderLeftWidth: 3, borderLeftColor: c.accent, borderRadius: 12, padding: 12 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 15, lineHeight: 21, color: c.ink }}>{q.text}</Text>
            {q.by ? <T variant="muted">— {q.by}</T> : null}
          </View>
          <Pressable onPress={() => toggleFavQuote(q.id)} accessibilityRole="button" accessibilityLabel="Remove from saved quotes"
            style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 20, color: c.tooMuch }}>♥</Text>
          </Pressable>
        </View>
      )) : (
        <View style={{ borderWidth: 1, borderStyle: "dashed", borderColor: c.line, borderRadius: 14, padding: 22, alignItems: "center", gap: 6 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 40, color: c.accent }}>❝</Text>
          <T variant="title">No saved quotes yet</T>
          <T variant="muted" style={{ textAlign: "center" }}>Tap ♡ on the quote on Today to keep one here.</T>
        </View>
      )}
    </ScrollView>
  );
}
