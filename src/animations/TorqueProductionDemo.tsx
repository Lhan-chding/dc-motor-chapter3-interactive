import { useMemo, useState } from "react";
import { torque } from "../utils/motorMath";
import { DemoFrame, Readout, useDemoClock } from "./shared";

type Point = {
  x: number;
  y: number;
};

function polar(center: Point, radius: number, angleDeg: number): Point {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius
  };
}

function conductorMarker(id: string, cx: number, cy: number, out: boolean, active: boolean) {
  return (
    <g key={id} transform={`translate(${cx} ${cy})`} opacity={active ? 1 : 0.42}>
      <circle r="11" className="figure32-conductor" />
      {out ? (
        <circle r="4" fill="#111827" />
      ) : (
        <g stroke="#111827" strokeWidth="3.2" strokeLinecap="round">
          <line x1="-5" y1="-5" x2="5" y2="5" />
          <line x1="5" y1="-5" x2="-5" y2="5" />
        </g>
      )}
    </g>
  );
}

function TwoPolePermanentFigure({
  currentSign,
  phiLevel,
  torqueSign,
  rotorAngle
}: {
  currentSign: number;
  phiLevel: number;
  torqueSign: number;
  rotorAngle: number;
}) {
  const center = { x: 245, y: 250 };
  const conductors = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => {
        const angle = -160 + index * 20 + rotorAngle;
        const point = polar(center, 78, angle);
        const upperHalf = point.y < center.y;
        return { angle, point, out: currentSign >= 0 ? !upperHalf : upperHalf };
      }),
    [currentSign, rotorAngle]
  );
  const fluxOpacity = 0.28 + phiLevel * 0.5;

  return (
    <g aria-label="图3.2a：2极永磁励磁">
      <circle cx={center.x} cy={center.y} r="142" className="figure32-outer" />
      <circle cx={center.x} cy={center.y} r="128" className="figure32-inner-outline" />
      <path d="M 124 190 A 142 142 0 0 1 366 190 L 318 222 A 84 84 0 0 0 172 222 Z" className="figure32-pm-pole" />
      <path d="M 124 310 A 142 142 0 0 0 366 310 L 318 278 A 84 84 0 0 1 172 278 Z" className="figure32-pm-pole" />
      <text x="245" y="148" textAnchor="middle" className="figure32-pole-text">N</text>
      <text x="245" y="363" textAnchor="middle" className="figure32-pole-text">S</text>
      <text x="158" y="185" textAnchor="middle" className="figure32-pole-sub">N</text>
      <text x="332" y="185" textAnchor="middle" className="figure32-pole-sub">N</text>
      <text x="158" y="328" textAnchor="middle" className="figure32-pole-sub">S</text>
      <text x="332" y="328" textAnchor="middle" className="figure32-pole-sub">S</text>

      <g opacity={fluxOpacity} aria-label="永磁体产生的径向磁通">
        {[-46, -25, 0, 25, 46].map((xOffset) => (
          <path
            key={xOffset}
            d={`M ${245 + xOffset} 142 C ${226 + xOffset * 0.2} 188, ${226 + xOffset * 0.2} 312, ${245 + xOffset} 358`}
            className="figure32-flux"
            markerEnd="url(#figure32-arrow)"
          />
        ))}
        <path d="M 112 125 A 158 158 0 0 1 378 125" className="figure32-flux-outer" markerEnd="url(#figure32-arrow)" />
      </g>

      <circle cx={center.x} cy={center.y} r="82" className="figure32-rotor" />
      <circle cx={center.x} cy={center.y} r="31" className="figure32-shaft" />
      {conductors.map(({ angle, point, out }) => conductorMarker(`pm-${angle}`, point.x, point.y, out, true))}

      <g transform={`rotate(${rotorAngle} ${center.x} ${center.y})`} opacity={Math.abs(currentSign) > 0 ? 1 : 0.25} aria-label="导体受力形成转矩">
        <path d={torqueSign >= 0 ? "M 168 304 A 92 92 0 0 1 155 216" : "M 322 304 A 92 92 0 0 0 335 216"} className="figure32-force" markerEnd="url(#figure32-arrow)" />
        <path d={torqueSign >= 0 ? "M 322 196 A 92 92 0 0 1 335 284" : "M 168 196 A 92 92 0 0 0 155 284"} className="figure32-force" markerEnd="url(#figure32-arrow)" />
      </g>

      <text x={center.x} y="436" textAnchor="middle" className="figure32-caption">a) 2 极永磁励磁</text>
    </g>
  );
}

