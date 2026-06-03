import { useState } from "react";
import { backEmf, steadySpeed } from "../utils/motorMath";
import { formatNumber } from "../utils/format";
import { ArrowDefs, DemoFrame, Readout, useDemoClock } from "./shared";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type Point = {
  x: number;
  y: number;
};

const STEADY_MOTOR_CENTER: Point = { x: 280, y: 172 };

function polar(center: Point, radius: number, angleDeg: number): Point {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius
  };
}

function BookCurrentMark({ point, out }: { point: Point; out: boolean }) {
  return (
    <g transform={`translate(${point.x} ${point.y})`} aria-label={out ? "电流出纸面" : "电流入纸面"}>
      <circle r="12" className="steady-book-current-circle" />
      {out ? (
        <circle r="4" className="steady-book-current-dot" />
      ) : (
        <g className="steady-book-current-cross">
          <line x1="-5" y1="-5" x2="5" y2="5" />
          <line x1="5" y1="-5" x2="-5" y2="5" />
        </g>
      )}
    </g>
  );
}

function BookSteadyMotor({ angle, current, omega }: { angle: number; current: number; omega: number }) {
  const aAngle = 130 + angle;
  const bAngle = aAngle + 180;
  const sideA = polar(STEADY_MOTOR_CENTER, 78, aAngle);
  const sideB = polar(STEADY_MOTOR_CENTER, 78, bAngle);
  const positiveCurrent = current >= 0;
  const running = omega > 1;

  return (
    <svg className="steady-book-motor-svg" viewBox="0 0 560 330" role="img" aria-label="稳态直流电机线稿示意">
      <defs>
        <marker id="steady-motor-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="book-circuit-arrow-head" />
        </marker>
      </defs>

      <rect x="52" y="108" width="456" height="128" className="role-field" />
      <text x="108" y="187" className="figure34-pole">N</text>
      <text x="444" y="187" className="figure34-pole">S</text>

      {[132, 172, 212].map((y) => (
        <path key={y} d={`M 160 ${y} H 400`} className="steady-book-flux" markerEnd="url(#steady-motor-arrow)" />
      ))}

      <circle cx={STEADY_MOTOR_CENTER.x} cy={STEADY_MOTOR_CENTER.y} r="108" className="figure34-airgap" />
      <g transform={`rotate(${angle} ${STEADY_MOTOR_CENTER.x} ${STEADY_MOTOR_CENTER.y})`}>
        <circle cx={STEADY_MOTOR_CENTER.x} cy={STEADY_MOTOR_CENTER.y} r="78" className="figure34-coil-track" />
        <path d="M 220 134 A 76 76 0 0 0 206 204" className="steady-book-inner-arrow" markerEnd="url(#steady-motor-arrow)" />
        <path d="M 340 210 A 76 76 0 0 0 354 140" className="steady-book-inner-arrow" markerEnd="url(#steady-motor-arrow)" />
        <path d="M 238 172 A 42 42 0 0 1 322 172 L 306 188 A 24 24 0 0 0 254 188 Z" className="figure34-commutator-segment" />
        <path d="M 322 172 A 42 42 0 0 1 238 172 L 254 156 A 24 24 0 0 0 306 156 Z" className="figure34-commutator-segment" />
      </g>
      <circle cx={STEADY_MOTOR_CENTER.x} cy={STEADY_MOTOR_CENTER.y} r="22" className="figure34-shaft" />
      <path d={`M ${STEADY_MOTOR_CENTER.x} ${STEADY_MOTOR_CENTER.y} L ${sideA.x} ${sideA.y}`} className="figure34-spoke" />
      <path d={`M ${STEADY_MOTOR_CENTER.x} ${STEADY_MOTOR_CENTER.y} L ${sideB.x} ${sideB.y}`} className="figure34-spoke" />
      <BookCurrentMark point={sideA} out={!positiveCurrent} />
      <BookCurrentMark point={sideB} out={positiveCurrent} />

      <path
        d={running ? "M 180 98 A 112 112 0 0 0 184 246" : "M 180 98 A 112 112 0 0 0 184 246"}
        className="steady-book-torque-arrow"
        markerEnd="url(#steady-motor-arrow)"
      />
      <text x="154" y="78" className="steady-book-symbol">ω</text>
      <text x="395" y="96" className="steady-book-symbol">T<tspan baselineShift="sub" fontSize="13">e</tspan></text>
      <text x="280" y="308" textAnchor="middle" className="book-circuit-caption">直流电机稳态工作模型</text>
    </svg>
  );
}

