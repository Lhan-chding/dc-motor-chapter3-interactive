import { useMemo, useState } from "react";
import { DemoFrame, Plot, Readout, useDemoClock } from "./shared";

type Mode = "without" | "with";
type Point = {
  x: number;
  y: number;
};

const ROLE_CENTER: Point = { x: 280, y: 178 };

function polar(center: Point, radius: number, angleDeg: number): Point {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius
  };
}

function CurrentDotCross({
  point,
  label,
  out
}: {
  point: Point;
  label: string;
  out: boolean;
}) {
  return (
    <g transform={`translate(${point.x} ${point.y})`} aria-label={`${label} 边电流`}>
      <circle r="12" className="figure34-current-circle" />
      {out ? (
        <circle r="4" className="figure34-dot" />
      ) : (
        <g className="figure34-cross">
          <line x1="-5" y1="-5" x2="5" y2="5" />
          <line x1="5" y1="-5" x2="-5" y2="5" />
        </g>
      )}
      <text y={point.y < ROLE_CENTER.y ? -17 : 26} textAnchor="middle" className="role-side-label">
        {label}
      </text>
    </g>
  );
}

function BookCommutatorRoleFigure({
  angle,
  mode
}: {
  angle: number;
  mode: Mode;
}) {
  const aAngle = 130 + angle;
  const bAngle = aAngle + 180;
  const sideA = polar(ROLE_CENTER, 78, aAngle);
  const sideB = polar(ROLE_CENTER, 78, bAngle);
  const sideAOut = mode === "with" ? sideA.x > ROLE_CENTER.x : false;
  const sideBOut = mode === "with" ? sideB.x > ROLE_CENTER.x : true;
  const torquePositive = mode === "with" ? true : sideA.x < ROLE_CENTER.x;

  return (
    <svg className="figure-role-svg" viewBox="0 0 560 360" role="img" aria-label="换向器作用的单线圈直流电机示意">
      <defs>
        <marker id="role-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="figure34-arrow-head" />
        </marker>
      </defs>

      <g transform="translate(280 178) scale(1.16) translate(-280 -178)">
      <rect x="52" y="112" width="456" height="132" className="role-field" />
      <text x="108" y="194" className="figure34-pole">
        N
      </text>
      <text x="444" y="194" className="figure34-pole">
        S
      </text>

      <path d="M 280 42 V 92" className="figure34-terminal" markerEnd="url(#role-arrow)" />
      <path d="M 280 270 V 320" className="figure34-terminal" markerEnd="url(#role-arrow)" />
      <rect x="270" y="92" width="20" height="50" className="figure34-brush" />
      <rect x="270" y="244" width="20" height="50" className="figure34-brush" />

      <circle cx={ROLE_CENTER.x} cy={ROLE_CENTER.y} r="108" className="figure34-airgap" />
      <g transform={`rotate(${angle} ${ROLE_CENTER.x} ${ROLE_CENTER.y})`}>
        <circle cx={ROLE_CENTER.x} cy={ROLE_CENTER.y} r="78" className="figure34-coil-track" />
        <path d="M 220 140 A 76 76 0 0 0 206 210" className="figure34-inner-arrow" markerEnd="url(#role-arrow)" />
        <path d="M 340 216 A 76 76 0 0 0 354 146" className="figure34-inner-arrow" markerEnd="url(#role-arrow)" />
        {mode === "with" ? (
          <>
            <path d="M 238 178 A 42 42 0 0 1 322 178 L 306 194 A 24 24 0 0 0 254 194 Z" className="figure34-commutator-segment" />
            <path d="M 322 178 A 42 42 0 0 1 238 178 L 254 162 A 24 24 0 0 0 306 162 Z" className="figure34-commutator-segment" />
          </>
        ) : (
          <>
            <circle cx={ROLE_CENTER.x} cy={ROLE_CENTER.y} r="35" className="role-slip-ring" />
            <circle cx={ROLE_CENTER.x} cy={ROLE_CENTER.y} r="24" className="role-slip-ring role-slip-ring--inner" />
          </>
        )}
      </g>
      <circle cx={ROLE_CENTER.x} cy={ROLE_CENTER.y} r="22" className="figure34-shaft" />
      <path d={`M ${ROLE_CENTER.x} ${ROLE_CENTER.y} L ${sideA.x} ${sideA.y}`} className="figure34-spoke" />
      <path d={`M ${ROLE_CENTER.x} ${ROLE_CENTER.y} L ${sideB.x} ${sideB.y}`} className="figure34-spoke" />

      <CurrentDotCross point={sideA} label="a" out={sideAOut} />
      <CurrentDotCross point={sideB} label="b" out={sideBOut} />

      <path
        d={torquePositive ? "M 184 112 A 112 112 0 0 0 190 252" : "M 376 112 A 112 112 0 0 1 370 252"}
        className={torquePositive ? "role-torque-arrow" : "role-torque-arrow role-torque-arrow--reverse"}
        markerEnd="url(#role-arrow)"
      />
      </g>
    </svg>
  );
}

export default function CommutatorRoleDemo() {
  const [playing, setPlaying] = useState(true);
  const [mode, setMode] = useState<Mode>("with");
  const [speed, setSpeed] = useState(55);
  const { time, reset } = useDemoClock(playing, speed / 45);
  const phaseAngle = (time * speed) % 360;
  const returning = mode === "without" && phaseAngle > 180;
  const angle = mode === "without" ? (returning ? 360 - phaseAngle : phaseAngle) : phaseAngle;
  const rad = (phaseAngle * Math.PI) / 180;
  const rawTorque = Math.sin(rad);
  const visibleTorque = mode === "with" ? Math.abs(rawTorque) : rawTorque;
  const motionState = mode === "with" ? "连续旋转" : returning ? "反向回摆" : "正向半周";

  const points = useMemo(
    () =>
      Array.from({ length: 90 }, (_, index) => {
        const x = index * 4;
        const y = Math.sin((x * Math.PI) / 180);
        return [x, mode === "with" ? Math.abs(y) : y] as [number, number];
      }),
    [mode]
  );

  return (
    <DemoFrame
      status={mode === "with" ? "换向器每半周反接，转矩保持同向" : "无换向器：半周后转矩反向，转子回摆"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      sliders={[{ label: "转速", symbol: "n", value: speed, min: 20, max: 120, step: 5, unit: "rpm", onChange: setSpeed }]}
      actions={
        <div className="segmented">
          <button type="button" className={mode === "without" ? "is-active" : ""} onClick={() => setMode("without")}>
            无换向器
          </button>
          <button type="button" className={mode === "with" ? "is-active" : ""} onClick={() => setMode("with")}>
            有换向器
          </button>
        </div>
      }
      readouts={
        <>
          <Readout label="转矩方向" value={visibleTorque >= 0 ? "正向" : "反向"} tone={visibleTorque >= 0 ? "green" : "amber"} />
          <Readout label="转子运动" value={motionState} tone={returning ? "amber" : "green"} />
        </>
      }
    >
      <div className="demo-split">
        <BookCommutatorRoleFigure angle={-angle} mode={mode} />
        <Plot points={points} marker={[phaseAngle, visibleTorque]} xLabel="角度" yLabel="T" color={mode === "with" ? "green" : "amber"} label={mode === "with" ? "有换向器：转矩保持正向" : "无换向器：转矩正负交替"} />
      </div>
    </DemoFrame>
  );
}
