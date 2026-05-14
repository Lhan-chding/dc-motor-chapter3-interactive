import { useState } from "react";
import { formatNumber } from "../utils/format";
import { DemoFrame, Readout, useDemoClock } from "./shared";

type Point = {
  x: number;
  y: number;
};

const MOTOR_CENTER: Point = { x: 240, y: 166 };
const SPEED_AXIS_MAX = 800;
const TORQUE_AXIS_MAX = 360;
const POWER_AXIS_MAX = 60000;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function polar(center: Point, radius: number, angleDeg: number): Point {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius
  };
}

function graphX(origin: number, width: number, value: number, axisMax: number) {
  return origin + clamp(value / axisMax, 0, 1) * width;
}

function graphY(bottom: number, top: number, value: number, axisMax: number) {
  return bottom - clamp(value / axisMax, 0, 1) * (bottom - top);
}

function BookWeakFieldMotor({ angle, phi }: { angle: number; phi: number }) {
  const fluxOpacity = clamp(phi / 1.2, 0.24, 1);
  const rotorA = polar(MOTOR_CENTER, 74, 132 + angle);
  const rotorB = polar(MOTOR_CENTER, 74, 312 + angle);

  return (
    <g aria-label="弱磁直流电机线稿示意">
      <defs>
        <marker id="weak-motor-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="book-circuit-arrow-head" />
        </marker>
      </defs>

      <text x="240" y="42" textAnchor="middle" className="weak-field-heading">直流电机核心结构</text>
      <rect x="42" y="104" width="396" height="122" className="role-field" />
      <text x="90" y="178" className="figure34-pole">N</text>
      <text x="374" y="178" className="figure34-pole">S</text>

      {[126, 160, 194].map((y) => (
        <path key={y} d={`M 136 ${y} H 344`} className="weak-field-flux" markerEnd="url(#weak-motor-arrow)" opacity={fluxOpacity} />
      ))}

      <circle cx={MOTOR_CENTER.x} cy={MOTOR_CENTER.y} r="98" className="figure34-airgap" />
      <g transform={`rotate(${angle} ${MOTOR_CENTER.x} ${MOTOR_CENTER.y})`}>
        <circle cx={MOTOR_CENTER.x} cy={MOTOR_CENTER.y} r="74" className="figure34-coil-track" />
        <path d="M 188 130 A 72 72 0 0 0 174 190" className="steady-book-inner-arrow" markerEnd="url(#weak-motor-arrow)" />
        <path d="M 292 202 A 72 72 0 0 0 306 142" className="steady-book-inner-arrow" markerEnd="url(#weak-motor-arrow)" />
        <path d="M 204 166 A 36 36 0 0 1 276 166 L 262 180 A 20 20 0 0 0 218 180 Z" className="figure34-commutator-segment" />
        <path d="M 276 166 A 36 36 0 0 1 204 166 L 218 152 A 20 20 0 0 0 262 152 Z" className="figure34-commutator-segment" />
      </g>

      <circle cx={MOTOR_CENTER.x} cy={MOTOR_CENTER.y} r="21" className="figure34-shaft" />
      <path d={`M ${MOTOR_CENTER.x} ${MOTOR_CENTER.y} L ${rotorA.x} ${rotorA.y}`} className="figure34-spoke" />
      <path d={`M ${MOTOR_CENTER.x} ${MOTOR_CENTER.y} L ${rotorB.x} ${rotorB.y}`} className="figure34-spoke" />
      <path d="M 160 230 A 114 114 0 0 1 154 80" className="steady-book-torque-arrow" markerEnd="url(#weak-motor-arrow)" />

      <text x="136" y="80" className="steady-book-symbol">n</text>
      <text x="322" y="78" className="steady-book-symbol">Φ</text>
      <text x="346" y="78" className="weak-field-note">减小</text>
      <text x="240" y="294" textAnchor="middle" className="book-circuit-caption">电压到上限后，减小 Φ 才能继续升速</text>
    </g>
  );
}

