import { useState } from "react";
import { formatNumber } from "../utils/format";
import { DemoFrame, Readout, useDemoClock } from "./shared";

type Point = {
  x: number;
  y: number;
};

const EMF_CENTER: Point = { x: 280, y: 178 };

function polar(center: Point, radius: number, angleDeg: number): Point {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius
  };
}

function EmfSideMark({ point, out }: { point: Point; out: boolean }) {
  return (
    <g transform={`translate(${point.x} ${point.y})`} aria-label={out ? "电流出纸面" : "电流入纸面"}>
      <circle r="12" className="figure34-current-circle" />
      {out ? (
        <circle r="4" className="figure34-dot" />
      ) : (
        <g className="figure34-cross">
          <line x1="-5" y1="-5" x2="5" y2="5" />
          <line x1="5" y1="-5" x2="-5" y2="5" />
        </g>
      )}
    </g>
  );
}

function BookBackEmfMotor({ angle, speed, emf }: { angle: number; speed: number; emf: number }) {
  const aAngle = 130 + angle;
  const bAngle = aAngle + 180;
  const sideA = polar(EMF_CENTER, 78, aAngle);
  const sideB = polar(EMF_CENTER, 78, bAngle);
  const positive = emf >= 0;

  return (
    <svg className="figure-emf-motor-svg" viewBox="0 0 560 360" role="img" aria-label="直流电机反电动势线稿示意">
      <defs>
        <marker id="emf-motor-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="figure34-arrow-head" />
        </marker>
      </defs>

      <g transform="translate(280 178) scale(1.12) translate(-280 -178)">
        <rect x="52" y="112" width="456" height="132" className="role-field" />
        <text x="108" y="194" className="figure34-pole">
          N
        </text>
        <text x="444" y="194" className="figure34-pole">
          S
        </text>

        <path d={positive ? "M 280 42 V 92" : "M 280 92 V 42"} className="figure34-terminal" markerEnd="url(#emf-motor-arrow)" />
        <path d={positive ? "M 280 270 V 320" : "M 280 320 V 270"} className="figure34-terminal" markerEnd="url(#emf-motor-arrow)" />
        <rect x="270" y="92" width="20" height="50" className="figure34-brush" />
        <rect x="270" y="244" width="20" height="50" className="figure34-brush" />

        <circle cx={EMF_CENTER.x} cy={EMF_CENTER.y} r="108" className="figure34-airgap" />
        <g transform={`rotate(${angle} ${EMF_CENTER.x} ${EMF_CENTER.y})`}>
          <circle cx={EMF_CENTER.x} cy={EMF_CENTER.y} r="78" className="figure34-coil-track" />
          <path d="M 220 140 A 76 76 0 0 0 206 210" className="figure34-inner-arrow" markerEnd="url(#emf-motor-arrow)" />
          <path d="M 340 216 A 76 76 0 0 0 354 146" className="figure34-inner-arrow" markerEnd="url(#emf-motor-arrow)" />
          <path d="M 238 178 A 42 42 0 0 1 322 178 L 306 194 A 24 24 0 0 0 254 194 Z" className="figure34-commutator-segment" />
          <path d="M 322 178 A 42 42 0 0 1 238 178 L 254 162 A 24 24 0 0 0 306 162 Z" className="figure34-commutator-segment" />
        </g>
        <circle cx={EMF_CENTER.x} cy={EMF_CENTER.y} r="22" className="figure34-shaft" />
        <path d={`M ${EMF_CENTER.x} ${EMF_CENTER.y} L ${sideA.x} ${sideA.y}`} className="figure34-spoke" />
        <path d={`M ${EMF_CENTER.x} ${EMF_CENTER.y} L ${sideB.x} ${sideB.y}`} className="figure34-spoke" />
        <EmfSideMark point={sideA} out={positive} />
        <EmfSideMark point={sideB} out={!positive} />
        <path
          d={speed >= 0 ? "M 190 252 A 112 112 0 0 1 184 112" : "M 370 252 A 112 112 0 0 0 376 112"}
          className="role-torque-arrow"
          markerEnd="url(#emf-motor-arrow)"
        />
      </g>
    </svg>
  );
}

export default function MotionEmfDemo() {
  const [playing, setPlaying] = useState(true);
  const [phi, setPhi] = useState(1);
  const [speed, setSpeed] = useState(900);
  const [ke, setKe] = useState(0.18);
  const { time, reset } = useDemoClock(playing, Math.abs(speed) / 900);
  const E = ke * phi * speed;

  return (
    <DemoFrame
      status={phi === 0 ? "磁通为零：导体运动也不能产生 E" : speed === 0 ? "转速为零：反电动势为零" : speed > 0 ? "正转切割磁场，电压表为正" : "反转切割磁场，电压极性反向"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      sliders={[
        { label: "磁通", symbol: "Φ", value: phi, min: 0, max: 1.5, step: 0.05, unit: "Wb", onChange: setPhi },
        { label: "转速", symbol: "n", value: speed, min: -1500, max: 1500, step: 100, unit: "rpm", onChange: setSpeed },
        { label: "电势常数", symbol: "KE", value: ke, min: 0.05, max: 0.5, step: 0.01, unit: "", onChange: setKe }
      ]}
      readouts={<Readout label="E=KEΦn" value={E} unit="V" tone="purple" />}
    >
      <div className="demo-split">
        <svg className="motion-emf-svg" viewBox="0 0 360 300" role="img" aria-label="导体切割磁场产生运动电动势">
          <defs>
            <marker id="motion-emf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="figure34-arrow-head" />
            </marker>
          </defs>
          <rect x="30" y="42" width="92" height="216" rx="4" className="emf-field-block" />
          <rect x="238" y="42" width="92" height="216" rx="4" className="emf-field-block" />
          <text x="76" y="83" textAnchor="middle" className="figure34-pole">N</text>
          <text x="284" y="83" textAnchor="middle" className="figure34-pole">S</text>
          {[90, 136, 182, 228].map((y) => (
            <line key={y} x1="122" y1={y} x2="240" y2={y} className="emf-flux-line" markerEnd="url(#motion-emf-arrow)" opacity={Math.max(0.15, phi / 1.5)} />
          ))}
          <g transform={`translate(${180 + Math.sin(time * 4) * 38} 150)`}>
            <rect x="-12" y="-76" width="24" height="152" rx="12" className="emf-conductor" />
            <line x1="0" y1="-94" x2="0" y2="-126" className="emf-motion-arrow" markerEnd="url(#motion-emf-arrow)" />
          </g>
          <rect x="130" y="248" width="100" height="34" rx="4" className="emf-voltage-box" />
          <text x="180" y="271" textAnchor="middle" className="emf-voltage-text">E={formatNumber(E)}V</text>
        </svg>
        <BookBackEmfMotor angle={time * speed * 0.06} speed={speed} emf={E} />
      </div>
    </DemoFrame>
  );
}
