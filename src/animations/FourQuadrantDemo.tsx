import { useState } from "react";
import { fourQuadrantOperatingPoint } from "../utils/advancedMotorMath";
import { DemoFrame, Readout, useDemoClock } from "./shared";

type CircuitProps = {
  x: number;
  y: number;
  quadrant: 1 | 2 | 3 | 4;
  active: boolean;
  liveVoltagePositive?: boolean;
};

const quadrantMeta = {
  1: { label: "正转电动", omega: "+ω", torque: "+T", flow: "电 → 机" },
  2: { label: "正转发电", omega: "+ω", torque: "−T", flow: "机 → 电" },
  3: { label: "反转电动", omega: "−ω", torque: "−T", flow: "电 → 机" },
  4: { label: "反转发电", omega: "−ω", torque: "+T", flow: "机 → 电" }
} as const;

function QuadrantCircuit({ x, y, quadrant, active, liveVoltagePositive }: CircuitProps) {
  const meta = quadrantMeta[quadrant];
  const currentPositive = quadrant === 1 || quadrant === 4;
  const voltagePositive = active && liveVoltagePositive !== undefined ? liveVoltagePositive : quadrant === 1 || quadrant === 2;
  const motoring = quadrant === 1 || quadrant === 3;
  const loopPath = currentPositive ? "M 56 92 C 86 32, 184 32, 214 92" : "M 214 92 C 184 32, 86 32, 56 92";

  return (
    <g transform={`translate(${x} ${y})`} aria-label={`第${quadrant}象限${meta.label}`}>
      <rect width="250" height="164" rx="5" className={active ? "advanced-book-panel is-active" : "advanced-book-panel"} />
      <text x="14" y="23" className="advanced-book-index">{quadrant}</text>
      <text x="125" y="24" textAnchor="middle" className="advanced-book-heading">{meta.label}</text>

      <line x1="34" y1="46" x2="34" y2="130" className="advanced-book-wire" />
      <line x1="34" y1="46" x2="190" y2="46" className="advanced-book-wire" />
      <line x1="34" y1="130" x2="190" y2="130" className="advanced-book-wire" />
      <line x1="23" y1="78" x2="45" y2="78" className="advanced-book-wire" />
      <line x1="18" y1="91" x2="50" y2="91" className="advanced-book-wire" />
      <circle cx="190" cy="88" r="36" className="advanced-book-machine" />
      <line x1="190" y1="46" x2="190" y2="52" className="advanced-book-wire" />
      <line x1="190" y1="124" x2="190" y2="130" className="advanced-book-wire" />
      <circle cx="190" cy="48" r="3" className="advanced-book-terminal" />
      <path d={voltagePositive ? "M 8 112 V 58" : "M 8 58 V 112"} className="advanced-book-voltage" markerEnd="url(#advanced-red-arrow)" />
      <path d={currentPositive ? "M 190 108 V 66" : "M 190 66 V 108"} className="advanced-book-emf" markerEnd="url(#advanced-black-arrow)" />
      <path d={loopPath} className={active ? "advanced-book-current is-active" : "advanced-book-current"} markerEnd="url(#advanced-red-arrow)" />
      <path d={motoring ? "M 82 144 H 146" : "M 146 144 H 82"} className="advanced-book-power" markerEnd="url(#advanced-black-arrow)" />

      <text x="58" y="84" className="advanced-book-label">V</text>
      <text x="184" y="94" textAnchor="middle" className="advanced-book-label">E</text>
      <text x="126" y="70" textAnchor="middle" className="advanced-book-small">I</text>
      <text x="114" y="159" textAnchor="middle" className="advanced-book-small">{meta.flow}</text>
      <text x="230" y="83" textAnchor="middle" className="advanced-book-small">{meta.omega}</text>
      <text x="230" y="102" textAnchor="middle" className="advanced-book-small">{meta.torque}</text>
    </g>
  );
}

