import { useState } from "react";
import { limitFlux } from "../utils/motorMath";
import { ArrowDefs, DemoFrame, MotorSketch, Readout, useDemoClock } from "./shared";

export default function NoLoadSpeedDemo() {
  const [playing, setPlaying] = useState(true);
  const [V, setV] = useState(220);
  const [phi, setPhi] = useState(1);
  const [ke, setKe] = useState(2);
  const { time, reset } = useDemoClock(playing, 1);
  const safePhi = limitFlux(phi, 0.08);
  const speed = V / (ke * safePhi);
  const danger = phi < 0.2;

  return (
    <DemoFrame
      status={danger ? "弱磁过深：速度显著升高，需限速保护" : "空载近似 V≈E，速度由 V/(KEΦ) 决定"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      sliders={[
        { label: "电枢电压", symbol: "V", value: V, min: 0, max: 400, step: 10, unit: "V", onChange: setV },
        { label: "磁通", symbol: "Φ", value: phi, min: 0.05, max: 1.5, step: 0.05, unit: "Wb", onChange: setPhi },
        { label: "电势常数", symbol: "KE", value: ke, min: 0.5, max: 4, step: 0.1, unit: "", onChange: setKe }
      ]}
      readouts={<Readout label="n0" value={speed} unit="rpm" tone={danger ? "amber" : "green"} />}
    >
      <div className="demo-split">
        <MotorSketch angle={time * speed * 0.2} phi={phi} showCurrent={false} />
        <svg className="gauge-svg" viewBox="0 0 300 250" role="img" aria-label="空载速度表">
          <ArrowDefs />
          <path d="M 52 188 A 100 100 0 0 1 248 188" fill="none" stroke="var(--border)" strokeWidth="18" strokeLinecap="round" />
          <path d="M 52 188 A 100 100 0 0 1 248 188" fill="none" stroke={danger ? "var(--amber)" : "var(--green)"} strokeWidth="18" strokeLinecap="round" strokeDasharray={`${Math.min(1, Math.abs(speed) / 500) * 300} 360`} />
          <line x1="150" y1="188" x2={150 + Math.cos(Math.PI - Math.min(1, Math.abs(speed) / 500) * Math.PI) * 82} y2={188 - Math.sin(Math.PI - Math.min(1, Math.abs(speed) / 500) * Math.PI) * 82} className="needle" />
          <text x="150" y="218" textAnchor="middle" className="svg-label">{Math.round(speed)} rpm</text>
          <text x="150" y="46" textAnchor="middle" className="svg-axis-label">速度表</text>
        </svg>
      </div>
    </DemoFrame>
  );
}
