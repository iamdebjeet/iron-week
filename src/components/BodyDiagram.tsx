// Simple front/back body figure. Main muscles in the strong colour, helpers in the light one.
import React from "react";
import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText } from "react-native-svg";
import { useColors } from "../theme";

interface Props { main: string[]; helps?: string[]; width?: number }

export function BodyDiagram({ main, helps = [], width = 104 }: Props) {
  const c = useColors();
  const H = new Set(main), S = new Set(helps);
  const fill = (m?: string) => (m && H.has(m) ? c.hit : m && S.has(m) ? c.help : c.figure);
  const stroke = { stroke: c.surface, strokeWidth: 0.8 };

  const figure = (cx: number, view: "f" | "b") => {
    const L = (x: number) => cx - x, R = (x: number) => cx + x;
    const both = (x: number, el: (x: number, k: string) => React.ReactNode) => [el(L(x), "l"), el(R(x), "r")];
    return (
      <G key={view}>
        <Circle cx={cx} cy={8} r={6} fill={fill()} {...stroke} />
        <Rect x={L(3)} y={13} width={6} height={5} rx={1.5} fill={fill("Neck")} {...stroke} />
        {both(6, (x, k) => (
          <G key={"leg" + k}>
            <Rect x={x - 3} y={78} width={6} height={18} rx={3} fill={fill()} {...stroke} />
            <Ellipse cx={x} cy={98} rx={3.5} ry={1.8} fill={fill()} {...stroke} />
          </G>
        ))}
        {both(19, (x, k) => <Circle key={"hand" + k} cx={x} cy={56} r={2.6} fill={fill()} {...stroke} />)}
        {both(18.5, (x, k) => <Ellipse key={"fa" + k} cx={x} cy={46} rx={2.8} ry={7} fill={fill("Forearms")} {...stroke} />)}
        {both(16, (x, k) => <Ellipse key={"ua" + k} cx={x} cy={32.5} rx={3.3} ry={6.5} fill={fill(view === "f" ? "Biceps" : "Triceps")} {...stroke} />)}
        {view === "f" ? (
          <>
            <Path d={`M${L(3)} 17 L${L(11)} 20 L${L(4)} 21 Z`} fill={fill("Traps")} {...stroke} />
            <Path d={`M${R(3)} 17 L${R(11)} 20 L${R(4)} 21 Z`} fill={fill("Traps")} {...stroke} />
            <Path d={`M${L(0.6)} 20 L${L(11)} 20 Q${L(12)} 28 ${L(8)} 30 L${L(0.6)} 30 Z`} fill={fill("Chest")} {...stroke} />
            <Path d={`M${R(0.6)} 20 L${R(11)} 20 Q${R(12)} 28 ${R(8)} 30 L${R(0.6)} 30 Z`} fill={fill("Chest")} {...stroke} />
            <Rect x={L(8)} y={30.5} width={16} height={18} rx={3} fill={fill("Abs & core")} {...stroke} />
            <Path d={`M${L(9.5)} 49 L${R(9.5)} 49 L${cx} 57 Z`} fill={fill("Hips")} {...stroke} />
            {both(6, (x, k) => <Ellipse key={"q" + k} cx={x} cy={65} rx={5.2} ry={12.5} fill={fill("Quads")} {...stroke} />)}
          </>
        ) : (
          <>
            <Path d={`M${cx} 16 L${R(11)} 20 L${cx} 32 L${L(11)} 20 Z`} fill={fill("Traps")} {...stroke} />
            <Path d={`M${L(1)} 32 L${L(11.5)} 21 Q${L(12)} 34 ${L(6)} 40 L${L(1)} 40 Z`} fill={fill("Back")} {...stroke} />
            <Path d={`M${R(1)} 32 L${R(11.5)} 21 Q${R(12)} 34 ${R(6)} 40 L${R(1)} 40 Z`} fill={fill("Back")} {...stroke} />
            <Rect x={L(7)} y={40.5} width={14} height={8.5} rx={2} fill={fill("Lower back")} {...stroke} />
            {both(4.8, (x, k) => <Ellipse key={"g" + k} cx={x} cy={54} rx={5.2} ry={5.3} fill={fill("Glutes")} {...stroke} />)}
            {both(6, (x, k) => <Ellipse key={"h" + k} cx={x} cy={68.5} rx={4.9} ry={9.5} fill={fill("Hamstrings")} {...stroke} />)}
            {both(6, (x, k) => <Ellipse key={"c" + k} cx={x} cy={84} rx={3.9} ry={7} fill={fill("Calves")} {...stroke} />)}
          </>
        )}
        {both(13, (x, k) => <Circle key={"sh" + k} cx={x} cy={22.5} r={4.6} fill={fill("Shoulders")} {...stroke} />)}
        <SvgText x={cx} y={108} textAnchor="middle" fontSize={7} fill={c.muted}>{view === "f" ? "Front" : "Back"}</SvgText>
      </G>
    );
  };

  return (
    <Svg width={width} height={(width * 111) / 110} viewBox="0 0 110 111" accessibilityLabel={`${main.join(", ")} highlighted on a body diagram`}>
      {figure(27, "f")}
      {figure(83, "b")}
    </Svg>
  );
}
