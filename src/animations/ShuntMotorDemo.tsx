import { useMemo, useState } from "react";
import { formatNumber } from "../utils/format";
import { DemoFrame, Readout, useDemoClock } from "./shared";

const ARMATURE_RESISTANCE = 0.55;
const MACHINE_CONSTANT = 1.2;
const SATURATION_FLUX = 0.9;
const FIELD_CONSTANT = 0.5;
const LOAD_MAX = 80;

function shuntOperatingPoint(voltage: number, fieldResistance: number, loadTorque: number) {
  const fieldCurrent = voltage / fieldResistance;
  const flux = SATURATION_FLUX * Math.tanh((FIELD_CONSTANT * fieldCurrent) / SATURATION_FLUX);
  const armatureCurrent = loadTorque / (MACHINE_CONSTANT * flux);
  const emf = voltage - armatureCurrent * ARMATURE_RESISTANCE;
  const omega = Math.max(0, emf / (MACHINE_CONSTANT * flux));
  return { fieldCurrent, flux, armatureCurrent, emf, omega };
}

function pathFrom(points: Array<[number, number]>) {
  return points.map(([x, y], index) => `${index ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

export default function ShuntMotorDemo() {
  const [playing, setPlaying] = useState(true);
  const [voltage, setVoltage] = useState(220);
  const [fieldResistance, setFieldResistance] = useState(110);
  const [loadTorque, setLoadTorque] = useState(35);
  const { time, reset } = useDemoClock(playing, 1);
  const point = shuntOperatingPoint(voltage, fieldResistance, loadTorque);
  const lineCurrent = point.fieldCurrent + point.armatureCurrent;
  const curve = useMemo(() => Array.from({ length: 81 }, (_, index) => {
    const torque = index;
    return { torque, state: shuntOperatingPoint(voltage, fieldResistance, torque) };
  }), [fieldResistance, voltage]);
  const speedMax = Math.max(...curve.map(({ state }) => state.omega)) * 1.05;
  const xScale = (torque: number) => 704 + (torque / LOAD_MAX) * 254;
  const yScale = (speed: number) => 460 - (speed / speedMax) * 310;
  const pointX = xScale(loadTorque);
  const pointY = yScale(point.omega);
  const rotorAngle = time * Math.max(18, point.omega * 0.5);

  return (
    <DemoFrame
      status="并励绕组跨接电源，If 与负载支路分开；负载增大主要使 Ia 与 IaRa 压降增大，转速仅缓降"
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => { reset(); setPlaying(true); setVoltage(220); setFieldResistance(110); setLoadTorque(35); }}
      actions={<div className="segmented"><button type="button" onClick={() => setLoadTorque((value) => Math.min(LOAD_MAX, value + 15))}>加负载</button><button type="button" onClick={() => setFieldResistance((value) => Math.min(220, value + 25))}>弱磁</button></div>}
      sliders={[
        { label: "端电压", symbol: "V", value: voltage, min: 160, max: 300, step: 10, unit: "V", onChange: setVoltage },
        { label: "励磁电阻", symbol: "Rf", value: fieldResistance, min: 70, max: 220, step: 5, unit: "Ω", onChange: setFieldResistance },
        { label: "负载转矩", symbol: "TL", value: loadTorque, min: 0, max: LOAD_MAX, step: 5, unit: "N·m", onChange: setLoadTorque }
      ]}
      readouts={<><Readout label="If" value={point.fieldCurrent} unit="A" tone="blue" /><Readout label="Ia" value={point.armatureCurrent} unit="A" tone="red" /><Readout label="Φ" value={point.flux} unit="Wb" tone="purple" /><Readout label="ω" value={point.omega} unit="rad/s" tone="green" /></>}
    >
      <svg className="four-quadrant-book-svg advanced-book-svg" viewBox="0 0 1040 600" role="img" aria-label="并励电动机电路、因果过程和实时运行点">
        <defs><marker id="shunt-book-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" className="book-arrow-head" /></marker></defs>
        <rect x="24" y="24" width="992" height="552" rx="8" className="book-figure-panel" />
        <text x="520" y="58" textAnchor="middle" className="book-title">并励直流电动机：分支电流与近似恒速</text>

        <g aria-label="并励电路">
          <rect x="46" y="82" width="300" height="454" rx="6" className="book-subpanel" /><text x="196" y="116" textAnchor="middle" className="book-caption">电路图</text>
          <path d="M 88 168 H 302 M 88 300 H 302 M 88 168 V 300 M 302 168 V 300" className="book-axis" />
          <line x1="88" y1="194" x2="88" y2="226" className="book-axis" /><line x1="74" y1="226" x2="102" y2="226" className="book-axis" /><line x1="80" y1="244" x2="96" y2="244" className="book-axis" />
          <path d="M 136 168 V 196 l -12 8 l 24 12 l -24 12 l 24 12 l -12 8 V 300" className="book-axis" /><text x="116" y="244" textAnchor="end" className="book-small">Rf</text>
          <path d="M 248 168 V 210" className="book-axis" /><circle cx="248" cy="250" r="40" className="book-point" /><text x="248" y="256" textAnchor="middle" className="book-equation">M</text><path d="M 248 290 V 300" className="book-axis" />
          <path d="M 108 146 H 286" className="book-running-guide" markerEnd="url(#shunt-book-arrow)" /><text x="196" y="137" textAnchor="middle" className="book-small">I={formatNumber(lineCurrent, 1)} A</text>
          <path d="M 120 188 V 270" className="book-running-guide" markerEnd="url(#shunt-book-arrow)" /><text x="108" y="286" textAnchor="end" className="book-small">If={formatNumber(point.fieldCurrent, 2)} A</text>
          <path d="M 270 188 V 214" className="book-running-guide" markerEnd="url(#shunt-book-arrow)" /><text x="276" y="204" className="book-small">Ia={formatNumber(point.armatureCurrent, 1)} A</text>
          <text x="58" y="240" textAnchor="end" className="book-small">{formatNumber(voltage, 0)} V</text><text x="248" y="318" textAnchor="middle" className="book-small">E={formatNumber(point.emf, 0)} V</text>
          <g transform={`translate(196 404) rotate(${rotorAngle})`}><circle r="54" className="book-point" /><line y2="-42" className="book-axis" markerEnd="url(#shunt-book-arrow)" /><circle r="5" className="book-live-point" /></g>
          <text x="196" y="482" textAnchor="middle" className="book-equation">ω={formatNumber(point.omega, 0)} rad/s</text><text x="196" y="510" textAnchor="middle" className="book-small">If 由 V/Rf 决定，不等于 Ia</text>
        </g>

        <g aria-label="并励因果过程">
          <rect x="366" y="82" width="292" height="454" rx="6" className="book-subpanel" /><text x="512" y="116" textAnchor="middle" className="book-caption">因果过程</text>
          {[
            [`If=V/Rf=${formatNumber(point.fieldCurrent, 2)} A`, `Φ=${formatNumber(point.flux, 2)} Wb`],
            [`TL↑ -> Ia=${formatNumber(point.armatureCurrent, 1)} A`, "Te=kΦIa=TL"],
            [`IaRa=${formatNumber(point.armatureCurrent * ARMATURE_RESISTANCE, 1)} V`, `E=V-IaRa=${formatNumber(point.emf, 0)} V`],
            ["ω=E/(kΦ)", `${formatNumber(point.omega, 0)} rad/s`]
          ].map(([formula, note], index) => <g key={formula} transform={`translate(394 ${150 + index * 88})`}><rect width="236" height="56" rx="4" className="book-stage" /><text x="118" y="23" textAnchor="middle" className="book-equation">{formula}</text><text x="118" y="45" textAnchor="middle" className="book-small">{note}</text>{index < 3 ? <line x1="118" y1="57" x2="118" y2="83" className="book-running-guide" markerEnd="url(#shunt-book-arrow)" /> : null}</g>)}
          <text x="512" y="516" textAnchor="middle" className="book-note">弱磁时 Φ↓，同一负载所需 Ia↑ 且 ω↑</text>
        </g>

        <g aria-label="并励转矩转速运行点">
          <rect x="678" y="82" width="316" height="454" rx="6" className="book-subpanel" /><text x="836" y="116" textAnchor="middle" className="book-caption">机械特性与运行点</text>
          <line x1="704" y1="460" x2="970" y2="460" className="book-axis" markerEnd="url(#shunt-book-arrow)" /><line x1="704" y1="470" x2="704" y2="136" className="book-axis" markerEnd="url(#shunt-book-arrow)" />
          <path d={pathFrom(curve.map(({ torque, state }) => [xScale(torque), yScale(state.omega)]))} className="book-speed-curve" />
          <line x1={pointX} y1="460" x2={pointX} y2={pointY} className="book-running-guide" /><line x1="704" y1={pointY} x2={pointX} y2={pointY} className="book-running-guide" /><circle cx={pointX} cy={pointY} r="7" className="book-live-point" /><text x={Math.min(pointX + 12, 920)} y={pointY - 12} className="book-small">运行点</text>
          <text x="970" y="490" textAnchor="end" className="book-axis-label">TL / N·m</text><text x="716" y="146" className="book-axis-label">ω</text><text x="704" y="484" textAnchor="middle" className="book-small">0</text><text x="958" y="484" textAnchor="middle" className="book-small">{LOAD_MAX}</text><text x="716" y="518" className="book-note">Rf 改变时整条机械特性随 Φ 移动</text>
        </g>
      </svg>
    </DemoFrame>
  );
}
