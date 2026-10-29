// Gym and swim entry passes, kept only on this phone.
// - Add a PDF (or a photo/screenshot). A PDF's first page is turned into a sharp image once, so it opens instantly.
// - Files live in the app's private folder; AsyncStorage keeps only the file paths and the valid-till date.
// - Replacing a pass deletes the old files. A notification reminds you 2 days before it expires.
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Image, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Brightness from "expo-brightness";
import * as Notifications from "expo-notifications";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { Directory, File, Paths } from "expo-file-system";
import { WebView as RNWebView, type WebViewMessageEvent, type WebViewProps } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  GestureDetector, GestureHandlerRootView, useExclusiveGestures, usePanGesture, usePinchGesture, useSimultaneousGestures, useTapGesture,
} from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Btn, OptionPicker, T } from "./components/ui";
import { ensurePermission } from "./notifications";
import { fonts, useColors } from "./theme";

// react-native-webview's class typings clash with React 19's; describe just what we use.
interface WebViewHandle { injectJavaScript: (js: string) => void }
const WebView = RNWebView as unknown as React.ComponentType<WebViewProps & { ref?: React.Ref<WebViewHandle> }>;

export type PassKind = "gym" | "swim";
interface Pass { image: string; pdf?: string; validTill: string; addedAt: string; reminderId?: string }
type Passes = Partial<Record<PassKind, Pass>>;

const STORE_KEY = "passes";
const LABEL: Record<PassKind, string> = { gym: "Gym pass", swim: "Swim pass" };
const passDir = () => { const d = new Directory(Paths.document, "passes"); if (!d.exists) d.create(); return d; };

/* ---------- dates ---------- */
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const pretty = (s: string) => parse(s).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
const daysLeft = (s: string) => { const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((parse(s).getTime() - t.getTime()) / 86_400_000); };
const endOfMonth = () => { const t = new Date(); return iso(new Date(t.getFullYear(), t.getMonth() + 1, 0)); };
const dateOptions = () => Array.from({ length: 70 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return iso(d); });

/* ---------- PDF -> image, using pdf.js inside a hidden WebView (needs internet only while adding) ---------- */
const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174";
const RENDER_HTML = `<!doctype html><html><head><meta name="viewport" content="width=device-width"></head><body>
<script src="${PDFJS}/pdf.min.js"></script>
<script>
function send(o){window.ReactNativeWebView.postMessage(JSON.stringify(o))}
window.renderPdf=async function(b64){
  try{
    pdfjsLib.GlobalWorkerOptions.workerSrc="${PDFJS}/pdf.worker.min.js";
    var bin=atob(b64),bytes=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    var pdf=await pdfjsLib.getDocument({data:bytes}).promise;var page=await pdf.getPage(1);
    var v=page.getViewport({scale:1});var scale=Math.min(4,2200/Math.max(v.width,v.height));var vp=page.getViewport({scale:scale});
    var c=document.createElement("canvas");c.width=Math.floor(vp.width);c.height=Math.floor(vp.height);
    var ctx=c.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height);
    await page.render({canvasContext:ctx,viewport:vp}).promise;
    send({ok:true,data:c.toDataURL("image/png").split(",")[1],pages:pdf.numPages});
  }catch(e){send({ok:false,error:String(e&&e.message||e)})}
};
send({ready:typeof pdfjsLib!=="undefined"});
</script></body></html>`;

interface Job { b64: string; resolve: (png: string) => void; reject: (e: Error) => void }

function PdfRenderer({ job, onDone }: { job: Job | null; onDone: () => void }) {
  const ref = useRef<WebViewHandle>(null);
  if (!job) return null;
  const onMessage = (e: WebViewMessageEvent) => {
    const msg = JSON.parse(e.nativeEvent.data);
    if ("ready" in msg) {
      if (!msg.ready) { job.reject(new Error("offline")); onDone(); return; }
      ref.current?.injectJavaScript(`window.renderPdf(${JSON.stringify(job.b64)});true;`);
    } else {
      if (msg.ok) job.resolve(msg.data); else job.reject(new Error(msg.error));
      onDone();
    }
  };
  return (
    <View style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} pointerEvents="none">
      <WebView ref={ref} originWhitelist={["*"]} source={{ html: RENDER_HTML }} onMessage={onMessage}
        onError={() => { job.reject(new Error("webview")); onDone(); }} javaScriptEnabled />
    </View>
  );
}

/* ---------- context ---------- */
interface PassesApi {
  passes: Passes;
  show: (kind: PassKind) => void;
  openManager: () => void;
}
const Ctx = createContext<PassesApi | null>(null);