function BookWeakFieldFigure({
  angle,
  phi,
  ratedSpeed,
  maxSpeed,
  ratedTorque,
  maxTorque,
  maxPower,
  vmax,
  imax,
  k
}: {
  angle: number;
  phi: number;
  ratedSpeed: number;
  maxSpeed: number;
  ratedTorque: number;
  maxTorque: number;
  maxPower: number;
  vmax: number;
  imax: number;
  k: number;
}) {
  const graph = {
    x: 524,
    torqueY: 68,
    powerY: 312,
    width: 440,
    torqueHeight: 172,
    powerHeight: 140
  };
  const ratedX = graphX(graph.x, graph.width, ratedSpeed, SPEED_AXIS_MAX);
  const pointX = graphX(graph.x, graph.width, maxSpeed, SPEED_AXIS_MAX);
  const torqueTop = graph.torqueY + 22;
  const torqueBase = graph.torqueY + graph.torqueHeight;
  const powerTop = graph.powerY + 24;
  const powerBase = graph.powerY + graph.powerHeight;
  const ratedTorqueY = graphY(torqueBase, torqueTop, ratedTorque, TORQUE_AXIS_MAX);
  const torquePointY = graphY(torqueBase, torqueTop, maxTorque, TORQUE_AXIS_MAX);
  const powerPointY = graphY(powerBase, powerTop, maxPower, POWER_AXIS_MAX);
  const areaRightEnd = graph.x + graph.width;
  const torqueAtAxisEnd = Math.min(ratedTorque, maxPower / SPEED_AXIS_MAX);
  const curveEndY = graphY(torqueBase, torqueTop, torqueAtAxisEnd, TORQUE_AXIS_MAX);
  const weakCurve = `M ${ratedX} ${ratedTorqueY} C ${ratedX + 66} ${ratedTorqueY + 22}, ${areaRightEnd - 116} ${curveEndY - 12}, ${areaRightEnd} ${curveEndY}`;
  const weakArea = `M ${ratedX} ${ratedTorqueY} C ${ratedX + 66} ${ratedTorqueY + 22}, ${areaRightEnd - 116} ${curveEndY - 12}, ${areaRightEnd} ${curveEndY} L ${areaRightEnd} ${torqueBase} H ${ratedX} Z`;
  const showWeakPoint = phi < 0.98;
  const outOfRange = maxSpeed > SPEED_AXIS_MAX;

  return (
    <svg className="weak-field-book-svg" viewBox="0 0 1040 560" role="img" aria-label="额定转速和弱磁连续运行区线稿图">
      <defs>
        <marker id="weak-plot-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="book-circuit-arrow-head" />
        </marker>
      </defs>

      <BookWeakFieldMotor angle={angle} phi={phi} />

      <g aria-label="弱磁参数变化">
        <rect x="40" y="340" width="404" height="150" rx="5" className="weak-field-panel" />
        <text x="242" y="369" textAnchor="middle" className="weak-field-small">V 已到上限，只能减小 Φ 升速</text>
        {[
          ["Φ", clamp(phi / 1.2, 0, 1), "磁通"],
          ["nmax", clamp(maxSpeed / SPEED_AXIS_MAX, 0, 1), "最高转速"],
          ["Tmax", clamp(maxTorque / TORQUE_AXIS_MAX, 0, 1), "最大转矩"]
        ].map(([label, ratio, desc], index) => (
          <g key={label as string} transform={`translate(74 ${392 + index * 30})`}>
            <text x="0" y="14" className="weak-field-small">{label as string}</text>
            <rect x="74" y="2" width="210" height="14" className="weak-field-bar-bg" />
            <rect x="74" y="2" width={210 * (ratio as number)} height="14" className="weak-field-bar-fill" />
            <text x="304" y="14" className="weak-field-small">{desc as string}</text>
          </g>
        ))}
        <text x="242" y="476" textAnchor="middle" className="weak-field-formula">Φ↓ → nmax↑，Tmax↓</text>
      </g>

      <g aria-label="转矩转速连续运行区">
        <path d={`M ${graph.x} ${torqueBase} H ${graph.x + graph.width + 24}`} className="weak-field-axis" markerEnd="url(#weak-plot-arrow)" />
        <path d={`M ${graph.x} ${torqueBase} V ${graph.torqueY}`} className="weak-field-axis" markerEnd="url(#weak-plot-arrow)" />
        <text x={graph.x - 44} y={graph.torqueY + 8} className="weak-field-axis-label">转矩</text>
        <text x={graph.x + graph.width + 4} y={torqueBase + 24} className="weak-field-axis-label">转速</text>
        <rect x={graph.x} y={ratedTorqueY} width={ratedX - graph.x} height={torqueBase - ratedTorqueY} className="weak-field-shade" />
        <path d={weakArea} className="weak-field-shade weak-field-shade--light" />
        <path d={`M ${graph.x} ${ratedTorqueY} H ${ratedX}`} className="weak-field-curve" />
        <path d={weakCurve} className="weak-field-curve" />
        <path d={`M ${ratedX} ${graph.torqueY - 10} V ${torqueBase + 6}`} className="weak-field-guide" />
        {showWeakPoint ? <path d={`M ${pointX} ${torquePointY} V ${torqueBase + 6}`} className="weak-field-guide weak-field-guide--live" /> : null}
        <circle cx={graph.x} cy={ratedTorqueY} r="4" className="weak-field-point" />
        <circle cx={ratedX} cy={ratedTorqueY} r="4" className="weak-field-point" />
        <circle cx={ratedX} cy={torqueBase} r="4" className="weak-field-point" />
        <text x={graph.x - 14} y={ratedTorqueY - 8} className="weak-field-small">a</text>
        <text x={ratedX - 6} y={ratedTorqueY - 12} className="weak-field-small">b</text>
        <text x={ratedX - 6} y={torqueBase + 20} className="weak-field-small">c</text>
        {showWeakPoint ? <text x={pointX + 14} y={torquePointY - 13} className="weak-field-small">{outOfRange ? "限速" : "e"}</text> : null}
        <rect x={graph.x + 28} y={torqueBase - 32} width="78" height="23" rx="3" className="weak-field-label-bg" />
        <text x={graph.x + 67} y={torqueBase - 16} textAnchor="middle" className="weak-field-area-label">恒转矩区</text>
        <rect x={graph.x + graph.width - 132} y={torqueTop + 16} width="74" height="23" rx="3" className="weak-field-label-bg" />
        <text x={graph.x + graph.width - 95} y={torqueTop + 32} textAnchor="middle" className="weak-field-area-label">弱磁区</text>
        <path d={`M ${ratedX + 92} ${ratedTorqueY + 50} L ${ratedX + 28} ${ratedTorqueY + 20}`} className="weak-field-callout" markerEnd="url(#weak-plot-arrow)" />
        <rect x={ratedX + 94} y={ratedTorqueY + 27} width="68" height="22" rx="3" className="weak-field-label-bg" />
        <text x={ratedX + 128} y={ratedTorqueY + 43} textAnchor="middle" className="weak-field-small">额定转速</text>
        {showWeakPoint ? <circle cx={pointX} cy={torquePointY} r="7" className="weak-field-point weak-field-point--live" /> : null}
      </g>

      <g aria-label="功率转速连续运行区">
        <path d={`M ${graph.x} ${powerBase} H ${graph.x + graph.width + 24}`} className="weak-field-axis" markerEnd="url(#weak-plot-arrow)" />
        <path d={`M ${graph.x} ${powerBase} V ${graph.powerY}`} className="weak-field-axis" markerEnd="url(#weak-plot-arrow)" />
        <text x={graph.x - 44} y={graph.powerY + 8} className="weak-field-axis-label">功率</text>
        <text x={graph.x + graph.width + 4} y={powerBase + 24} className="weak-field-axis-label">转速</text>
        <path d={`M ${graph.x} ${powerBase} L ${ratedX} ${powerPointY} H ${graph.x + graph.width}`} className="weak-field-curve" />
        <path d={`M ${ratedX} ${powerPointY - 8} V ${powerBase + 6}`} className="weak-field-guide" />
        {showWeakPoint ? <path d={`M ${pointX} ${powerPointY} V ${powerBase + 6}`} className="weak-field-guide weak-field-guide--live" /> : null}
        <circle cx={ratedX} cy={powerPointY} r="5" className="weak-field-point" />
        {showWeakPoint ? <circle cx={pointX} cy={powerPointY} r="7" className="weak-field-point weak-field-point--live" /> : null}
        <text x={graph.x - 28} y={powerPointY + 4} className="weak-field-small">{formatNumber(maxPower / 1000, 0)}kW</text>
        <text x={ratedX - 8} y={powerPointY - 12} className="weak-field-small">b′</text>
        {showWeakPoint ? <text x={pointX + 12} y={powerPointY - 8} className="weak-field-small">e′</text> : null}
        <text x={graph.x + 228} y={powerBase + 38} textAnchor="middle" className="weak-field-caption">
          图 3.10  转矩-转速平面和功率-转速平面中的连续运行区
        </text>
      </g>

      <text x="40" y="532" className="weak-field-footnote">Vmax {formatNumber(vmax, 0)}V，Imax {formatNumber(imax, 0)}A，k {formatNumber(k, 2)}：拖动滑块会移动额定线、弱磁点和功率平台。</text>
    </svg>
  );
}

