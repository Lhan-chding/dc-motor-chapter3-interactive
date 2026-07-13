import { useState } from "react";
import { seriesMotorOperatingPoint } from "../utils/advancedMotorMath";
import { DemoFrame, Readout, useDemoClock } from "./shared";
import { SeriesFigure315, ShuntFigure314 } from "./ExcitationTextbookFigures";

const SERIES_MODEL = { machineConstant: 1.1, fieldConstant: 0.055, saturationFlux: 0.8 } as const;
const SHUNT_MODEL = { armatureResistance: 0.55, machineConstant: 1.2, fieldResistance: 110, fieldConstant: 0.5, saturationFlux: 0.9 } as const;

function shuntOperatingPoint(voltage: number, loadTorque: number) {
  const fieldCurrent = voltage / SHUNT_MODEL.fieldResistance;
  const flux = SHUNT_MODEL.saturationFlux * Math.tanh((SHUNT_MODEL.fieldConstant * fieldCurrent) / SHUNT_MODEL.saturationFlux);
  const current = loadTorque / (SHUNT_MODEL.machineConstant * flux);
  const emf = voltage - current * SHUNT_MODEL.armatureResistance;
  return { current, flux, emf, omega: Math.max(0, emf / (SHUNT_MODEL.machineConstant * flux)) };
}

export default function ShuntSeriesCompareDemo() {
  const [playing, setPlaying] = useState(true);
  const [voltage, setVoltage] = useState(220);
  const [loadTorque, setLoadTorque] = useState(35);
  const { time, reset } = useDemoClock(playing, 1);
  const shunt = shuntOperatingPoint(voltage, loadTorque);
  const shuntBaseSpeed = shuntOperatingPoint(voltage, 0).omega;
  const series = seriesMotorOperatingPoint({ voltage, totalResistance: 1.8, loadTorque, ...SERIES_MODEL });
  const seriesBaseSpeed = seriesMotorOperatingPoint({ voltage, totalResistance: 1.8, loadTorque: 35, ...SERIES_MODEL }).omega;
  const pulse = playing ? Math.sin(time * 5) * 0.8 : 0;

  return (
    <DemoFrame
      status={series.noLoadRisk ? "并励支路仍维持磁通；串励磁通随电流减小，转速急升" : "图 3.14 为并励独立励磁支路；图 3.15 为励磁、电枢全串联"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => { reset(); setPlaying(true); setVoltage(220); setLoadTorque(35); }}
      actions={<div className="segmented"><button type="button" className={loadTorque <= 8 ? "is-active" : ""} onClick={() => setLoadTorque(5)}>小负载</button><button type="button" className={loadTorque >= 50 ? "is-active" : ""} onClick={() => setLoadTorque(55)}>大负载</button></div>}
      sliders={[
        { label: "共同端电压", symbol: "V", value: voltage, min: 160, max: 300, step: 10, unit: "V", onChange: setVoltage },
        { label: "共同负载转矩", symbol: "TL", value: loadTorque, min: 2, max: 60, step: 1, unit: "N·m", onChange: setLoadTorque }
      ]}
      readouts={<><Readout label="并励 ω" value={shunt.omega} unit="rad/s" tone="blue" /><Readout label="串励 ω" value={series.omega} unit="rad/s" tone={series.noLoadRisk ? "amber" : "green"} /><Readout label="并励 Φ" value={shunt.flux} unit="Wb" tone="purple" /><Readout label="串励 Φ" value={series.flux} unit="Wb" tone="red" /></>}
    >
      <svg className="advanced-book-svg excitation-compare-svg" viewBox="0 0 1040 440" role="img" aria-label="严格按教材图3.14和3.15绘制的并励与串励直流电机对比">
        <defs><marker id="excitation-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" className="excitation-arrow-head" /></marker></defs>
        <ShuntFigure314 x={8} y={30} scale={0.97} point={{ speedRatio: shunt.omega / shuntBaseSpeed, torqueRatio: loadTorque / 60, pulse }} />
        <SeriesFigure315 x={522} y={30} scale={0.97} point={{ speedRatio: series.omega / seriesBaseSpeed, torqueRatio: loadTorque / 60, pulse }} />
      </svg>
    </DemoFrame>
  );
}
