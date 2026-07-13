import { useState } from "react";
import { DemoFrame, Readout, useDemoClock } from "./shared";
import { ShuntFigure314 } from "./ExcitationTextbookFigures";

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

export default function ShuntMotorDemo() {
  const [playing, setPlaying] = useState(true);
  const [voltage, setVoltage] = useState(220);
  const [fieldResistance, setFieldResistance] = useState(110);
  const [loadTorque, setLoadTorque] = useState(35);
  const { time, reset } = useDemoClock(playing, 1);
  const point = shuntOperatingPoint(voltage, fieldResistance, loadTorque);
  const nominalBaseSpeed = shuntOperatingPoint(voltage, 110, 0).omega;
  const pulse = playing ? Math.sin(time * 5) * 0.8 : 0;

  return (
    <DemoFrame
      status="励磁支路并接电源；起动时 Rs 限流，正常运行后开关 S 将 Rs 短接"
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
      <svg className="advanced-book-svg excitation-single-svg" viewBox="0 0 1040 620" role="img" aria-label="严格按教材图3.14绘制的并励直流电机电路与转矩转速曲线">
        <defs><marker id="excitation-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" className="excitation-arrow-head" /></marker></defs>
        <ShuntFigure314 x={48} y={12} scale={1.8} point={{ speedRatio: point.omega / nominalBaseSpeed, torqueRatio: loadTorque / LOAD_MAX, pulse }} />
      </svg>
    </DemoFrame>
  );
}