export default function FourQuadrantDemo() {
  const [playing, setPlaying] = useState(true);
  const [omega, setOmega] = useState(80);
  const [torque, setTorque] = useState(40);
  const [motorConstant, setMotorConstant] = useState(2);
  const [resistance, setResistance] = useState(0.8);
  const { time, reset } = useDemoClock(playing, 1);
  const state = fourQuadrantOperatingPoint({ omega, torque, motorConstant, resistance });
  const onBoundary = Math.abs(omega) < 1e-6 || Math.abs(torque) < 1e-6;
  const pointX = 520 + (omega / 160) * 106;
  const pointY = 310 - (torque / 120) * 106;
  const regenerated = !state.motoring && state.terminalPower < 0;
  const status = onBoundary
    ? "ω=0 或 T=0：工作点在象限边界，机械转换功率 Tω=0"
    : state.motoring
    ? `${state.label}：Tω>0，电能转换为机械能`
    : regenerated
      ? `${state.label}：Tω<0，且 VI<0，电能回馈电源`
      : `${state.label}：Tω<0，正在电磁制动；铜耗使端口尚未回馈`;

  const handleReset = () => {
    reset();
    setOmega(80);
    setTorque(40);
    setMotorConstant(2);
    setResistance(0.8);
  };

  return (
    <DemoFrame
      status={status}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={handleReset}
      sliders={[
        { label: "转速", symbol: "ω", value: omega, min: -160, max: 160, step: 5, unit: "rad/s", onChange: setOmega },
        { label: "电磁转矩", symbol: "T", value: torque, min: -120, max: 120, step: 5, unit: "N·m", onChange: setTorque },
        { label: "电机常数", symbol: "k", value: motorConstant, min: 0.8, max: 3, step: 0.1, unit: "", onChange: setMotorConstant },
        { label: "电枢电阻", symbol: "R", value: resistance, min: 0.2, max: 3, step: 0.1, unit: "Ω", onChange: setResistance }
      ]}
      readouts={
        <>
          <Readout label="象限" value={onBoundary ? "边界" : `${state.quadrant} · ${state.label}`} tone={onBoundary ? "neutral" : state.motoring ? "green" : "purple"} />
          <Readout label="I=T/k" value={state.current} unit="A" tone="red" />
          <Readout label="E=kω" value={state.emf} unit="V" tone="purple" />
          <Readout label="V=E+IR" value={state.voltage} unit="V" tone="blue" />
        </>
      }
    >
      <svg className="advanced-book-svg" viewBox="0 0 1040 650" role="img" aria-label="教材图3.12风格的直流电机四象限运行动态图">
        <defs>
          <marker id="advanced-black-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" className="advanced-book-arrow-head" />
          </marker>
          <marker id="advanced-red-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" className="advanced-book-arrow-head advanced-book-arrow-head--red" />
          </marker>
        </defs>

        <text x="520" y="30" textAnchor="middle" className="advanced-book-title">图 3.12  直流电机四象限运行</text>
        <QuadrantCircuit x={40} y={54} quadrant={4} active={state.quadrant === 4} liveVoltagePositive={state.voltage >= 0} />
        <QuadrantCircuit x={750} y={54} quadrant={1} active={state.quadrant === 1} liveVoltagePositive={state.voltage >= 0} />
        <QuadrantCircuit x={40} y={430} quadrant={3} active={state.quadrant === 3} liveVoltagePositive={state.voltage >= 0} />
        <QuadrantCircuit x={750} y={430} quadrant={2} active={state.quadrant === 2} liveVoltagePositive={state.voltage >= 0} />

        <g aria-label="转矩转速象限图">
          <line x1="322" y1="310" x2="718" y2="310" className="advanced-book-axis" markerEnd="url(#advanced-black-arrow)" />
          <line x1="520" y1="414" x2="520" y2="184" className="advanced-book-axis" markerEnd="url(#advanced-black-arrow)" />
          <rect x="402" y="192" width="236" height="236" className="advanced-book-quadrant-box" />
          <line x1="402" y1="310" x2="638" y2="310" className="advanced-book-guide" />
          <line x1="520" y1="192" x2="520" y2="428" className="advanced-book-guide" />
          <text x="700" y="335" className="advanced-book-label">转速 ω</text>
          <text x="538" y="198" className="advanced-book-label">转矩 T</text>
          <text x="579" y="238" textAnchor="middle" className="advanced-book-index">1</text>
          <text x="579" y="390" textAnchor="middle" className="advanced-book-index">2</text>
          <text x="461" y="390" textAnchor="middle" className="advanced-book-index">3</text>
          <text x="461" y="238" textAnchor="middle" className="advanced-book-index">4</text>
          <line x1={pointX} y1={pointY} x2={pointX} y2="310" className="advanced-book-live-guide" />
          <line x1="520" y1={pointY} x2={pointX} y2={pointY} className="advanced-book-live-guide" />
          <circle cx={pointX} cy={pointY} r={7 + Math.sin(time * 5) * 1.2} className="advanced-book-live-point" />
          <text x={pointX + 12} y={pointY - 10} className="advanced-book-small">运行点</text>
        </g>

        <g transform="translate(352 458)" aria-label="一致的物理方程">
          <rect width="336" height="120" rx="5" className="advanced-book-equation-panel" />
          <text x="168" y="28" textAnchor="middle" className="advanced-book-heading">同一组量必须同时满足</text>
          <text x="168" y="57" textAnchor="middle" className="advanced-book-equation">E=kω　 I=T/k</text>
          <text x="168" y="84" textAnchor="middle" className="advanced-book-equation">V=E+IR　 Pmech=Tω</text>
          <text x="168" y="107" textAnchor="middle" className="advanced-book-small">播放：观察当前象限与能量方向</text>
        </g>
      </svg>
    </DemoFrame>
  );
}
