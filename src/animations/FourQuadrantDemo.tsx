import { useState } from "react";
import { fourQuadrantOperatingPoint } from "../utils/advancedMotorMath";
import { DemoFrame, Readout, useDemoClock } from "./shared";

type Quadrant = 1 | 2 | 3 | 4;

type CircuitSpec = {
  quadrant: Quadrant;
  x: number;
  y: number;
  machine: "M" | "G";
  machineSide: "left" | "right";
  mechanicalPower: "left" | "right";
  emf: "up" | "down";
  voltage: "up" | "down";
  voltageLabel: string;
  cells: 1 | 2;
  current: "clockwise" | "counterclockwise";
};

const circuitSpecs: CircuitSpec[] = [
  { quadrant: 4, x: 70, y: 42, machine: "G", machineSide: "right", mechanicalPower: "left", emf: "down", voltage: "down", voltageLabel: "V_D", cells: 1, current: "clockwise" },
  { quadrant: 1, x: 710, y: 42, machine: "M", machineSide: "left", mechanicalPower: "left", emf: "up", voltage: "up", voltageLabel: "V_A", cells: 2, current: "counterclockwise" },
  { quadrant: 3, x: 70, y: 398, machine: "M", machineSide: "right", mechanicalPower: "right", emf: "down", voltage: "down", voltageLabel: "V_C", cells: 2, current: "counterclockwise" },
  { quadrant: 2, x: 710, y: 398, machine: "G", machineSide: "left", mechanicalPower: "right", emf: "up", voltage: "up", voltageLabel: "V_B", cells: 1, current: "clockwise" }
];

const quadrantLabels: Record<Quadrant, string> = {
  1: "正转电动",
  2: "正转发电",
  3: "反转电动",
  4: "反转发电"
};

function Battery({ x, cells }: { x: number; cells: 1 | 2 }) {
  const plates = cells === 1 ? [104] : [91, 125];
  return (
    <g aria-label={`${cells}节直流电源`}>
      <line x1={x} y1="60" x2={x} y2={plates[0] - 12} className="figure312-wire" />
      {plates.map((center, index) => (
        <g key={center}>
          <line x1={x - 25} y1={center - 5} x2={x + 25} y2={center - 5} className="figure312-wire" />
          <line x1={x - 14} y1={center + 7} x2={x + 14} y2={center + 7} className="figure312-wire" />
          {index < plates.length - 1 ? <line x1={x} y1={center + 7} x2={x} y2={plates[index + 1] - 5} className="figure312-wire" /> : null}
        </g>
      ))}
      <line x1={x} y1={plates[plates.length - 1] + 7} x2={x} y2="180" className="figure312-wire" />
    </g>
  );
}

function Figure312Circuit({ spec, active }: { spec: CircuitSpec; active: boolean }) {
  const machineX = spec.machineSide === "right" ? 218 : 42;
  const sourceX = spec.machineSide === "right" ? 28 : 232;
  const voltageX = spec.machineSide === "right" ? -8 : 268;
  const voltageLabelX = spec.machineSide === "right" ? -18 : 280;
  const loopX = spec.machineSide === "right" ? 126 : 134;
  const currentPath = spec.current === "clockwise"
    ? `M ${loopX - 8} 78 A 43 43 0 1 1 ${loopX - 40} 139`
    : `M ${loopX + 8} 78 A 43 43 0 1 0 ${loopX + 40} 139`;
  const mechanicalPowerPath = spec.mechanicalPower === "left" ? "M 160 28 H 74" : "M 82 28 H 168";
  const emfPath = spec.emf === "up" ? `M ${machineX} 149 V 91` : `M ${machineX} 91 V 149`;
  const voltagePath = spec.voltage === "up" ? `M ${voltageX} 154 V 84` : `M ${voltageX} 84 V 154`;

  return (
    <g transform={`translate(${spec.x} ${spec.y})`} aria-label={`第${spec.quadrant}象限${quadrantLabels[spec.quadrant]}`}>
      <text x="121" y="15" textAnchor="middle" className="figure312-machine-letter">{spec.machine}</text>
      <path d={mechanicalPowerPath} className="figure312-motion" markerEnd="url(#figure312-gray-arrow)" aria-label={`机械功率流向${spec.mechanicalPower === "left" ? "左" : "右"}`} />
      <line x1={sourceX} y1="60" x2={machineX} y2="60" className="figure312-wire" />
      <line x1={sourceX} y1="180" x2={machineX} y2="180" className="figure312-wire" />
      <Battery x={sourceX} cells={spec.cells} />
      <line x1={machineX} y1="60" x2={machineX} y2="75" className="figure312-wire" />
      <circle cx={machineX} cy="120" r="45" className="figure312-machine" />
      <line x1={machineX} y1="165" x2={machineX} y2="180" className="figure312-wire" />
      <circle cx={machineX + (spec.machineSide === "right" ? 13 : -13)} cy="68" r="4" className="figure312-terminal" />
      <rect x={machineX - 5} y="172" width="10" height="8" className="figure312-brush" />
      <path d={emfPath} className="figure312-emf" markerEnd="url(#figure312-black-arrow)" />
      <text x={machineX + (spec.machineSide === "right" ? 18 : -18)} y="124" textAnchor="middle" className="figure312-symbol">E</text>
      <path d={currentPath} className={active ? "figure312-current is-active" : "figure312-current"} markerEnd="url(#figure312-black-arrow)" />
      <text x={loopX} y="118" textAnchor="middle" className="figure312-symbol">I</text>
      <path d={voltagePath} className="figure312-voltage" markerEnd="url(#figure312-black-arrow)" />
      <text x={voltageLabelX} y="125" textAnchor="middle" className="figure312-voltage-label">V<tspan baselineShift="sub" fontSize="12">{spec.voltageLabel.slice(-1)}</tspan></text>
    </g>
  );
}

