import { useState } from "react";
import { backEmf, steadySpeed } from "../utils/motorMath";
import { formatNumber } from "../utils/format";
import { ArrowDefs, DemoFrame, MotorSketch, Plot, Readout, useDemoClock } from "./shared";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
          <MotorSketch angle={time * Math.max(12, omega * 0.12)} current={current} torque={loadTorque} phi={k / 1.4} />
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
