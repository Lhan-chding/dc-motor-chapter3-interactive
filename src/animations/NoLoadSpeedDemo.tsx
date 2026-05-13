import { useState } from "react";
import { limitFlux } from "../utils/motorMath";
import { formatNumber } from "../utils/format";
import { DemoFrame, Readout, useDemoClock } from "./shared";

type Point = {
  x: number;
  y: number;
};

const NO_LOAD_CENTER: Point = { x: 280, y: 172 };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function niceScale(value: number) {
  const target = Math.max(200, value);
  const exponent = Math.floor(Math.log10(target));
  const base = 10 ** exponent;
  const normalized = target / base;
  const nice = normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * base;
}

function BookNoLoadMotor({ angle, phi, danger }: { angle: number; phi: number; danger: boolean }) {
  const fluxOpacity = clamp(phi / 1.5, 0.22, 1);

  return (
    <svg className="noload-book-motor-svg" viewBox="0 0 560 330" role="img" aria-label="空载直流电机线稿示意">
      <defs>
        <marker id="noload-motor-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="book-circuit-arrow-head" />
        </marker>
      </defs>

      <rect x="52" y="108" width="456" height="128" className="role-field" />
      <text x="108" y="187" className="figure34-pole">N</text>
      <text x="444" y="187" className="figure34-pole">S</text>

      {[132, 172, 212].map((y) => (
        <path key={y} d={`M 160 ${y} H 400`} className="noload-book-flux" markerEnd="url(#noload-motor-arrow)" opacity={fluxOpacity} />
      ))}

      <circle cx={NO_LOAD_CENTER.x} cy={NO_LOAD_CENTER.y} r="108" className="figure34-airgap" />
      <g transform={`rotate(${angle} ${NO_LOAD_CENTER.x} ${NO_LOAD_CENTER.y})`}>
        <circle cx={NO_LOAD_CENTER.x} cy={NO_LOAD_CENTER.y} r="78" className="figure34-coil-track" />
        <path d="M 220 134 A 76 76 0 0 0 206 204" className="steady-book-inner-arrow" markerEnd="url(#noload-motor-arrow)" />
        <path d="M 340 210 A 76 76 0 0 0 354 140" className="steady-book-inner-arrow" markerEnd="url(#noload-motor-arrow)" />
        <path d="M 238 172 A 42 42 0 0 1 322 172 L 306 188 A 24 24 0 0 0 254 188 Z" className="figure34-commutator-segment" />
        <path d="M 322 172 A 42 42 0 0 1 238 172 L 254 156 A 24 24 0 0 0 306 156 Z" className="figure34-commutator-segment" />
      </g>
      <circle cx={NO_LOAD_CENTER.x} cy={NO_LOAD_CENTER.y} r="22" className="figure34-shaft" />
      <path d="M 184 246 A 112 112 0 0 1 180 98" className="steady-book-torque-arrow" markerEnd="url(#noload-motor-arrow)" />

      <text x="154" y="78" className="steady-book-symbol">n<tspan baselineShift="sub" fontSize="13">0</tspan></text>
      <text x="356" y="86" className="steady-book-symbol">Φ</text>
      <text x="382" y="86" className="noload-book-note">{danger ? "弱磁区" : "磁通"}</text>
      <text x="280" y="308" textAnchor="middle" className="book-circuit-caption">空载：V≈E，磁通越小转速越高</text>
    </svg>
  );
}

function BookAutoRangeSpeedMeter({ speed, danger }: { speed: number; danger: boolean }) {
  const absSpeed = Math.max(0, Math.abs(speed));
  const scaleMax = niceScale(absSpeed * 1.18);
  const ratio = clamp(absSpeed / scaleMax, 0, 0.96);
  const angle = Math.PI - ratio * Math.PI;
  const needleX = 150 + Math.cos(angle) * 82;
  const needleY = 188 - Math.sin(angle) * 82;
  const mid = scaleMax / 2;

  return (
    <svg className="noload-book-gauge-svg" viewBox="0 0 300 250" role="img" aria-label="自动量程空载速度表">
      <defs>
        <marker id="noload-gauge-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="book-circuit-arrow-head" />
        </marker>
      </defs>

      <text x="150" y="34" textAnchor="middle" className="steady-book-symbol">速度表</text>
      <path d="M 52 188 A 100 100 0 0 1 248 188" className="noload-book-gauge-arc" />
      <path d="M 52 188 A 100 100 0 0 1 248 188" className="noload-book-gauge-live" strokeDasharray={`${ratio * 300} 360`} />
      <line x1="150" y1="188" x2={needleX} y2={needleY} className="noload-book-needle" markerEnd="url(#noload-gauge-arrow)" />
      <circle cx="150" cy="188" r="5" className="steady-book-plot-marker" />

      <text x="42" y="214" className="steady-book-tick">0</text>
      <text x="150" y="82" textAnchor="middle" className="steady-book-tick">{formatNumber(mid, 0)}</text>
      <text x="256" y="214" textAnchor="end" className="steady-book-tick">{formatNumber(scaleMax, 0)}</text>
      <text x="150" y="224" textAnchor="middle" className="noload-book-speed">{formatNumber(speed, 0)} rpm</text>
      <text x="150" y="244" textAnchor="middle" className="noload-book-scale">量程 0-{formatNumber(scaleMax, 0)} rpm{danger ? "，弱磁警戒" : ""}</text>
    </svg>
  );
}

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
      status={danger ? "弱磁区：磁通过小，空载转速会快速升高" : "空载近似 V≈E，速度由 V/(KEΦ) 决定"}
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
        <BookNoLoadMotor angle={time * speed * 0.2} phi={phi} danger={danger} />
        <BookAutoRangeSpeedMeter speed={speed} danger={danger} />
      </div>
    </DemoFrame>
  );
}