function QuadrantMap({ active, pulse }: { active: Quadrant | null; pulse: number }) {
  const circles: Array<{ quadrant: Quadrant; x: number; y: number }> = [
    { quadrant: 4, x: 486, y: 276 },
    { quadrant: 1, x: 554, y: 276 },
    { quadrant: 3, x: 486, y: 344 },
    { quadrant: 2, x: 554, y: 344 }
  ];

  return (
    <g aria-label="教材图3.12中心转矩转速象限框">
      <line x1="36" y1="310" x2="1004" y2="310" className="figure312-axis" markerEnd="url(#figure312-black-arrow)" />
      <line x1="520" y1="574" x2="520" y2="46" className="figure312-axis" markerEnd="url(#figure312-black-arrow)" />
      <text x="526" y="33" className="figure312-axis-label">转矩</text>
      <text x="982" y="298" className="figure312-axis-label">转速</text>
      <rect x="444" y="234" width="152" height="152" className="figure312-quadrant-frame" />
      <text x="449" y="249" className="figure312-corner">D</text>
      <text x="584" y="249" className="figure312-corner">A</text>
      <text x="449" y="382" className="figure312-corner">C</text>
      <text x="584" y="382" className="figure312-corner">B</text>
      {circles.map(({ quadrant, x, y }) => (
        <g key={quadrant}>
          <circle cx={x} cy={y} r={quadrant === active ? 21 + pulse : 20} className={quadrant === active ? "figure312-quadrant-number is-active" : "figure312-quadrant-number"} />
          <text x={x} y={y + 6} textAnchor="middle" className="figure312-quadrant-text">{quadrant}</text>
        </g>
      ))}
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
  const regenerated = !state.motoring && state.terminalPower < 0;
  const activeQuadrant: Quadrant | null = onBoundary ? null : state.quadrant;
  const status = onBoundary
    ? "ω=0 或 T=0：工作点位于象限边界，机械转换功率 Tω=0"
    : state.motoring
      ? `${state.label}：Tω>0，电能转换为机械能`
      : regenerated
        ? `${state.label}：Tω<0 且 VI<0，电能回馈电源`
        : `${state.label}：Tω<0，正在制动；铜耗使端口尚未回馈`;

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
      <svg className="advanced-book-svg figure312-svg" viewBox="0 0 1040 650" role="img" aria-label="严格按教材图3.12布局绘制的直流电机四象限运行图">
        <defs>
          <marker id="figure312-black-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" className="figure312-black-arrow-head" />
          </marker>
          <marker id="figure312-gray-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" className="figure312-gray-arrow-head" />
          </marker>
        </defs>
        <QuadrantMap active={activeQuadrant} pulse={playing ? Math.sin(time * 5) * 1.2 : 0} />
        {circuitSpecs.map((spec) => <Figure312Circuit key={spec.quadrant} spec={spec} active={!onBoundary && state.quadrant === spec.quadrant} />)}
        <text x="520" y="632" textAnchor="middle" className="figure312-caption">图 3.12　直流电机在转矩-转速平面上的四象限运行</text>
      </svg>
    </DemoFrame>
  );
}
