import { useState } from "react";
import { DemoFrame, Readout, useDemoClock } from "./shared";

type Point = {
  x: number;
  y: number;
};

type CurrentKind = "dot" | "cross" | "zero";

const CENTER: Point = { x: 360, y: 206 };
const SIDE_RADIUS = 92;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function smoothStep(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function polar(center: Point, radius: number, angleDeg: number): Point {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius
  };
}

function CurrentMark({
  kind,
  label,
  point,
  labelOffset
}: {
  kind: CurrentKind;
  label: string;
  point: Point;
  labelOffset: number;
}) {
  return (
    <g transform={`translate(${point.x} ${point.y})`} aria-label={`${label} 边电流`}>
      <circle r="13" className={kind === "zero" ? "figure34-side-zero" : "figure34-current-circle"} />
      {kind === "dot" ? <circle r="4.2" className="figure34-dot" /> : null}
      {kind === "cross" ? (
        <g className="figure34-cross">
          <line x1="-5.2" y1="-5.2" x2="5.2" y2="5.2" />
          <line x1="5.2" y1="-5.2" x2="-5.2" y2="5.2" />
        </g>
      ) : null}
      {kind === "zero" ? (
        <text y="5" textAnchor="middle" className="figure34-zero-text">
          0
        </text>
      ) : null}
      <text x="0" y={labelOffset} textAnchor="middle" className="figure34-side-label">
        {label}
      </text>
    </g>
  );
}

function InterpoleInset() {
  return (
    <g transform="translate(466 272)" aria-label="图 3.5 换向极及换向极线圈的位置示意图">
      <path d="M 24 5 V 31" className="figure35-axis" />
      <path d="M 24 31 V 166 H 220" className="figure35-axis" />
      <path d="M 24 31 A 188 188 0 0 1 206 166 H 163 A 145 145 0 0 0 24 73 Z" className="figure35-yoke" />
      <path d="M 24 114 A 94 94 0 0 1 104 166 H 24 Z" className="figure35-inner-gap" />
      <path d="M 62 62 C 99 67 132 89 151 121 L 125 139 C 111 113 87 96 62 91 Z" className="figure35-window" />
      <path d="M 123 80 L 148 105 L 127 126 L 102 101 Z" className="figure35-interpole" />
      <g className="figure35-coil">
        <path d="M 102 78 L 119 65 L 142 93 L 124 106 Z" />
        <path d="M 133 99 L 150 86 L 173 114 L 155 127 Z" />
      </g>
      <g className="figure35-hatch-lines">
        {[0, 5, 10, 15, 20].map((offset) => (
          <path key={`left-${offset}`} d={`M ${105 + offset} ${82 - offset * 0.15} l18 -13`} />
        ))}
        {[0, 5, 10, 15, 20].map((offset) => (
          <path key={`right-${offset}`} d={`M ${136 + offset} ${103 - offset * 0.15} l18 -13`} />
        ))}
      </g>
      <line x1="145" y1="95" x2="202" y2="63" className="figure35-callout" />
      <text x="206" y="65" className="figure35-label">
        换向极及线圈
      </text>
      <text x="118" y="190" textAnchor="middle" className="figure35-caption">
        图 3.5
      </text>
    </g>
  );
}

