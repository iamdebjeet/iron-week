// Add food to a meal: quick type ("2 roti, dal, paneer bhurji"), search, saved meals, recents,
// barcode scan and custom foods. Works offline except the barcode lookup.
import React, { useState } from "react";
import { KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UNIT_LABEL, type Food, type Unit } from "../data/foods";
import { type Meal, MEALS, MEAL_LABEL, gramsOf, parseQuick, resolveItem, scale, sum } from "../logic/diet";
import { itemNutrients, useDraft, useFoods } from "../diet";
import { useStore } from "../store";
import { fonts, useColors } from "../theme";
import { Btn, OptionPicker, T } from "../components/ui";

const WHOLE: Unit[] = ["piece", "slice", "scoop", "tsp", "tbsp", "handful", "serving"];
const step = (u: Unit) => (WHOLE.includes(u) ? 1 : 0.5);
const fmtQty = (q: number) => (Number.isInteger(q) ? String(q) : q.toFixed(1).replace(/\.0$/, ""));
const mealNow = (h: number): Meal => (h < 11 ? "breakfast" : h < 16 ? "lunch" : h < 19 ? "snack" : "dinner");

export function AddFoodScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ meal?: string }>();
  const [hour] = useState(() => new Date().getHours());
  const meal: Meal = MEALS.includes(params.meal as Meal) ? (params.meal as Meal) : mealNow(hour);
  const { addDiet, foodLib, saveMeal, deleteSavedMeal } = useStore();
  const { all, byId } = useFoods();
  const draft = useDraft();
  const [text, setText] = useState("");
  const [pick, setPick] = useState<Record<number, string>>({});
  const [panel, setPanel] = useState<"saved" | "recent" | null>(null);
  const [saveName, setSaveName] = useState<string | null>(null);

  const parsed = parseQuick(text, all);
  const chosen = (i: number): Food | undefined => (pick[i] ? byId[pick[i]] : parsed[i]?.matches[0]);
  const commitText = () => {
    parsed.forEach((p, i) => { const f = chosen(i); if (f) { const r = resolveItem(p, f); draft.add(f, r.qty, r.unit); } });
    setText(""); setPick({});
  };
  const total = sum(draft.items.map(itemNutrients));
  const leave = () => { draft.clear(); router.back(); };
  const add = () => {
    addDiet(draft.items.map((x) => {
      const grams = gramsOf(x.food, x.unit, x.qty);
      return { meal, foodId: x.food.id, name: x.food.name, qty: x.qty, unit: x.unit, grams, n: scale(x.food.per100, grams) };
    }));
    leave();
  };
  const chip = (label: string, on: boolean, onPress: () => void) => (
    <Pressable key={label} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }}
      style={{ borderWidth: 1, borderColor: on ? c.accent : c.line, backgroundColor: c.surface, borderRadius: 9, paddingHorizontal: 11, minHeight: 40, justifyContent: "center" }}>
      <Text style={{ fontFamily: fonts.bodyBold, color: c.ink, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 24, paddingHorizontal: Math.max(16, insets.left), gap: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <T variant="display" style={{ fontSize: 28 }}>Add to {MEAL_LABEL[meal]}</T>
          <Btn title="Cancel" onPress={leave} />
        </View>

        {/* Quick type */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderColor: c.accent, backgroundColor: c.surface, borderRadius: 12, paddingHorizontal: 12, minHeight: 50 }}>
          <TextInput value={text} onChangeText={(s) => { setText(s); setPick({}); }} onSubmitEditing={commitText} returnKeyType="done" autoCorrect={false}
            placeholder="2 roti, dal, paneer bhurji" placeholderTextColor={c.muted} accessibilityLabel="Type what you ate"
            style={{ flex: 1, color: c.ink, fontFamily: fonts.bodyMedium, fontSize: 16, paddingVertical: 10 }} />
          {text.trim() ? <Btn small kind="primary" title="Add ↵" onPress={commitText} /> : <Text style={{ fontFamily: fonts.body, color: c.muted, fontSize: 12 }}>⌨ quick type</Text>}
        </View>
        <T variant="muted" style={{ fontSize: 12, marginTop: -6 }}>Matched from the food list on your phone; works offline. Separate foods with commas.</T>

        {parsed.map((p, i) => {
          const f = chosen(i);
          if (!f) return <T key={i} variant="muted">“{p.text}”: no match. Try another name, or add it as a custom food.</T>;
          const r = resolveItem(p, f);
          const nut = scale(f.per100, gramsOf(f, r.unit, r.qty));
          return (
            <View key={i} style={{ gap: 6 }}>
              <View style={{ borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, borderRadius: 10, padding: 10 }}>
                <T variant="bold">{f.name}</T>
                <T variant="muted">{fmtQty(r.qty)} {UNIT_LABEL[r.unit]} · {Math.round(nut.kcal)} kcal · {Math.round(nut.protein)} g protein</T>
              </View>
              {p.matches.length > 1 ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  <T variant="label" style={{ alignSelf: "center" }}>“{p.text}” · pick one</T>
                  {p.matches.map((m) => chip(m.name, m.id === f.id, () => setPick((x) => ({ ...x, [i]: m.id }))))}
                </View>
              ) : null}
            </View>
          );
        })}

        {/* This meal */}
        {draft.items.map((x) => {
          const nut = itemNutrients(x);
          const units = [...(Object.keys(x.food.units) as Unit[]), ...(x.food.units.g100 ? [] : (["g100"] as Unit[]))];
          return (
            <View key={x.key} style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderColor: c.done, backgroundColor: c.surface, borderRadius: 12, padding: 10 }}>
              <View style={{ flex: 1 }}>
                <T variant="bold" numberOfLines={1}>{x.food.name}</T>
                <T variant="muted">{Math.round(nut.kcal)} kcal · {Math.round(nut.protein)} g protein</T>
              </View>
              <Pressable onPress={() => draft.update(x.key, { qty: Math.max(step(x.unit), x.qty - step(x.unit)) })} accessibilityRole="button" accessibilityLabel="Less"
                style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: c.line, borderRadius: 8 }}>
                <Text style={{ color: c.ink, fontSize: 18 }}>−</Text>
              </Pressable>
              <Text style={{ minWidth: 26, textAlign: "center", fontFamily: fonts.bodyBold, color: c.ink }}>{fmtQty(x.qty)}</Text>
              <Pressable onPress={() => draft.update(x.key, { qty: x.qty + step(x.unit) })} accessibilityRole="button" accessibilityLabel="More"
                style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: c.line, borderRadius: 8 }}>
                <Text style={{ color: c.ink, fontSize: 18 }}>+</Text>
              </Pressable>
              <OptionPicker<Unit> label="Portion" value={x.unit} options={units} format={(u) => UNIT_LABEL[u]} onChange={(u) => draft.update(x.key, { unit: u })} />
              <Pressable onPress={() => draft.remove(x.key)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Remove ${x.food.name}`}>
                <Text style={{ color: c.muted, fontSize: 16 }}>✕</Text>
              </Pressable>
            </View>
          );
        })}

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {chip("⭐ Saved meals", panel === "saved", () => setPanel(panel === "saved" ? null : "saved"))}
          {chip("🕘 Recent", panel === "recent", () => setPanel(panel === "recent" ? null : "recent"))}
          {chip("▦ Scan barcode", false, () => router.push("/scan"))}
          {chip("＋ Custom food", false, () => router.push("/custom-food"))}
        </View>

        {panel === "recent" ? (
          <View style={{ gap: 6 }}>
            {foodLib.recents.map((id) => byId[id]).filter((f): f is Food => !!f).map((f) => (
              <Pressable key={f.id} onPress={() => draft.add(f)} accessibilityRole="button" accessibilityLabel={`Add ${f.name}`}
                style={{ flexDirection: "row", justifyContent: "space-between", borderWidth: 1, borderColor: c.line, borderRadius: 10, padding: 10, backgroundColor: c.surface }}>
                <T variant="bold" style={{ flex: 1 }} numberOfLines={1}>{f.name}</T><T variant="muted">+ add</T>
              </Pressable>
            ))}
            {!foodLib.recents.length ? <T variant="muted">Foods you add show up here.</T> : null}
          </View>
        ) : null}
        {panel === "saved" ? (
          <View style={{ gap: 6 }}>
            {foodLib.saved.map((m) => (
              <View key={m.id} style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: c.line, borderRadius: 10, padding: 10, backgroundColor: c.surface }}>
                <Pressable style={{ flex: 1 }} accessibilityRole="button" accessibilityLabel={`Add saved meal ${m.name}`}
                  onPress={() => m.items.forEach((it) => { const f = byId[it.foodId]; if (f) draft.add(f, it.qty, it.unit); })}>
                  <T variant="bold">{m.name}</T>
                  <T variant="muted" numberOfLines={1}>{m.items.map((it) => byId[it.foodId]?.name.split(" (")[0]).filter(Boolean).join(", ")}</T>
                </Pressable>
                <Pressable onPress={() => deleteSavedMeal(m.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Delete saved meal ${m.name}`}>
                  <Text style={{ color: c.muted }}>✕</Text>
                </Pressable>
              </View>
            ))}
            {!foodLib.saved.length ? <T variant="muted">Build a meal below, then tap “⭐ Save” to reuse it.</T> : null}
          </View>
        ) : null}
      </ScrollView>

      {/* Footer: this meal */}
      <View style={{ paddingHorizontal: Math.max(16, insets.left), paddingTop: 10, paddingBottom: insets.bottom + 12, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.bg, gap: 8 }}>
        {saveName !== null ? (
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <TextInput value={saveName} onChangeText={setSaveName} placeholder="Meal name, e.g. Usual breakfast" placeholderTextColor={c.muted} autoFocus
              style={{ flex: 1, borderWidth: 1, borderColor: c.line, borderRadius: 9, paddingHorizontal: 10, minHeight: 44, color: c.ink, fontFamily: fonts.bodyMedium, backgroundColor: c.surface }} />
            <Btn kind="primary" title="Save" onPress={() => {
              if (!saveName.trim()) return;
              saveMeal({ name: saveName.trim(), items: draft.items.map((x) => ({ foodId: x.food.id, qty: x.qty, unit: x.unit })) });
              setSaveName(null);
            }} />
            <Btn title="✕" onPress={() => setSaveName(null)} />
          </View>
        ) : null}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: c.accent, borderRadius: 12, padding: 12, backgroundColor: c.surface }}>
          <View style={{ flex: 1 }}>
            <T variant="label">This meal</T>
            <Text style={{ fontFamily: fonts.display, fontSize: 20, color: c.ink }}>{Math.round(total.kcal)} KCAL · {Math.round(total.protein)} G PROTEIN</Text>
          </View>
          {draft.items.length && saveName === null ? <Btn title="⭐ Save" onPress={() => setSaveName("")} /> : null}
          <Btn kind="primary" title="Add" onPress={() => { if (draft.items.length) add(); }} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
