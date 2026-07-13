import { useState } from "react";
import { seriesMotorOperatingPoint } from "../utils/advancedMotorMath";
import { DemoFrame, Readout, useDemoClock } from "./shared";
import { SeriesFigure315 } from "./ExcitationTextbookFigures";

const MODEL = { machineConstant: 1.1, fieldConstant: 0.055, saturationFlux: 0.8 } as const;
const LOAD_MIN = 2;
const LOAD_MAX = 60;

export default function SeriesMotorDemo() {
  const [playing, setPlaying] = useState(true);
  const [voltage, setVoltage] = useState(220);
  const [resistance, setResistance] = useState(1.8);
  const [loadTorque, setLoadTorque] = useState(45);
  const { time, reset } = useDemoClock(playing, 1);
  const solve = (torque: number) => seriesMotorOperatingPoint({ voltage, totalResistance: resistance, loadTorque: torque, ...MODEL });
  const point = solve(loadTorque);
  const baseSpeed = solve(45).omega;
  const pulse = playing ? Math.sin(time * 5) * 0.8 : 0;

  return (
    <DemoFrame
      status={point.noLoadRisk ? "负载减小使 I 与 Φ 同时减小，转速急升；串励电机禁止空载" : "Rf、Lf、Ra 和电枢全串联，同一电流同时建立磁通并产生转矩"}
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
      <svg className="advanced-book-svg excitation-single-svg" viewBox="0 0 1040 620" role="img" aria-label="严格按教材图3.15绘制的串励直流电机电路与转矩转速曲线">
        <defs><marker id="excitation-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" className="excitation-arrow-head" /></marker></defs>
        <SeriesFigure315 x={48} y={12} scale={1.8} point={{ speedRatio: point.omega / baseSpeed, torqueRatio: loadTorque / LOAD_MAX, pulse }} />
      </svg>
    </DemoFrame>
  );
}