function FourPoleWindingFigure({
  currentSign,
  phiLevel,
  torqueSign,
  rotorAngle
}: {
  currentSign: number;
  phiLevel: number;
  torqueSign: number;
  rotorAngle: number;
}) {
  const center = { x: 715, y: 250 };
  const conductorAngles = [-150, -122, -94, -66, -38, -10, 18, 46, 74, 102, 130, 158];
  const fluxOpacity = 0.28 + phiLevel * 0.5;

  return (
    <g aria-label="图3.2b：4极电励磁">
      <circle cx={center.x} cy={center.y} r="142" className="figure32-outer" />
      <circle cx={center.x} cy={center.y} r="120" className="figure32-inner-outline" />

      <g className="figure32-wound-poles" aria-label="四极励磁绕组">
        <path d="M 654 118 H 776 V 168 H 654 Z" className="figure32-pole-core" />
        <path d="M 654 332 H 776 V 382 H 654 Z" className="figure32-pole-core" />
        <path d="M 584 190 H 634 V 310 H 584 Z" className="figure32-pole-core" />
        <path d="M 796 190 H 846 V 310 H 796 Z" className="figure32-pole-core" />
        {[-44, -24, -4, 16, 36].map((dx) => (
          <path key={`top-${dx}`} d={`M ${715 + dx} 116 v54`} className="figure32-coil-turn" />
        ))}
        {[-44, -24, -4, 16, 36].map((dx) => (
          <path key={`bottom-${dx}`} d={`M ${715 + dx} 330 v54`} className="figure32-coil-turn" />
        ))}
        {[-42, -22, -2, 18, 38].map((dy) => (
          <path key={`left-${dy}`} d={`M 582 ${250 + dy} h54`} className="figure32-coil-turn" />
        ))}
        {[-42, -22, -2, 18, 38].map((dy) => (
          <path key={`right-${dy}`} d={`M 794 ${250 + dy} h54`} className="figure32-coil-turn" />
        ))}
        <text x="715" y="107" textAnchor="middle" className="figure32-pole-text">N</text>
        <text x="715" y="413" textAnchor="middle" className="figure32-pole-text">N</text>
        <text x="566" y="254" textAnchor="middle" className="figure32-pole-text">S</text>
        <text x="864" y="254" textAnchor="middle" className="figure32-pole-text">S</text>
      </g>

      <g opacity={fluxOpacity} aria-label="四极励磁磁通回路">
        <path d="M 684 168 C 662 184, 642 202, 626 226" className="figure32-flux" markerEnd="url(#figure32-arrow)" />
        <path d="M 746 168 C 768 184, 788 202, 804 226" className="figure32-flux" markerEnd="url(#figure32-arrow)" />
        <path d="M 684 332 C 662 316, 642 298, 626 274" className="figure32-flux" markerEnd="url(#figure32-arrow)" />
        <path d="M 746 332 C 768 316, 788 298, 804 274" className="figure32-flux" markerEnd="url(#figure32-arrow)" />
      </g>

      <circle cx={center.x} cy={center.y} r="82" className="figure32-rotor" />
      <circle cx={center.x} cy={center.y} r="31" className="figure32-shaft" />
      {conductorAngles.map((baseAngle) => {
        const angle = baseAngle + rotorAngle;
        const point = polar(center, 72, angle);
        const quadrant = Math.floor((((angle + 360) % 360) + 45) / 90) % 4;
        const out = currentSign >= 0 ? quadrant % 2 === 0 : quadrant % 2 !== 0;
        return conductorMarker(`wound-${baseAngle}`, point.x, point.y, out, true);
      })}

      <g transform={`rotate(${rotorAngle} ${center.x} ${center.y})`} aria-label="四极模型中导体切向受力">
        <path d={torqueSign >= 0 ? "M 644 305 A 86 86 0 0 1 630 226" : "M 786 305 A 86 86 0 0 0 800 226"} className="figure32-force" markerEnd="url(#figure32-arrow)" />
        <path d={torqueSign >= 0 ? "M 786 195 A 86 86 0 0 1 800 274" : "M 644 195 A 86 86 0 0 0 630 274"} className="figure32-force" markerEnd="url(#figure32-arrow)" />
      </g>

      <text x={center.x} y="436" textAnchor="middle" className="figure32-caption">b) 4 极电励磁</text>
    </g>
  );
}

export default function TorqueProductionDemo() {
  const [playing, setPlaying] = useState(true);
  const [current, setCurrent] = useState(50);
  const [phi, setPhi] = useState(1);
  const [kt, setKt] = useState(1.2);
  const { time, reset } = useDemoClock(playing, 1);
  const tValue = kt * phi * current;
  const currentSign = current >= 0 ? 1 : -1;
  const torqueSign = tValue >= 0 ? 1 : -1;
  const rotorAngle = Math.abs(tValue) < 1e-6 ? 0 : time * 22 * torqueSign;
  const phiLevel = Math.min(1, Math.max(0.05, phi / 1.5));
  const status =
    Math.abs(tValue) < 1e-6
      ? "磁通或电流为零时，不产生电磁转矩"
      : tValue > 0
        ? "轴向电流与径向磁通作用，形成正向转矩"
        : "电流反向后，电磁转矩方向反向";

  return (
    <DemoFrame
      status={status}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      sliders={[
        { label: "电枢电流", symbol: "I", value: current, min: -100, max: 100, step: 5, unit: "A", onChange: setCurrent },
        { label: "磁通", symbol: "Φ", value: phi, min: 0, max: 1.5, step: 0.05, unit: "Wb", onChange: setPhi },
        { label: "转矩常数", symbol: "KT", value: kt, min: 0.1, max: 5, step: 0.1, unit: "", onChange: setKt }
      ]}
      readouts={
        <>
          <Readout label="T=KTΦI" value={torque(kt * Math.max(phi, 0.001), current)} unit="N·m" tone={tValue >= 0 ? "green" : "amber"} />
          <Readout label="图示" value="图3.2" tone="blue" />
        </>
      }
    >
      <svg className="figure32-svg" viewBox="0 0 960 520" role="img" aria-label="图3.2直流电机励磁系统和转矩产生机理">
        <defs>
          <marker id="figure32-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#111827" />
          </marker>
        </defs>
        <rect x="24" y="24" width="912" height="460" rx="24" className="figure32-panel" />
        <TwoPolePermanentFigure currentSign={currentSign} phiLevel={phiLevel} torqueSign={torqueSign} rotorAngle={rotorAngle} />
        <FourPoleWindingFigure currentSign={currentSign} phiLevel={phiLevel} torqueSign={torqueSign} rotorAngle={rotorAngle} />
        <text x="480" y="502" textAnchor="middle" className="figure32-note">图 3.2  直流电机的励磁系统。a）2 极永磁励磁；b）4 极电励磁</text>
      </svg>
    </DemoFrame>
  );
}