export function PassesProvider({ children }: { children: React.ReactNode }) {
  const [passes, setPasses] = useState<Passes>({});
  const [job, setJob] = useState<Job | null>(null);
  const [viewing, setViewing] = useState<PassKind | null>(null);
  const [managerOpen, setManagerOpen] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY).then((s) => {
      if (!s) return;
      const p: Passes = JSON.parse(s);
      // Drop entries whose files are gone (for example after restoring a backup).
      (Object.keys(p) as PassKind[]).forEach((k) => { if (!new File(p[k]!.image).exists) delete p[k]; });
      setPasses(p);
    }).catch(() => {});
  }, []);

  const save = useCallback((next: Passes) => { setPasses(next); AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => {}); }, []);

  const renderPdf = (b64: string) => new Promise<string>((resolve, reject) => setJob({ b64, resolve, reject }));

  const scheduleExpiry = async (kind: PassKind, validTill: string) => {
    const when = parse(validTill); when.setDate(when.getDate() - 2); when.setHours(10, 0, 0, 0);
    if (when.getTime() <= Date.now() || !(await ensurePermission())) return undefined;
    return Notifications.scheduleNotificationAsync({
      content: { title: `${LABEL[kind]} expires in 2 days`, body: `Valid till ${pretty(validTill)}. Renew it and add the new pass in Iron Week.`, data: { kind: "pass" } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: "reminders" },
    });
  };

  const removeFiles = (p?: Pass) => {
    if (!p) return;
    [p.image, p.pdf].forEach((u) => { if (u) { const f = new File(u); if (f.exists) f.delete(); } });
    if (p.reminderId) Notifications.cancelScheduledNotificationAsync(p.reminderId).catch(() => {});
  };

  /** Add or replace a pass. Returns an error message, or "" on success. */
  const addPass = async (kind: PassKind, source: "pdf" | "photo", validTill: string): Promise<string> => {
    const stamp = Date.now();
    const dir = passDir();
    let image = "", pdf: string | undefined;
    if (source === "pdf") {
      // expo-file-system's own picker returns a File it's allowed to read; a DocumentPicker URI is rejected in Expo Go.
      const res = await File.pickFileAsync({ mimeTypes: ["application/pdf"] });
      if (res.canceled) return "cancel";
      const picked = res.result;
      const pdfFile = new File(dir, `${kind}-${stamp}.pdf`);
      picked.copySync(pdfFile);
      pdf = pdfFile.uri;
      try {
        const png = await renderPdf(await pdfFile.base64());
        const img = new File(dir, `${kind}-${stamp}.png`);
        img.create();
        await img.write(png, { encoding: "base64" });
        image = img.uri;
      } catch (e) {
        pdfFile.delete();
        return (e as Error).message === "offline"
          ? "Couldn't read the PDF: turn on internet once while adding it (it's needed only to convert the PDF)."
          : "Couldn't read this PDF. Try a screenshot of the pass with “Choose photo”.";
      }
    } else {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1 });
      if (res.canceled) return "cancel";
      const ext = (res.assets[0].uri.split(".").pop() || "jpg").toLowerCase();
      const img = new File(dir, `${kind}-${stamp}.${ext}`);
      new File(res.assets[0].uri).copySync(img);
      image = img.uri;
    }
    removeFiles(passes[kind]);
    const reminderId = await scheduleExpiry(kind, validTill);
    save({ ...passes, [kind]: { image, pdf, validTill, addedAt: iso(new Date()), reminderId } });
    return "";
  };

  const deletePass = (kind: PassKind) => { removeFiles(passes[kind]); const n = { ...passes }; delete n[kind]; save(n); };
  const setValidTill = async (kind: PassKind, validTill: string) => {
    const p = passes[kind]; if (!p) return;
    if (p.reminderId) Notifications.cancelScheduledNotificationAsync(p.reminderId).catch(() => {});
    save({ ...passes, [kind]: { ...p, validTill, reminderId: await scheduleExpiry(kind, validTill) } });
  };

  const api: PassesApi = { passes, show: setViewing, openManager: () => setManagerOpen(true) };

  return (
    <Ctx.Provider value={api}>
      {children}
      <PassManager visible={managerOpen} onClose={() => setManagerOpen(false)} passes={passes}
        onAdd={addPass} onDelete={deletePass} onValidTill={setValidTill} onShow={(k) => setViewing(k)} />
      <PassViewer kind={viewing} pass={viewing ? passes[viewing] : undefined} onClose={() => setViewing(null)} />
      <PdfRenderer job={job} onDone={() => setJob(null)} />
    </Ctx.Provider>
  );
}

export function usePasses() {
  const p = useContext(Ctx);
  if (!p) throw new Error("usePasses must be used inside PassesProvider");
  return p;
}

