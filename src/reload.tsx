// Remounts everything below it, so providers read storage again (used after restoring a backup).
import React, { createContext, useCallback, useContext, useState } from "react";

const Ctx = createContext<() => void>(() => {});

export function ReloadProvider({ children }: { children: React.ReactNode }) {
  const [generation, setGeneration] = useState(0);
  const reload = useCallback(() => setGeneration((g) => g + 1), []);
  return <Ctx.Provider value={reload}><React.Fragment key={generation}>{children}</React.Fragment></Ctx.Provider>;
}

export const useReload = () => useContext(Ctx);
