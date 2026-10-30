// Scan a food barcode: look it up on this phone first, then in Open Food Facts (free, no key).
// Found products are saved on the phone, so the same barcode works offline next time.
import React, { useRef, useState } from "react";
import { ActivityIndicator, Linking, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Food } from "../data/foods";
import { foodFromOff } from "../logic/diet";
import { useDraft } from "../diet";
import { useStore } from "../store";
import { useColors } from "../theme";
import { Btn, T } from "../components/ui";

const OFF = (code: string) =>
  `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,brands,nutriments,serving_quantity`;

type State = { kind: "scanning" } | { kind: "looking"; code: string } | { kind: "found"; food: Food } | { kind: "missing"; code: string } | { kind: "error"; code: string; text: string };

export function ScanScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const { foodLib, addCustomFood } = useStore();
  const draft = useDraft();
  const [state, setState] = useState<State>({ kind: "scanning" });
  const busy = useRef(false);

  const lookUp = async (code: string) => {
    const known = foodLib.custom.find((f) => f.barcode === code);
    if (known) { setState({ kind: "found", food: known }); return; }
    setState({ kind: "looking", code });
    try {
      const res = await fetch(OFF(code), { headers: { "User-Agent": "IronWeek/1.0 (personal fitness app)" } });
      const json = (await res.json()) as { status?: number; product?: Record<string, unknown> };
      const food = json.status === 1 && json.product ? foodFromOff(code, json.product) : null;
      setState(food ? { kind: "found", food } : { kind: "missing", code });
    } catch {
      setState({ kind: "error", code, text: "Couldn't reach Open Food Facts. Check your internet, or enter the food yourself." });
    }
  };

  const onScan = ({ data }: { data: string }) => {
    if (busy.current) return;
    busy.current = true;
    lookUp(data);
  };
  const again = () => { busy.current = false; setState({ kind: "scanning" }); };
  const use = (food: Food) => { addCustomFood(food); draft.add(food); router.back(); };

  const header = (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <T variant="display" style={{ fontSize: 28 }}>Scan barcode</T>
      <Btn title="Cancel" onPress={() => router.back()} />
    </View>
  );
  const wrap = (children: React.ReactNode) => (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16, paddingHorizontal: 16, gap: 14 }}>{header}{children}</View>
  );

  if (!permission) return wrap(<ActivityIndicator color={c.accent} />);
  if (!permission.granted) {
    return wrap(
      <View style={{ gap: 10 }}>
        <T>Iron Week uses the camera only to read food barcodes. Nothing is recorded or sent anywhere except the barcode number, to look it up.</T>
        {permission.canAskAgain
          ? <Btn kind="primary" title="Allow camera" onPress={requestPermission} />
          : <Btn kind="primary" title="Open settings to allow the camera" onPress={() => Linking.openSettings()} />}
      </View>,
    );
  }

  return wrap(
    <>
      {state.kind === "scanning" ? (
        <View style={{ flex: 1, borderRadius: 16, overflow: "hidden", borderWidth: 1.5, borderColor: c.accent }}>
          <CameraView style={{ flex: 1 }} facing="back" onBarcodeScanned={onScan} barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }} />
        </View>
      ) : null}
      {state.kind === "scanning" ? <T variant="muted" style={{ textAlign: "center" }}>Point the camera at the barcode on the pack.</T> : null}
      {state.kind === "looking" ? <View style={{ alignItems: "center", gap: 8 }}><ActivityIndicator color={c.accent} /><T variant="muted">Looking up {state.code}…</T></View> : null}
      {state.kind === "found" ? (
        <View style={{ backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.done, borderRadius: 14, padding: 14, gap: 8 }}>
          <T variant="title">{state.food.name}</T>
          <T variant="muted">Per 100 g: {Math.round(state.food.per100.kcal)} kcal · {Math.round(state.food.per100.protein)} g protein · {Math.round(state.food.per100.carbs)} g carbs · {Math.round(state.food.per100.fat)} g fat</T>
          <T variant="muted" style={{ fontSize: 12 }}>From Open Food Facts (filled in by volunteers; check it against the pack).</T>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Btn kind="primary" title="Add to meal" onPress={() => use(state.food)} />
            <Btn title="Scan another" onPress={again} />
          </View>
        </View>
      ) : null}
      {state.kind === "missing" || state.kind === "error" ? (
        <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, gap: 8 }}>
          <T>{state.kind === "error" ? state.text : `Barcode ${state.code} wasn't found.`}</T>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Btn kind="primary" title="Enter it yourself" onPress={() => router.replace({ pathname: "/custom-food", params: { barcode: state.code } })} />
            <Btn title="Scan again" onPress={again} />
          </View>
        </View>
      ) : null}
    </>,
  );
}