/* ---------- validity chip ---------- */
function Validity({ validTill }: { validTill: string }) {
  const c = useColors();
  const left = daysLeft(validTill);
  const [text, color] = left < 0 ? [`Expired on ${pretty(validTill)}`, c.warn]
    : left === 0 ? ["Expires today", c.warn]
    : left <= 3 ? [`Valid till ${pretty(validTill)} · ${left} day${left === 1 ? "" : "s"} left`, c.warn]
    : [`Valid till ${pretty(validTill)} · ${left} days left`, c.done];
  return <Text style={{ color, fontFamily: fonts.bodyBold, fontSize: 13 }}>{text}</Text>;
}

/* ---------- full-screen pass, max brightness ---------- */
function PassViewer({ kind, pass, onClose }: { kind: PassKind | null; pass?: Pass; onClose: () => void }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const visible = !!kind && !!pass;
  useEffect(() => {
    if (!visible) return;
    Brightness.setBrightnessAsync(1).catch(() => {});
    activateKeepAwakeAsync("pass").catch(() => {});
    return () => {
      Brightness.restoreSystemBrightnessAsync().catch(() => Brightness.setBrightnessAsync(0.6).catch(() => {}));
      deactivateKeepAwake("pass").catch(() => {});
    };
  }, [visible]);
  if (!visible) return null;
  return (
    <Modal visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      {/* A Modal is a separate native window, so it needs its own gesture root. */}
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#fff", paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, marginBottom: 8 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 24, color: "#111", textTransform: "uppercase" }}>{LABEL[kind!]}</Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close pass">
            <Text style={{ fontFamily: fonts.bodyBold, color: "#555" }}>Close ✕</Text>
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: 16, marginBottom: 6, gap: 2 }}>
          <Validity validTill={pass!.validTill} />
          <Text style={{ fontFamily: fonts.body, fontSize: 12, color: "#777" }}>Pinch or double-tap to zoom</Text>
        </View>
        <ZoomableImage uri={pass!.image} width={width} maxHeight={height} label={LABEL[kind!]} onTap={onClose} />
      </GestureHandlerRootView>
    </Modal>
  );
}

/* ---------- pinch / pan / double-tap zoom for just the pass image ---------- */
const MAX_ZOOM = 5;
const TAP_ZOOM = 2.5;

function ZoomableImage({ uri, width, maxHeight, label, onTap }: { uri: string; width: number; maxHeight: number; label: string; onTap: () => void }) {
  const scale = useSharedValue(1);
  const startScale = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const boxW = useSharedValue(width);
  const boxH = useSharedValue(maxHeight);

  // Keep the zoomed image covering the box, so it can't be dragged off-screen.
  const clamp = (v: number, s: number, size: number) => {
    "worklet";
    const max = (size * (s - 1)) / 2;
    return Math.min(max, Math.max(-max, v));
  };

  const pinch = usePinchGesture({
    onBegin: () => { "worklet"; startScale.value = scale.value; },
    onUpdate: (e) => {
      "worklet";
      scale.value = Math.min(MAX_ZOOM, Math.max(1, startScale.value * e.scale));
      x.value = clamp(x.value, scale.value, boxW.value);
      y.value = clamp(y.value, scale.value, boxH.value);
    },
  });
  const pan = usePanGesture({
    minPointers: 1,
    onUpdate: (e) => {
      "worklet";
      x.value = clamp(x.value + e.changeX, scale.value, boxW.value);
      y.value = clamp(y.value + e.changeY, scale.value, boxH.value);
    },
  });
  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onActivate: () => {
      "worklet";
      const zoomIn = scale.value < 1.1;
      scale.value = withTiming(zoomIn ? TAP_ZOOM : 1);
      if (!zoomIn) { x.value = withTiming(0); y.value = withTiming(0); }
    },
  });
  // A single tap closes the pass only when it isn't zoomed, so tapping around a zoomed pass is safe.
  const singleTap = useTapGesture({
    runOnJS: true,
    onActivate: () => { if (scale.value <= 1.01) onTap(); },
  });
  const gesture = useSimultaneousGestures(pinch, pan, useExclusiveGestures(doubleTap, singleTap));

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }] }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={{ flex: 1, overflow: "hidden" }}
        onLayout={(e) => { boxW.value = e.nativeEvent.layout.width; boxH.value = e.nativeEvent.layout.height; }}>
        <Animated.Image source={{ uri }} resizeMode="contain" style={[{ flex: 1, width, maxHeight }, style]} accessibilityLabel={label} />
      </Animated.View>
    </GestureDetector>
  );
}

