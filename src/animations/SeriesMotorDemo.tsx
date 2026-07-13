import { useMemo, useState } from "react";
import { seriesMotorOperatingPoint } from "../utils/advancedMotorMath";
import { formatNumber } from "../utils/format";
import { DemoFrame, Readout, useDemoClock } from "./shared";

const MODEL = { machineConstant: 1.1, fieldConstant: 0.055, saturationFlux: 0.8 } as const;
const LOAD_MIN = 2;
const LOAD_MAX = 60;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pathFrom(points: Array<[number, number]>) {
  return points.map(([x, y], index) => `${index ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

export default function SeriesMotorDemo() {
  const [playing, setPlaying] = useState(true);
  const [voltage, setVoltage] = useState(220);
  const [resistance, setResistance] = useState(1.8);
  const [loadTorque, setLoadTorque] = useState(45);
  const { time, reset } = useDemoClock(playing, 1);
  const solve = (torque: number) => seriesMotorOperatingPoint({
    voltage, totalResistance: resistance, loadTorque: torque, ...MODEL
  });
  const point = solve(loadTorque);
  const curve = useMemo(() => Array.from({ length: 80 }, (_, index) => {
    const torque = LOAD_MIN + (index / 79) * (LOAD_MAX - LOAD_MIN);
    return { torque, state: solve(torque) };
  }), [resistance, voltage]);
  const speedMax = Math.max(...curve.map(({ state }) => Math.max(0, state.omega))) * 1.06;
  const xScale = (torque: number) => 704 + ((torque - LOAD_MIN) / (LOAD_MAX - LOAD_MIN)) * 254;
  const yScale = (speed: number) => 460 - (clamp(speed, 0, speedMax) / speedMax) * 310;
  const pointX = xScale(loadTorque);
  const pointY = yScale(point.omega);
  const rotorAngle = time * clamp(point.omega, 8, 420) * 0.45;

  return (
    <DemoFrame
      status={point.noLoadRisk ? "负载减小使 I、Φ 同时减小，E=kΦω 迫使转速急升，串励电机禁止空载" : "串励绕组与电枢通过同一电流：I 增大，Φ 与 T=kΦI 同时增大"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => { reset(); setPlaying(true); setVoltage(220); setResistance(1.8); setLoadTorque(45); }}
      actions={<div className="segmented"><button type="button" className={loadTorque <= 8 ? "is-active" : ""} onClick={() => setLoadTorque(5)}>近空载</button><button type="button" className={loadTorque >= 45 ? "is-active" : ""} onClick={() => setLoadTorque(55)}>重载</button></div>}
      sliders={[
        { label: "端电压", symbol: "V", value: voltage, min: 160, max: 300, step: 10, unit: "V", onChange: setVoltage },
        { label: "回路总电阻", symbol: "RΣ", value: resistance, min: 0.8, max: 2.2, step: 0.2, unit: "Ω", onChange: setResistance },
        { label: "负载转矩", symbol: "TL", value: loadTorque, min: LOAD_MIN, max: LOAD_MAX, step: 1, unit: "N·m", onChange: setLoadTorque }
      ]}
      readouts={<><Readout label="I" value={point.current} unit="A" tone="red" /><Readout label="Φ" value={point.flux} unit="Wb" tone="blue" /><Readout label="E" value={point.emf} unit="V" tone="purple" /><Readout label="ω" value={point.omega} unit="rad/s" tone={point.noLoadRisk ? "amber" : "green"} /></>}
    >
      <svg className="series-demo-svg advanced-book-svg" viewBox="0 0 1040 600" role="img" aria-label="串励电动机电路、因果过程和实时运行点">
        <defs><marker id="series-book-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" className="book-arrow-head" /></marker></defs>
        <rect x="24" y="24" width="992" height="552" rx="8" className="book-figure-panel" />
        <text x="520" y="58" textAnchor="middle" className="book-title">串励直流电动机：结构决定机械特性</text>

        <g aria-label="串励电路">
          <rect x="46" y="82" width="300" height="454" rx="6" className="book-subpanel" />
          <text x="196" y="116" textAnchor="middle" className="book-caption">电路图</text>
          <path d="M 84 184 H 136" className="book-axis" /><path d="M 136 184 c 10 -23 24 -23 34 0 s 24 23 34 0 s 24 -23 34 0" className="book-axis" />
          <path d="M 238 184 H 250" className="book-axis" /><circle cx="284" cy="184" r="34" className="book-point" /><text x="284" y="191" textAnchor="middle" className="book-equation">M</text>
          <path d="M 318 184 V 292 H 84" className="book-axis" /><line x1="84" y1="174" x2="84" y2="226" className="book-axis" /><line x1="70" y1="226" x2="98" y2="226" className="book-axis" /><line x1="76" y1="244" x2="92" y2="244" className="book-axis" /><path d="M 84 244 V 292" className="book-axis" />
          <path d="M 102 154 H 238" className="book-running-guide" markerEnd="url(#series-book-arrow)" /><text x="166" y="145" textAnchor="middle" className="book-equation">I={formatNumber(point.current, 1)} A</text>
          <text x="186" y="214" textAnchor="middle" className="book-small">串励绕组 Φ(I)</text><text x="58" y="238" textAnchor="end" className="book-small">{formatNumber(voltage, 0)} V</text><text x="284" y="232" textAnchor="middle" className="book-small">E={formatNumber(point.emf, 0)} V</text>
          <g transform={`translate(196 366) rotate(${rotorAngle})`}><circle r="54" className="book-point" /><line x1="0" y1="0" x2="0" y2="-42" className="book-axis" markerEnd="url(#series-book-arrow)" /><circle r="5" className="book-live-point" /></g>
          <path d="M 126 430 A 82 82 0 0 0 260 430" className="book-running-guide" markerEnd="url(#series-book-arrow)" /><text x="196" y="468" textAnchor="middle" className="book-equation">ω={formatNumber(point.omega, 0)} rad/s</text><text x="196" y="500" textAnchor="middle" className="book-small">励磁与电枢无分流，电流完全相同</text>
        </g>

        <g aria-label="串励因果过程">
          <rect x="366" y="82" width="292" height="454" rx="6" className="book-subpanel" /><text x="512" y="116" textAnchor="middle" className="book-caption">因果过程</text>
          {[
            [`TL=${formatNumber(loadTorque, 0)} N·m`, "稳态 Te=TL"],
            [`I=${formatNumber(point.current, 1)} A`, "同流过磁场与电枢"],
            [`Φ=${formatNumber(point.flux, 2)} Wb`, point.saturated ? "磁路接近饱和" : "Φ 随 I 增大"],
            [`T=kΦI=${formatNumber(point.electromagneticTorque, 0)}`, "低电流区近似 I²"],
            [`E=V-IR=${formatNumber(point.emf, 0)} V`, "E=kΦω 决定转速"]
          ].map(([formula, note], index) => <g key={formula} transform={`translate(394 ${140 + index * 72})`}><rect width="236" height="48" rx="4" className={index === 4 && point.noLoadRisk ? "book-stage is-active" : "book-stage"} /><text x="118" y="20" textAnchor="middle" className="book-equation">{formula}</text><text x="118" y="39" textAnchor="middle" className="book-small">{note}</text>{index < 4 ? <line x1="118" y1="49" x2="118" y2="68" className="book-running-guide" markerEnd="url(#series-book-arrow)" /> : null}</g>)}
          <text x="512" y="516" textAnchor="middle" className="book-note">{point.noLoadRisk ? "小 TL -> 小 Φ -> 高 ω" : "负载决定当前稳态电流"}</text>
        </g>

        <g aria-label="串励转矩转速运行点">
          <rect x="678" y="82" width="316" height="454" rx="6" className="book-subpanel" /><text x="836" y="116" textAnchor="middle" className="book-caption">机械特性与运行点</text>
          <line x1="704" y1="460" x2="970" y2="460" className="book-axis" markerEnd="url(#series-book-arrow)" /><line x1="704" y1="470" x2="704" y2="136" className="book-axis" markerEnd="url(#series-book-arrow)" />
          <path d={pathFrom(curve.map(({ torque, state }) => [xScale(torque), yScale(state.omega)]))} className="book-speed-curve" />
          <line x1={pointX} y1="460" x2={pointX} y2={pointY} className="book-running-guide" /><line x1="704" y1={pointY} x2={pointX} y2={pointY} className="book-running-guide" /><circle cx={pointX} cy={pointY} r="7" className="book-live-point" /><text x={Math.min(pointX + 12, 920)} y={Math.max(pointY - 12, 146)} className="book-small">运行点</text>
          <text x="970" y="490" textAnchor="end" className="book-axis-label">TL / N·m</text><text x="716" y="146" className="book-axis-label">ω</text><text x="704" y="484" textAnchor="middle" className="book-small">{LOAD_MIN}</text><text x="958" y="484" textAnchor="middle" className="book-small">{LOAD_MAX}</text><text x="716" y="518" className="book-note">V、RΣ、TL 共同确定运行点</text>
        </g>
      </svg>
    </DemoFrame>
  );
}
