import { useState } from "react";
import { DemoFrame, Readout, useDemoClock } from "./shared";

type Point = {
  x: number;
  y: number;
};

const OVERVIEW_CENTER: Point = { x: 380, y: 214 };

function polar(center: Point, radius: number, angleDeg: number): Point {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius
  };
}

function BookCurrentMark({ point, out }: { point: Point; out: boolean }) {
  return (
    <g transform={`translate(${point.x} ${point.y})`} aria-label={out ? "电流出纸面" : "电流入纸面"}>
      <circle r="14" className="steady-book-current-circle" />
      {out ? (
        <circle r="4.6" className="steady-book-current-dot" />
      ) : (
        <g className="steady-book-current-cross">
          <line x1="-5.5" y1="-5.5" x2="5.5" y2="5.5" />
          <line x1="5.5" y1="-5.5" x2="-5.5" y2="5.5" />
        </g>
      )}
    </g>
  );
}

function BookOverviewMotor({
  angle,
  showFlux,
  showCurrent,
  showTorque,
  onPartHover
}: {
  angle: number;
  showFlux: boolean;
  showCurrent: boolean;
  showTorque: boolean;
  onPartHover?: (part: string | null) => void;
}) {
  const sideA = polar(OVERVIEW_CENTER, 88, 130 + angle);
  const sideB = polar(OVERVIEW_CENTER, 88, 310 + angle);
  const sideAOut = sideA.x > OVERVIEW_CENTER.x;
  const sideBOut = sideB.x > OVERVIEW_CENTER.x;

  return (
    <svg className="overview-book-svg" viewBox="0 0 760 430" role="img" aria-label="直流电机关键部件线稿示意">
      <defs>
        <marker id="overview-book-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="book-circuit-arrow-head" />
        </marker>
      </defs>

      <rect x="82" y="112" width="596" height="180" className="role-field" aria-label="励磁磁路外框" />
      <text x="380" y="64" textAnchor="middle" className="overview-book-title">直流电机核心结构</text>
      <text x="140" y="219" className="figure34-pole">N</text>
      <text x="594" y="219" className="figure34-pole">S</text>
      <text x="154" y="270" textAnchor="middle" className="overview-book-small">励磁</text>
      <text x="606" y="270" textAnchor="middle" className="overview-book-small">磁极</text>

      <rect
        x="82"
        y="112"
        width="144"
        height="180"
        className="overview-book-hit"
        aria-label="励磁磁极"
        onMouseEnter={() => onPartHover?.("励磁：建立主磁通")}
        onMouseLeave={() => onPartHover?.(null)}
      />
      <rect
        x="534"
        y="112"
        width="144"
        height="180"
        className="overview-book-hit"
        aria-label="励磁磁极"
        onMouseEnter={() => onPartHover?.("磁极：引导磁通穿过气隙")}
        onMouseLeave={() => onPartHover?.(null)}
      />

      {showFlux ? (
        <g aria-label="磁通路径">
          {[148, 190, 232].map((y) => (
            <path key={y} d={`M 236 ${y} H 524`} className="steady-book-flux" markerEnd="url(#overview-book-arrow)" />
          ))}
        </g>
      ) : null}

      <circle cx={OVERVIEW_CENTER.x} cy={OVERVIEW_CENTER.y} r="124" className="figure34-airgap" />
      <g
        transform={`rotate(${angle} ${OVERVIEW_CENTER.x} ${OVERVIEW_CENTER.y})`}
        aria-label="电枢和换向器"
        onMouseEnter={() => onPartHover?.("电枢：承载电流并受力")}
        onMouseLeave={() => onPartHover?.(null)}
      >
        <circle cx={OVERVIEW_CENTER.x} cy={OVERVIEW_CENTER.y} r="88" className="figure34-coil-track" />
        <path d="M 314 172 A 84 84 0 0 0 298 252" className="steady-book-inner-arrow" markerEnd="url(#overview-book-arrow)" />
        <path d="M 446 258 A 84 84 0 0 0 462 178" className="steady-book-inner-arrow" markerEnd="url(#overview-book-arrow)" />
        <path d="M 330 214 A 50 50 0 0 1 430 214 L 412 234 A 30 30 0 0 0 348 234 Z" className="figure34-commutator-segment" />
        <path d="M 430 214 A 50 50 0 0 1 330 214 L 348 194 A 30 30 0 0 0 412 194 Z" className="figure34-commutator-segment" />
      </g>

      <circle cx={OVERVIEW_CENTER.x} cy={OVERVIEW_CENTER.y} r="25" className="figure34-shaft" />
      <path d={`M ${OVERVIEW_CENTER.x} ${OVERVIEW_CENTER.y} L ${sideA.x} ${sideA.y}`} className="figure34-spoke" />
      <path d={`M ${OVERVIEW_CENTER.x} ${OVERVIEW_CENTER.y} L ${sideB.x} ${sideB.y}`} className="figure34-spoke" />

      {showCurrent ? (
        <g aria-label="电枢电流和电刷供电">
          <BookCurrentMark point={sideA} out={sideAOut} />
          <BookCurrentMark point={sideB} out={sideBOut} />
          <path d="M 380 54 V 100" className="figure34-terminal" markerEnd="url(#overview-book-arrow)" />
          <path d="M 380 324 V 378" className="figure34-terminal" markerEnd="url(#overview-book-arrow)" />
          <rect
            x="370"
            y="100"
            width="20"
            height="54"
            className="figure34-brush"
            aria-label="上电刷"
            onMouseEnter={() => onPartHover?.("电刷：滑动供电")}
            onMouseLeave={() => onPartHover?.(null)}
          />
          <rect
            x="370"
            y="274"
            width="20"
            height="54"
            className="figure34-brush"
            aria-label="下电刷"
            onMouseEnter={() => onPartHover?.("电刷：滑动供电")}
            onMouseLeave={() => onPartHover?.(null)}
          />
          <text x="404" y="86" className="overview-book-small">I</text>
        </g>
      ) : null}

      {showTorque ? (
        <g aria-label="转矩方向">
          <path d="M 246 118 A 142 142 0 0 0 252 304" className="steady-book-torque-arrow" markerEnd="url(#overview-book-arrow)" />
          <text x="226" y="104" className="steady-book-symbol">T</text>
        </g>
      ) : null}

      <g
        aria-label="换向器"
        onMouseEnter={() => onPartHover?.("换向器：保持转矩方向")}
        onMouseLeave={() => onPartHover?.(null)}
      >
        <text x="380" y="400" textAnchor="middle" className="figure34-caption">电刷固定，换向器随转子旋转</text>
      </g>
    </svg>
  );
}