/* ---------- add / replace / delete ---------- */
function PassManager({ visible, onClose, passes, onAdd, onDelete, onValidTill, onShow }: {
  visible: boolean; onClose: () => void; passes: Passes;
  onAdd: (k: PassKind, s: "pdf" | "photo", validTill: string) => Promise<string>;
  onDelete: (k: PassKind) => void; onValidTill: (k: PassKind, d: string) => void; onShow: (k: PassKind) => void;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState<PassKind | null>(null);
  const [msg, setMsg] = useState<Partial<Record<PassKind, string>>>({});
  const [newDate, setNewDate] = useState<Record<PassKind, string>>({ gym: endOfMonth(), swim: endOfMonth() });
  const [armed, setArmed] = useState<PassKind | null>(null);

  const add = async (k: PassKind, s: "pdf" | "photo") => {
    setBusy(k); setMsg((m) => ({ ...m, [k]: "" }));
    const err = await onAdd(k, s, newDate[k]).catch((e) => {
      console.warn("Adding pass failed:", e);
      return `Something went wrong. Please try again.${__DEV__ ? `\n(${String((e as Error)?.message ?? e)})` : ""}`;
    });
    setBusy(null);
    if (err && err !== "cancel") setMsg((m) => ({ ...m, [k]: err }));
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 }}>
          <T variant="display" style={{ fontSize: 26 }}>Entry passes</T>
          <Btn title="Close ✕" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 + insets.bottom }}>
          <T variant="muted">Saved only on this phone. Add the PDF you get each month; replacing it deletes the old one.</T>
          {(["gym", "swim"] as PassKind[]).map((k) => {
            const p = passes[k];
            const accent = k === "swim" ? c.pool : c.accent;
            return (
              <View key={k} style={{ backgroundColor: c.surface, borderWidth: 1.5, borderColor: accent, borderRadius: 14, padding: 14, gap: 10 }}>
                <T variant="title" style={{ color: k === "swim" ? c.pool : c.ink }}>{LABEL[k]}</T>
                {p ? (
                  <>
                    <Pressable onPress={() => onShow(k)} accessibilityRole="button" accessibilityLabel={`Show ${LABEL[k]}`}
                      style={{ borderRadius: 10, overflow: "hidden", backgroundColor: "#fff", borderWidth: 1, borderColor: c.line }}>
                      <Image source={{ uri: p.image }} resizeMode="contain" style={{ width: "100%", height: 200 }} />
                    </Pressable>
                    <Validity validTill={p.validTill} />
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <T variant="label">Valid till</T>
                      <OptionPicker label="Valid till" value={p.validTill} options={dateOptions()} format={pretty} onChange={(d) => onValidTill(k, d)} />
                    </View>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      <Btn kind="primary" color={k === "swim" ? c.pool : undefined} title="Show pass" onPress={() => onShow(k)} />
                      {p.pdf ? <Btn title="Open PDF" onPress={() => new File(p.pdf!).preview().catch(() => {})} /> : null}
                      <Btn kind={armed === k ? "danger" : "plain"} title={armed === k ? "Tap again to delete" : "Delete"}
                        onPress={() => { if (armed === k) { onDelete(k); setArmed(null); } else { setArmed(k); setTimeout(() => setArmed(null), 4000); } }} />
                    </View>
                  </>
                ) : <T variant="muted">No pass yet.</T>}

                <View style={{ borderTopWidth: 1, borderTopColor: c.line, paddingTop: 10, gap: 8 }}>
                  <T variant="bold">{p ? "Got a new pass? Replace it" : "Add your pass"}</T>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <T variant="label">New pass valid till</T>
                    <OptionPicker label="Valid till" value={newDate[k]} options={dateOptions()} format={pretty} onChange={(d) => setNewDate((n) => ({ ...n, [k]: d }))} />
                  </View>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    <Btn kind={p ? "plain" : "primary"} color={!p && k === "swim" ? c.pool : undefined} title={busy === k ? "Reading PDF…" : "Choose PDF"} onPress={() => busy || add(k, "pdf")} />
                    <Btn title="Choose photo" onPress={() => busy || add(k, "photo")} />
                  </View>
                  {msg[k] ? <T variant="muted" style={{ color: c.warn }}>{msg[k]}</T> : null}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

/** Small button to show a pass from anywhere (opens the manager when there's no pass yet) */
export function ShowPassButton({ kind }: { kind: PassKind }) {
  const { passes, show, openManager } = usePasses();
  const c = useColors();
  const has = !!passes[kind];
  return <Btn small title={has ? `🎫 Show ${kind} pass` : `🎫 Add ${kind} pass`} onPress={() => (has ? show(kind) : openManager())}
    style={kind === "swim" ? { borderColor: c.pool } : undefined} />;
}