export default function CommutationProcessDemo() {
  const [playing, setPlaying] = useState(true);
  const [inductance, setInductance] = useState(0.35);
  const [speed, setSpeed] = useState(900);
  const [showInterpole, setShowInterpole] = useState(false);
  const { time, reset } = useDemoClock(playing, speed / 900);

  const cycle = (time % 7) / 7;
  const progress =
    cycle < 0.16
      ? 0
      : cycle < 0.54
        ? smoothStep((cycle - 0.16) / 0.38)
        : cycle < 0.74
          ? 1
          : smoothStep(1 - (cycle - 0.74) / 0.26);

  const shorting = Math.abs(progress - 0.5) < 0.08;
  const stageIndex = shorting ? 1 : progress < 0.5 ? 0 : 2;
  const lag = clamp((inductance * speed) / 2100, 0, 0.9);
  const spark = shorting && !showInterpole && lag > 0.34;

  const aAngle = lerp(130, 50, progress);
  const bAngle = aAngle + 180;
  const sideA = polar(CENTER, SIDE_RADIUS, aAngle);
  const sideB = polar(CENTER, SIDE_RADIUS, bAngle);
  const rotorRotation = lerp(-40, 40, progress);
  const aCurrent: CurrentKind = shorting ? "zero" : progress < 0.5 ? "cross" : "dot";
  const bCurrent: CurrentKind = shorting ? "zero" : progress < 0.5 ? "dot" : "cross";

  const status =
    stageIndex === 0
      ? "图 a：a 边在 N 极下，b 边在 S 极下"
      : stageIndex === 1
        ? "短接：线圈过中性线，电流正在反向"
        : "图 b：a 边到 S 极，b 边到 N 极";

  return (
    <DemoFrame
      status={spark ? "换向未完成，电刷处可能出现火花" : showInterpole ? "图 3.5：换向极及线圈位置示意" : status}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      sliders={[
        { label: "线圈电感", symbol: "L", value: inductance, min: 0.05, max: 1, step: 0.05, unit: "H", onChange: setInductance },
        { label: "转速", symbol: "n", value: speed, min: 300, max: 3000, step: 100, unit: "rpm", onChange: setSpeed }
      ]}
      actions={
        <button type="button" className={showInterpole ? "pill-button is-active" : "pill-button"} onClick={() => setShowInterpole((value) => !value)}>
          换向极
        </button>
      }
      readouts={
        <>
          <Readout label="模型位置" value={stageIndex === 0 ? "图 a" : stageIndex === 1 ? "短接" : "图 b"} tone="blue" />
          <Readout label="a 边电流" value={shorting ? "0" : progress < 0.5 ? "+I" : "-I"} tone="neutral" />
          <Readout label="火花" value={spark ? "有" : "无"} tone={spark ? "amber" : "green"} />
        </>
      }
    >
      <div className="commutation-explain-board">
        <svg className="figure34-svg" viewBox="0 0 760 480" role="img" aria-label="图 3.4 单线圈直流电机换向过程动画">
          <defs>
            <marker id="figure34-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="figure34-arrow-head" />
            </marker>
          </defs>

          <rect x="28" y="26" width="704" height="428" rx="22" className="figure34-panel" />

          <g aria-label="N 极和 S 极">
            <rect x="116" y="120" width="488" height="164" className="figure34-field" />
            <text x="164" y="220" className="figure34-pole">
              N
            </text>
            <text x="558" y="220" className="figure34-pole">
              S
            </text>
          </g>

          <g aria-label="电刷和外部电流">
            <path d="M 360 50 V 100" className="figure34-terminal" markerEnd="url(#figure34-arrow)" />
            <path d="M 360 308 V 362" className="figure34-terminal" markerEnd="url(#figure34-arrow)" />
            <rect x="350" y="100" width="20" height="54" className="figure34-brush" />
            <rect x="350" y="268" width="20" height="54" className="figure34-brush" />
          </g>

          <g aria-label="转动线圈和换向器">
            <circle cx={CENTER.x} cy={CENTER.y} r="122" className="figure34-airgap" />
            <g transform={`rotate(${rotorRotation} ${CENTER.x} ${CENTER.y})`}>
              <circle cx={CENTER.x} cy={CENTER.y} r="92" className="figure34-coil-track" />
              <path d="M 298 162 A 80 80 0 0 0 282 234" className="figure34-inner-arrow" markerEnd="url(#figure34-arrow)" />
              <path d="M 421 250 A 80 80 0 0 0 438 178" className="figure34-inner-arrow" markerEnd="url(#figure34-arrow)" />
              <path d="M 314 206 A 46 46 0 0 1 406 206 L 390 224 A 27 27 0 0 0 330 224 Z" className={shorting ? "figure34-commutator-segment is-short" : "figure34-commutator-segment"} />
              <path d="M 406 206 A 46 46 0 0 1 314 206 L 330 188 A 27 27 0 0 0 390 188 Z" className={shorting ? "figure34-commutator-segment is-short" : "figure34-commutator-segment"} />
            </g>
            <circle cx={CENTER.x} cy={CENTER.y} r="24" className="figure34-shaft" />
            <path d={`M ${CENTER.x} ${CENTER.y} L ${sideA.x} ${sideA.y}`} className="figure34-spoke" />
            <path d={`M ${CENTER.x} ${CENTER.y} L ${sideB.x} ${sideB.y}`} className="figure34-spoke" />
          </g>

          <CurrentMark kind={aCurrent} label="a" point={sideA} labelOffset={progress < 0.5 ? 30 : 31} />
          <CurrentMark kind={bCurrent} label="b" point={sideB} labelOffset={progress < 0.5 ? -18 : -20} />

          {shorting ? (
            <g aria-label="电刷短接线圈">
              <circle cx="360" cy="126" r="18" className="figure34-short-ring" />
              <circle cx="360" cy="296" r="18" className="figure34-short-ring" />
            </g>
          ) : null}

          {spark ? <path d="M 382 104 l12 -13 l-4 17 l16 -1 l-18 14 l5 -16 z" className="figure34-spark" /> : null}

          <g aria-label="换向阶段">
            {["图 a", "短接", "图 b"].map((label, index) => (
              <g key={label}>
                <rect x={216 + index * 88} y="354" width="76" height="30" rx="12" className={stageIndex === index ? "figure34-stage is-active" : "figure34-stage"} />
                <text x={254 + index * 88} y="375" textAnchor="middle" className="figure34-stage-text">
                  {label}
                </text>
              </g>
            ))}
          </g>

          {showInterpole ? <InterpoleInset /> : null}

          <text x={showInterpole ? 266 : 360} y={showInterpole ? 414 : 430} textAnchor="middle" className="figure34-caption">
            图 3.4  单线圈直流电机换向过程的简化示意图
          </text>
        </svg>
        <div className="commutation-principle" aria-label="换向极原理三步">
          <span>短接线圈有电感</span>
          <span>换向极给反向电势</span>
          <span>离刷前电流到零</span>
        </div>
      </div>
    </DemoFrame>
  );
}
