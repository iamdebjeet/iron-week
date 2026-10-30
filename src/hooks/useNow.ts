// The current time as state, refreshed every 30 s and when the app comes back to the front,
// so screens can depend on the clock without calling Date during render.
import { useEffect, useState } from "react";
import { AppState } from "react-native";

export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    const iv = setInterval(tick, intervalMs);
    const sub = AppState.addEventListener("change", (s) => s === "active" && tick());
    return () => { clearInterval(iv); sub.remove(); };
  }, [intervalMs]);
  return now;
}
