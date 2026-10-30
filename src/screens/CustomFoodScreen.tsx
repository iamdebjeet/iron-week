// Custom food: type the values from a food label (per serving). Saved on the phone and added to the meal.
import React, { useState } from "react";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Food } from "../data/foods";
import { parseNum } from "../logic/profile";
import { useDraft } from "../diet";
import { useStore } from "../store";
import { useColors } from "../theme";
import { Field } from "../components/Form";
import { Btn, T } from "../components/ui";

type Key = "kcal" | "protein" | "carbs" | "fat" | "fibre" | "sodium";
const FIELDS: { key: Key; label: string; unit: string; max: number }[] = [
  { key: "kcal", label: "Energy", unit: "kcal", max: 3000 },
  { key: "protein", label: "Protein", unit: "g", max: 300 },
  { key: "carbs", label: "Carbs", unit: "g", max: 300 },
  { key: "fat", label: "Fat", unit: "g", max: 300 },
  { key: "fibre", label: "Fibre", unit: "g", max: 100 },
  { key: "sodium", label: "Sodium", unit: "mg", max: 20000 },
];

export function CustomFoodScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { barcode } = useLocalSearchParams<{ barcode?: string }>();
  const { addCustomFood } = useStore();
  const draft = useDraft();
  const [name, setName] = useState("");
  const [serving, setServing] = useState("100");
  const [vals, setVals] = useState<Record<Key, string>>({ kcal: "", protein: "", carbs: "", fat: "", fibre: "", sodium: "" });
  const [msg, setMsg] = useState("");

  const save = () => {
    const g = parseNum(serving, 1, 2000);
    const kcal = parseNum(vals.kcal, 0, 3000);
    if (!name.trim() || !g || kcal === null) { setMsg("Add a name, the serving size and the energy (kcal) at least."); return; }
    const per100 = (v: string, max: number) => ((parseNum(v, 0, max) ?? 0) * 100) / g;
    const food: Food = {
      id: `custom-${barcode ?? Date.now()}`, name: name.trim().slice(0, 60), aliases: [], source: barcode ? "scan" : "custom", barcode: barcode || undefined,
      per100: { kcal: (kcal * 100) / g, protein: per100(vals.protein, 300), carbs: per100(vals.carbs, 300), fat: per100(vals.fat, 300), fibre: per100(vals.fibre, 100), sodium: per100(vals.sodium, 20000) },
      units: g === 100 ? { g100: 100 } : { serving: g, g100: 100 },
    };
    addCustomFood(food);
    draft.add(food);
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32, paddingHorizontal: Math.max(16, insets.left), gap: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <T variant="display" style={{ fontSize: 28 }}>Custom food</T>
          <Btn title="Cancel" onPress={() => router.back()} />
        </View>
        <T variant="muted">{barcode ? `Barcode ${barcode} isn't in Open Food Facts yet. ` : ""}Copy the values from the label. Saved only on this phone.</T>
        <Field label="Name" value={name} onChange={setName} placeholder="e.g. Protein bar (brand)" maxLength={60} />
        <Field label="Serving size" value={serving} onChange={setServing} unit="g" keyboard="decimal-pad" maxLength={5} />
        <T variant="label">Per serving</T>
        {[0, 2, 4].map((i) => (
          <View key={i} style={{ flexDirection: "row", gap: 10 }}>
            {FIELDS.slice(i, i + 2).map((f) => (
              <Field key={f.key} label={f.label} value={vals[f.key]} unit={f.unit} keyboard="decimal-pad" maxLength={6}
                onChange={(v) => setVals((x) => ({ ...x, [f.key]: v }))} />
            ))}
          </View>
        ))}
        {msg ? <T variant="muted" style={{ color: c.warn }}>{msg}</T> : null}
        <Btn kind="primary" title="Save and add to meal" onPress={save} style={{ alignItems: "center" }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