export default function DcMotorOverviewDemo() {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(45);
  const [layer, setLayer] = useState<"all" | "flux" | "current" | "torque">("all");
  const [hover, setHover] = useState<string | null>(null);
  const { time, reset } = useDemoClock(playing, speed / 45);

  const status = hover ?? (layer === "all" ? "磁场、电流、换向器共同形成持续转矩" : layer === "flux" ? "磁通从 N 极穿过气隙到 S 极" : layer === "current" ? "电刷把电流送入电枢线圈" : "导体受力合成为旋转转矩");

  return (
    <DemoFrame
      status={status}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => {
        reset();
        setSpeed(45);
        setLayer("all");
      }}
      sliders={[{ label: "演示转速", symbol: "n", value: speed, min: 10, max: 120, step: 5, unit: "rpm", onChange: setSpeed }]}
      actions={
        <div className="segmented">
          <button type="button" className={layer === "all" ? "is-active" : ""} onClick={() => setLayer("all")}>整体</button>
          <button type="button" className={layer === "flux" ? "is-active" : ""} onClick={() => setLayer("flux")}>磁通路径</button>
          <button type="button" className={layer === "current" ? "is-active" : ""} onClick={() => setLayer("current")}>能量流</button>
          <button type="button" className={layer === "torque" ? "is-active" : ""} onClick={() => setLayer("torque")}>转矩</button>
        </div>
      }
      readouts={
        <>
          <Readout label="励磁" value="建立磁通" tone="blue" />
          <Readout label="电枢" value="承载电流" tone="red" />
          <Readout label="换向器" value="保持方向" tone="amber" />
        </>
      }
    >
      <BookOverviewMotor
        angle={-time * speed}
        showFlux={layer === "all" || layer === "flux"}
        showCurrent={layer === "all" || layer === "current"}
        showTorque={layer === "all" || layer === "torque"}
        onPartHover={setHover}
      />
    </DemoFrame>
  );
}