export default function WeakFieldDemo() {
  const [playing, setPlaying] = useState(true);
  const [vmax, setVmax] = useState(300);
  const [imax, setImax] = useState(80);
  const [phi, setPhi] = useState(1);
  const [k, setK] = useState(1.6);
  const { time, reset } = useDemoClock(playing, 1);

  const safePhi = Math.max(phi, 0.08);
  const ratedSpeed = vmax / k;
  const baseSpeed = vmax / (k * safePhi);
  const speedGain = baseSpeed / Math.max(ratedSpeed, 1e-6);
  const maxTorque = k * phi * imax;
  const ratedTorque = k * imax;
  const maxPower = vmax * imax;

  return (
    <DemoFrame
      status={phi < 0.7 ? "弱磁：最高转速升高，但最大转矩下降" : "额定磁通：低速恒转矩，高速受电压限制"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => {
        reset();
        setVmax(300);
        setImax(80);
        setPhi(1);
        setK(1.6);
      }}
      actions={
        <div className="segmented">
          <button type="button" className={phi >= 0.9 ? "is-active" : ""} onClick={() => setPhi(1)}>额定磁通</button>
          <button type="button" className={phi < 0.7 ? "is-active" : ""} onClick={() => setPhi(0.55)}>进入弱磁</button>
        </div>
      }
      sliders={[
        { label: "最大电压", symbol: "Vmax", value: vmax, min: 120, max: 500, step: 10, unit: "V", onChange: setVmax },
        { label: "最大电流", symbol: "Imax", value: imax, min: 20, max: 160, step: 5, unit: "A", onChange: setImax },
        { label: "磁通", symbol: "Φ", value: phi, min: 0.25, max: 1.2, step: 0.05, unit: "Wb", onChange: setPhi },
        { label: "电机常数", symbol: "k", value: k, min: 0.8, max: 3, step: 0.1, unit: "", onChange: setK }
      ]}
      readouts={
        <>
          <Readout label="最高转速" value={baseSpeed} unit="rad/s" tone="green" />
          <Readout label="最大转矩" value={maxTorque} unit="N·m" tone="amber" />
          <Readout label="升速倍数" value={speedGain} unit="x" tone="purple" />
        </>
      }
    >
      <BookWeakFieldFigure
        angle={time * Math.max(28, 72 * speedGain)}
        phi={phi}
        ratedSpeed={ratedSpeed}
        maxSpeed={baseSpeed}
        ratedTorque={ratedTorque}
        maxTorque={maxTorque}
        maxPower={maxPower}
        vmax={vmax}
        imax={imax}
        k={k}
      />
    </DemoFrame>
  );
}
