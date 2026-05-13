import { useState } from "react";
import { steadySpeed } from "../utils/motorMath";
import { ArrowDefs, DemoFrame, MotorSketch, Plot, Readout, useDemoClock } from "./shared";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function ShuntMotorDemo() {
  const [playing, setPlaying] = useState(true);
  const [V, setV] = useState(220);
  const [Rf, setRf] = useState(110);
  const [load, setLoad] = useState(35);
  const { time, reset } = useDemoClock(playing, 1);

  const If = V / Rf;
  const k = Math.max(0.3, If * 0.9);
  const speed = Math.max(0, steadySpeed(V, k, 1.8, load));
  const current = load / k;
  const points = Array.from({ length: 60 }, (_, i) => {
    const t = (i / 59) * 100;
    return [t, Math.max(0, steadySpeed(V, k, 1.8, t))] as [number, number];
  });

  return (
    <DemoFrame
      status="并励：励磁支路单独取电，磁通较稳，负载主要改变电枢电流"
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => {
        reset();
        setV(220);
        setRf(110);
        setLoad(35);
      }}
      actions={
        <div className="segmented">
          <button type="button" onClick={() => setLoad((value) => Math.min(100, value + 20))}>加负载</button>
          <button type="button" onClick={() => setRf((value) => Math.min(260, value + 30))}>弱磁</button>
        </div>
      }
      sliders={[
        { label: "电源电压", symbol: "V", value: V, min: 80, max: 360, step: 10, unit: "V", onChange: setV },
        { label: "励磁电阻", symbol: "Rf", value: Rf, min: 60, max: 260, step: 10, unit: "Ω", onChange: setRf },
        { label: "负载", symbol: "TL", value: load, min: 0, max: 100, step: 5, unit: "N·m", onChange: setLoad }
      ]}
      readouts={
        <>
          <Readout label="If=V/Rf" value={If} unit="A" tone="blue" />
          <Readout label="Ia=TL/k" value={current} unit="A" tone="red" />
          <Readout label="ω" value={speed} unit="rad/s" tone="green" />
        </>
      }
    >
      <div className="demo-split">
        <div className="mechanism-stack">
          <MotorSketch angle={time * Math.max(20, speed * 0.16)} phi={clamp(k / 1.8, 0.25, 1.4)} current={current / 25} torque={load / 45} />
          <svg className="steady-cause-svg" viewBox="0 0 520 210" role="img" aria-label="并励电机支路和因果说明">
            <ArrowDefs />
            <rect x="16" y="16" width="488" height="178" rx="20" fill="#ffffff" stroke="var(--border)" />
            <text x="260" y="42" textAnchor="middle" className="svg-axis-label">励磁支路并联，所以 Φ 不随负载大幅变化</text>
            <line x1="68" y1="78" x2="430" y2="78" className="axis-line" />
            <rect x="112" y="54" width="92" height="48" rx="12" fill="#dbeafe" stroke="var(--blue)" strokeWidth="3" />
            <rect x="316" y="54" width="92" height="48" rx="12" fill="#fee2e2" stroke="var(--red)" strokeWidth="3" />
            <text x="158" y="84" textAnchor="middle" className="svg-axis-label">励磁支路</text>
            <text x="362" y="84" textAnchor="middle" className="svg-axis-label">电枢支路</text>
            <line x1="204" y1="78" x2="316" y2="78" className="current-arrow" markerEnd="url(#arrow-red)" />
            {[
              ["TL↑", "负载"],
              ["Ia↑", "电枢电流"],
              ["IR↑", "压降"],
              ["ω略↓", "转速"]
            ].map(([top, bottom], index) => (
              <g key={top} transform={`translate(${62 + index * 112} 126)`}>
                <rect width="76" height="46" rx="12" className="chain-node is-active" />
                <text x="38" y="22" textAnchor="middle" className="chain-text">{top}</text>
                <text x="38" y="37" textAnchor="middle" className="chain-text">{bottom}</text>
                {index < 3 ? <line x1="80" y1="23" x2="104" y2="23" className="chain-arrow is-active" markerEnd="url(#arrow-green)" /> : null}
              </g>
            ))}
          </svg>
        </div>
        <Plot points={points} marker={[load, speed]} xLabel="TL" yLabel="ω" color="blue" label="并励负载转速特性" />
      </div>
    </DemoFrame>
  );
}