function BookWorkPointPlot({ points, marker }: { points: Array<[number, number]>; marker: [number, number] }) {
  const maxX = Math.max(...points.map(([x]) => x), marker[0], 1);
  const maxY = Math.max(...points.map(([, y]) => y), marker[1], 1);
  const plot = {
    left: 70,
    right: 492,
    top: 42,
    bottom: 286
  };
  const scaleX = (value: number) => plot.left + (value / maxX) * (plot.right - plot.left);
  const scaleY = (value: number) => plot.bottom - (value / maxY) * (plot.bottom - plot.top);
  const path = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${scaleX(x)} ${scaleY(y)}`)
    .join(" ");
  const markerX = scaleX(marker[0]);
  const markerY = scaleY(marker[1]);

  return (
    <svg className="steady-book-plot-svg" viewBox="0 0 560 330" role="img" aria-label="稳态工作点曲线线稿">
      <defs>
        <marker id="steady-plot-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="book-circuit-arrow-head" />
        </marker>
      </defs>

      <path d={`M ${plot.left} ${plot.bottom} H ${plot.right}`} className="steady-book-axis" markerEnd="url(#steady-plot-arrow)" />
      <path d={`M ${plot.left} ${plot.bottom} V ${plot.top}`} className="steady-book-axis" markerEnd="url(#steady-plot-arrow)" />
      <path d={path} className="steady-book-curve" />
      <path d={`M ${markerX} ${plot.bottom} V ${markerY} H ${plot.left}`} className="steady-book-guide" />
      <circle cx={markerX} cy={markerY} r="5.5" className="steady-book-plot-marker" />

      <text x={plot.left - 8} y={plot.bottom + 22} textAnchor="end" className="steady-book-tick">0</text>
      <text x={plot.left - 8} y={markerY + 5} textAnchor="end" className="steady-book-tick">{formatNumber(marker[1], 0)}</text>
      <text x={markerX} y={plot.bottom + 24} textAnchor="middle" className="steady-book-tick">{formatNumber(marker[0], 0)}</text>
      <text x={plot.left - 44} y={plot.top + 2} className="steady-book-symbol">ω</text>
      <text x={plot.right - 12} y={plot.bottom + 34} textAnchor="end" className="steady-book-symbol">T<tspan baselineShift="sub" fontSize="13">L</tspan></text>
      <text x="280" y="318" textAnchor="middle" className="book-circuit-caption">稳态转矩-转速工作点曲线</text>
    </svg>
  );
}

function Plot({
  points,
  marker
}: {
  points: Array<[number, number]>;
  marker?: [number, number];
  xLabel?: string;
  yLabel?: string;
  color?: string;
  label?: string;
}) {
  return <BookWorkPointPlot points={points} marker={marker ?? points[0] ?? [0, 0]} />;
}

function BookVoltageChain({
  emf,
  voltageDrop,
  dropRatio
}: {
  emf: number;
  voltageDrop: number;
  dropRatio: number;
}) {
  const barX = 58;
  const barY = 62;
  const barWidth = 404;
  const splitX = barX + barWidth * (1 - dropRatio);
  const nodes = [
    ["T_L↑", "负载"],
    ["I↑", "电流"],
    ["IR↑", "压降"],
    ["E↓", "反电动势"],
    ["ω↓", "转速"]
  ];

  return (
    <svg className="steady-book-chain-svg" viewBox="0 0 520 210" role="img" aria-label="稳态负载变化的电压分配和因果链线稿">
      <defs>
        <marker id="steady-chain-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="book-circuit-arrow-head" />
        </marker>
      </defs>

      <rect x="16" y="16" width="488" height="178" rx="4" className="steady-book-chain-panel" />
      <text x="260" y="42" textAnchor="middle" className="steady-book-chain-title">电压分配：V = E + IR</text>

      <rect x={barX} y={barY} width={barWidth} height="22" className="steady-book-voltage-bar" />
      <line x1={splitX} y1={barY} x2={splitX} y2={barY + 22} className="steady-book-voltage-split" />
      <path d={`M ${barX} 92 H ${splitX}`} className="steady-book-voltage-guide" />
      <path d={`M ${splitX} 92 H ${barX + barWidth}`} className="steady-book-voltage-guide steady-book-voltage-guide--drop" />
      <text x={barX} y="116" className="steady-book-chain-label">E {formatNumber(emf, 0)}V</text>
      <text x={splitX + 10} y="116" className="steady-book-chain-label">IR {formatNumber(voltageDrop, 0)}V</text>

      {nodes.map(([top, bottom], index) => {
        const x = 42 + index * 92;
        const y = 136;
        const width = 66;
        const height = 38;
        const centerY = y + height / 2;

        return (
          <g key={top}>
            <rect x={x} y={y} width={width} height={height} rx="3" className="steady-book-chain-node" />
            <text x={x + width / 2} y={y + 16} textAnchor="middle" className="steady-book-chain-node-text">{top}</text>
            <text x={x + width / 2} y={y + 31} textAnchor="middle" className="steady-book-chain-node-subtext">{bottom}</text>
            {index < nodes.length - 1 ? (
              <line x1={x + width + 8} y1={centerY} x2={x + 86} y2={centerY} className="steady-book-chain-arrow" markerEnd="url(#steady-chain-arrow)" />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export default function SteadyStateCurveDemo() {
  const [playing, setPlaying] = useState(true);
  const [V, setV] = useState(240);
  const [R, setR] = useState(2);
  const [k, setK] = useState(1.4);
  const [loadTorque, setLoadTorque] = useState(45);
  const { time, reset } = useDemoClock(playing, 1);

  const omega = Math.max(0, steadySpeed(V, k, R, loadTorque));
  const current = loadTorque / k;
  const E = backEmf(k, omega);
  const voltageDrop = current * R;
  const dropRatio = clamp(voltageDrop / Math.max(V, 1), 0, 1);
  const points: Array<[number, number]> = Array.from({ length: 50 }, (_, index) => {
    const t = (index / 49) * 140;
    return [t, Math.max(0, steadySpeed(V, k, R, t))];
  });

  return (
    <DemoFrame
      status="负载增加：I 上升，IR 压降变大，E 与转速下降"
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => {
        reset();
        setV(240);
        setR(2);
        setK(1.4);
        setLoadTorque(45);
      }}
      actions={<button type="button" className="pill-button" onClick={() => setLoadTorque((value) => Math.min(140, value + 20))}>负载增加</button>}
      sliders={[
        { label: "电枢电压", symbol: "V", value: V, min: 80, max: 360, step: 10, unit: "V", onChange: setV },
        { label: "电枢电阻", symbol: "R", value: R, min: 0.5, max: 8, step: 0.1, unit: "Ω", onChange: setR },
        { label: "电机常数", symbol: "k", value: k, min: 0.5, max: 3, step: 0.1, unit: "", onChange: setK },
        { label: "负载转矩", symbol: "TL", value: loadTorque, min: 0, max: 140, step: 5, unit: "N·m", onChange: setLoadTorque }
      ]}
      readouts={
        <>
          <Readout label="I=TL/k" value={current} unit="A" tone="red" />
          <Readout label="IR" value={voltageDrop} unit="V" tone="amber" />
          <Readout label="E=V-IR" value={E} unit="V" tone="purple" />
          <Readout label="ω" value={omega} unit="rad/s" tone="green" />
        </>
      }
    >
      <div className="demo-split">
        <div className="mechanism-stack">
          <BookSteadyMotor angle={-time * Math.max(12, omega * 0.12)} current={current} omega={omega} />
          <BookVoltageChain emf={E} voltageDrop={voltageDrop} dropRatio={dropRatio} />
          <svg className="steady-cause-svg" viewBox="0 0 520 210" role="img" aria-label="稳态负载变化的电压分配和因果链">
            <ArrowDefs />
            <rect x="16" y="16" width="488" height="178" rx="20" fill="#ffffff" stroke="var(--border)" />
            <text x="260" y="44" textAnchor="middle" className="svg-axis-label">电压分配：V = E + IR</text>
            <line x1="62" y1="78" x2="458" y2="78" stroke="#dbeafe" strokeWidth="18" strokeLinecap="round" />
            <line x1="62" y1="78" x2={62 + 396 * (1 - dropRatio)} y2="78" stroke="var(--purple)" strokeWidth="18" strokeLinecap="round" />
            <line x1={62 + 396 * (1 - dropRatio)} y1="78" x2="458" y2="78" stroke="var(--amber)" strokeWidth="18" strokeLinecap="round" />
            <text x="62" y="110" className="legend legend--omega">E {formatNumber(E, 0)}V</text>
            <text x="344" y="110" className="legend legend--load">IR {formatNumber(voltageDrop, 0)}V</text>
            {[
              ["TL↑", "负载"],
              ["I↑", "电流"],
              ["IR↑", "压降"],
              ["E↓", "反电动势"],
              ["ω↓", "转速"]
            ].map(([top, bottom], index) => (
              <g key={top} transform={`translate(${44 + index * 92} 132)`}>
                <rect width="66" height="42" rx="12" className="chain-node is-active" />
                <text x="33" y="21" textAnchor="middle" className="chain-text">{top}</text>
                <text x="33" y="35" textAnchor="middle" className="chain-text">{bottom}</text>
                {index < 4 ? <line x1="70" y1="21" x2="86" y2="21" className="chain-arrow is-active" markerEnd="url(#arrow-green)" /> : null}
              </g>
            ))}
          </svg>
        </div>
        <Plot points={points} marker={[loadTorque, omega]} xLabel="TL" yLabel="ω" color="green" label="稳态工作点记录曲线" />
      </div>
    </DemoFrame>
  );
}
