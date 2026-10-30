// Simple line icons for the tab bar, drawn with react-native-svg (no icon font to download).
import React from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

export type IconName = "dumbbell" | "drop" | "fork-knife" | "chart" | "person";

export function Icon({ name, color, size = 24 }: { name: IconName; color: string; size?: number }) {
  const line = { stroke: color, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === "dumbbell" ? (
        <>
          <Rect x={3.5} y={8} width={3} height={8} rx={1} {...line} />
          <Rect x={17.5} y={8} width={3} height={8} rx={1} {...line} />
          <Path d="M1.5 10.5v3M22.5 10.5v3M6.5 12h11" {...line} />
        </>
      ) : name === "drop" ? (
        <Path d="M12 3.5c3.2 4 5.8 7.3 5.8 10.4a5.8 5.8 0 0 1-11.6 0C6.2 10.8 8.8 7.5 12 3.5z" {...line} />
      ) : name === "fork-knife" ? (
        <>
          <Path d="M7 3v6.5a2 2 0 0 0 2 2v9.5M11 3v6.5a2 2 0 0 1-2 2M9 3v5" {...line} />
          <Path d="M16.5 21V3c-2 1.5-3 4-3 7.5 0 1.7.9 2.5 3 2.5" {...line} />
        </>
      ) : name === "chart" ? (
        <Path d="M3.5 3.5v17h17M7 16l4-5 3.5 3L20 7.5" {...line} />
      ) : (
        <>
          <Circle cx={12} cy={8} r={4} {...line} />
          <Path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6" {...line} />
        </>
      )}
    </Svg>
  );
}
