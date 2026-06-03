import { Pause, Play, RotateCcw } from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { ParameterSlider } from "../components/ParameterSlider";
import { formatNumber } from "../utils/format";

export type SliderConfig = {
  label: string;
  symbol: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
};

type DemoFrameProps = {
  status: string;
  children: ReactNode;
  playing: boolean;
  onToggle: () => void;
  onReset: () => void;
  sliders?: SliderConfig[];
  actions?: ReactNode;
  readouts?: ReactNode;
};

export function useDemoClock(playing: boolean, speed = 1) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!playing) {
      return undefined;
    }

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      setTime((value) => value + delta * speed);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed]);

  return { time, reset: () => setTime(0) };
}

export function DemoFrame({
  status,
  children,
  playing,
  onToggle,
  onReset,
  sliders = [],
  actions,
  readouts
}: DemoFrameProps) {
  return (
    <div className={playing ? "demo-frame is-playing" : "demo-frame is-paused"}>
      <div className="demo-frame__canvas">{children}</div>
      <div className="demo-frame__status" aria-live="polite">
        {status}
      </div>
      {readouts ? <div className="demo-frame__readouts">{readouts}</div> : null}
      <div className="demo-frame__controls">
        <button type="button" onClick={onToggle} className="icon-button">
          {playing ? <Pause size={17} /> : <Play size={17} />}
          {playing ? "暂停" : "播放"}
        </button>
        <button type="button" onClick={onReset} className="icon-button">
          <RotateCcw size={17} />
          重置
        </button>
        {actions}
      </div>
      {sliders.length > 0 ? (
        <div className="demo-frame__sliders">
          {sliders.map((slider) => (
            <ParameterSlider key={slider.symbol} {...slider} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ArrowDefs() {
  return (
    <defs>
      <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--blue)" />
      </marker>
      <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--red)" />
      </marker>
      <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--green)" />
      </marker>
      <marker id="arrow-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--purple)" />
      </marker>
      <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--amber)" />
      </marker>
    </defs>
  );
}

type MotorSketchProps = {
  angle: number;
  current?: number;
  phi?: number;
  torque?: number;
  showFlux?: boolean;
  showCurrent?: boolean;
  showTorque?: boolean;
  spark?: boolean;
  labels?: boolean;
  onPartHover?: (part: string | null) => void;
};

export function MotorSketch({
  angle,
  current = 1,
  phi = 1,
  torque = 1,
  showFlux = true,
  showCurrent = true,
  showTorque = true,
  spark = false,
  labels = true,
  onPartHover
}: MotorSketchProps) {
  const currentSign = current >= 0 ? 1 : -1;
  const torqueSign = torque >= 0 ? 1 : -1;
  const fluxLevel = Math.max(0.12, Math.min(1.5, Math.abs(phi)));
  const currentLevel = Math.max(0.18, Math.min(1.6, Math.abs(current)));
  const torqueLevel = Math.max(0.15, Math.min(1.8, Math.abs(torque)));
  const fluxOpacity = Math.max(0.18, Math.min(1, fluxLevel / 1.5));
  const fluxStroke = 3 + fluxLevel * 3.5;
  const currentStroke = 3 + currentLevel * 2.5;
  const torqueStroke = 4 + torqueLevel * 2;
  const visualAngle = -angle;

  return (
    <svg className="motor-svg" viewBox="0 0 680 420" role="img" aria-label="直流电机结构动画">
      <ArrowDefs />
      <rect x="34" y="34" width="612" height="316" rx="36" fill="#ffffff" stroke="#dbe3ee" strokeWidth="10" aria-label="电机外壳" />
      <rect x="54" y="70" width="150" height="230" rx="24" fill="#dbeafe" stroke="var(--blue)" strokeWidth="3" aria-label="N 极磁极" onMouseEnter={() => onPartHover?.("励磁绕组建立主磁通")} onMouseLeave={() => onPartHover?.(null)} />
      <rect x="476" y="70" width="150" height="230" rx="24" fill="#fee2e2" stroke="var(--red)" strokeWidth="3" aria-label="S 极磁极" onMouseEnter={() => onPartHover?.("磁通穿过气隙回到 S 极")} onMouseLeave={() => onPartHover?.(null)} />
      <text x="129" y="112" textAnchor="middle" className="svg-label">N</text>
      <text x="551" y="112" textAnchor="middle" className="svg-label">S</text>
      <text x="129" y="280" textAnchor="middle" className="motor-part-label">励磁磁极</text>
      <text x="551" y="280" textAnchor="middle" className="motor-part-label">励磁磁极</text>
      {showFlux ? (
        <g opacity={fluxOpacity} aria-label="蓝色磁通路径">
          {[132, 174, 216, 258].map((y) => (
            <path
              key={y}
              className="flux-line"
              d={`M 194 ${y} C 270 ${y - 28}, 410 ${y - 28}, 486 ${y}`}
              strokeWidth={fluxStroke}
              markerEnd="url(#arrow-blue)"
            />
          ))}
        </g>
      ) : null}
      {showCurrent ? (
        <g aria-label="外部电源和电刷供电路径">
          <rect x="250" y="354" width="180" height="42" rx="14" fill="#fff" stroke="var(--border)" />
          <text x="272" y="381" className="terminal-label">+</text>
          <text x="398" y="381" className="terminal-label">-</text>
          <path d="M 286 354 C 286 332, 278 314, 260 304" className="current-arrow" strokeWidth={currentStroke} markerEnd="url(#arrow-red)" />
          <path d="M 394 354 C 394 332, 402 314, 420 304" className="current-arrow" strokeWidth={currentStroke} markerEnd="url(#arrow-red)" />
        </g>
      ) : null}
      <g transform={`translate(340 184) rotate(${visualAngle})`} aria-label="电枢转子" onMouseEnter={() => onPartHover?.("电枢线圈在磁场中受力")} onMouseLeave={() => onPartHover?.(null)}>
        <circle r="88" fill="#f8fafc" stroke="#dbe3ee" strokeWidth="9" />
        <circle r="52" fill="#ffffff" stroke="#cbd5e1" strokeWidth="5" />
        <rect x="-112" y="-15" width="224" height="30" rx="15" fill="#cbd5e1" />
        <rect x="-15" y="-104" width="30" height="208" rx="15" fill="#e2e8f0" />
        <path d="M -68 -58 C -22 -82, 22 -82, 68 -58" fill="none" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
        <path d="M -68 58 C -22 82, 22 82, 68 58" fill="none" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
        {showCurrent ? (
          <g aria-label="红色电枢电流">
            <circle cx="-94" cy="0" r="23" fill="#fee2e2" stroke="var(--red)" strokeWidth="3" />
            <circle cx="94" cy="0" r="23" fill="#fee2e2" stroke="var(--red)" strokeWidth="3" />
            <text x="-94" y="8" textAnchor="middle" className="current-mark">{currentSign > 0 ? "×" : "·"}</text>
            <text x="94" y="8" textAnchor="middle" className="current-mark">{currentSign > 0 ? "·" : "×"}</text>
          </g>
        ) : null}
        {showTorque ? (
          <g aria-label="导体受力方向">
            <path d={currentSign > 0 ? "M -94 -18 V 62" : "M -94 18 V -62"} className="force-arrow" strokeWidth={torqueStroke} markerEnd="url(#arrow-green)" />
            <path d={currentSign > 0 ? "M 94 18 V -62" : "M 94 -18 V 62"} className="force-arrow" strokeWidth={torqueStroke} markerEnd="url(#arrow-green)" />
          </g>
        ) : null}
      </g>
      <line x1="340" y1="272" x2="340" y2="312" stroke="#94a3b8" strokeWidth="14" strokeLinecap="round" aria-label="转轴" />
      <g aria-label="换向器和电刷" onMouseEnter={() => onPartHover?.("换向器每半圈改变线圈接线")} onMouseLeave={() => onPartHover?.(null)}>
        <g transform={`translate(340 320) rotate(${visualAngle})`}>
          <path className="commutator-segment" d="M -48 0 A 48 48 0 0 1 48 0 L 28 34 A 34 34 0 0 0 -28 34 Z" fill="#fde68a" stroke="#b45309" strokeWidth="3" />
          <path className="commutator-segment" d="M 48 0 A 48 48 0 0 1 -48 0 L -28 -34 A 34 34 0 0 0 28 -34 Z" fill="#fed7aa" stroke="#b45309" strokeWidth="3" />
        </g>
        <rect x="254" y="306" width="58" height="28" rx="6" fill="#334155" aria-label="左电刷" />
        <rect x="368" y="306" width="58" height="28" rx="6" fill="#334155" aria-label="右电刷" />
        {spark ? (
          <path className="spark" d="M 428 314 l18 -12 l-7 18 l18 1 l-24 16 l8 -18 z" fill="var(--amber)" aria-label="换向火花" />
        ) : null}
      </g>
      {showTorque ? (
        <path
          className="torque-arrow"
          d={torqueSign >= 0 ? "M 214 104 A 142 142 0 0 0 224 274" : "M 466 104 A 142 142 0 0 1 456 274"}
          strokeWidth={torqueStroke}
          markerEnd="url(#arrow-green)"
          aria-label="绿色转矩方向"
        />
      ) : null}
      {labels ? (
        <g className="svg-small-labels">
          <text x="340" y="28" textAnchor="middle">直流电机核心结构</text>
          <text x="340" y="386" textAnchor="middle">电刷固定，换向器随转子旋转</text>
        </g>
      ) : null}
    </svg>
  );
}

type PlotProps = {
  points: Array<[number, number]>;
  xLabel?: string;
  yLabel?: string;
  color?: "blue" | "red" | "green" | "purple" | "amber";
  marker?: [number, number];
  label?: string;
};

export function Plot({ points, xLabel = "x", yLabel = "y", color = "blue", marker, label }: PlotProps) {
  const path = useMemo(() => {
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys, marker?.[1] ?? Infinity);
    const maxY = Math.max(...ys, marker?.[1] ?? -Infinity);
    const scaleX = (x: number) => 54 + ((x - minX) / Math.max(1e-6, maxX - minX)) * 272;
    const scaleY = (y: number) => 198 - ((y - minY) / Math.max(1e-6, maxY - minY)) * 150;
    return {
      d: points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${scaleX(x)} ${scaleY(y)}`).join(" "),
      markerPoint: marker ? [scaleX(marker[0]), scaleY(marker[1])] : null
    };
  }, [points, marker]);

  return (
    <svg className="plot-svg" viewBox="0 0 360 230" role="img" aria-label={label ?? `${xLabel}-${yLabel} 曲线`}>
      <ArrowDefs />
      <line x1="44" y1="198" x2="330" y2="198" className="axis-line" markerEnd="url(#arrow-blue)" />
      <line x1="54" y1="206" x2="54" y2="34" className="axis-line" markerEnd="url(#arrow-blue)" />
      <path d={path.d} className={`plot-line plot-line--${color}`} />
      {path.markerPoint ? <circle cx={path.markerPoint[0]} cy={path.markerPoint[1]} r="7" className={`plot-marker plot-marker--${color}`} /> : null}
      <text x="326" y="219" textAnchor="end" className="svg-axis-label">{xLabel}</text>
      <text x="22" y="42" className="svg-axis-label">{yLabel}</text>
    </svg>
  );
}

export function ProcessChain({
  nodes,
  activeIndex = 0
}: {
  nodes: string[];
  activeIndex?: number;
}) {
  if (nodes.length > 4) {
    const positions = nodes.map((node, index) => ({
      node,
      x: 58 + (index % 3) * 160,
      y: 54 + Math.floor(index / 3) * 82
    }));

    return (
      <svg className="chain-svg" viewBox="0 0 500 220" role="img" aria-label="过程因果链">
        <ArrowDefs />
        {positions.map(({ node, x, y }, index) => {
          const active = index <= activeIndex;
          const next = positions[index + 1];
          return (
            <g key={node}>
              <rect x={x - 38} y={y - 22} width="76" height="44" rx="12" className={active ? "chain-node is-active" : "chain-node"} />
              <text x={x} y={y + 5} textAnchor="middle" className="chain-text">{node}</text>
              {next ? (
                index % 3 === 2 ? (
                  <path d={`M ${x} ${y + 28} C ${x} ${y + 66}, ${next.x} ${next.y - 62}, ${next.x} ${next.y - 28}`} className={active ? "chain-arrow is-active" : "chain-arrow"} fill="none" markerEnd="url(#arrow-green)" />
                ) : (
                  <line x1={x + 42} y1={y} x2={next.x - 42} y2={next.y} className={active ? "chain-arrow is-active" : "chain-arrow"} markerEnd="url(#arrow-green)" />
                )
              ) : null}
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <svg className="chain-svg" viewBox="0 0 640 150" role="img" aria-label="过程因果链">
      <ArrowDefs />
      {nodes.map((node, index) => {
        const x = 55 + index * 106;
        const active = index <= activeIndex;
        return (
          <g key={node}>
            <rect x={x - 37} y="48" width="74" height="44" rx="12" className={active ? "chain-node is-active" : "chain-node"} />
            <text x={x} y="75" textAnchor="middle" className="chain-text">{node}</text>
            {index < nodes.length - 1 ? (
              <line x1={x + 41} y1="70" x2={x + 69} y2="70" className={active ? "chain-arrow is-active" : "chain-arrow"} markerEnd="url(#arrow-green)" />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function Readout({
  label,
  value,
  unit,
  tone = "neutral"
}: {
  label: string;
  value: number | string;
  unit?: string;
  tone?: "blue" | "red" | "green" | "amber" | "purple" | "neutral";
}) {
  return (
    <span className={`readout readout--${tone}`}>
      <span>{label}</span>
      <strong>
        {typeof value === "number" ? formatNumber(value) : value}
        {unit ?? ""}
      </strong>
    </span>
  );
}

export function CircuitSketch({
  V,
  E,
  current,
  braking = false
}: {
  V: number;
  E: number;
  current: number;
  braking?: boolean;
}) {
  const reverse = current < 0;
  return (
    <svg className="circuit-svg" viewBox="0 0 520 260" role="img" aria-label="直流电机等效电路">
      <ArrowDefs />
      <rect x="44" y="56" width="62" height="120" rx="12" fill="#dbeafe" stroke="var(--blue)" />
      <text x="75" y="122" textAnchor="middle" className="svg-label">V</text>
      <path d="M 106 116 H 180 L 198 94 L 224 138 L 250 94 L 276 138 L 302 94 L 328 116 H 416" fill="none" stroke="var(--ink)" strokeWidth="4" />
      <circle cx="416" cy="116" r="42" fill="#f8fafc" stroke="var(--purple)" strokeWidth="4" />
      <text x="416" y="122" textAnchor="middle" className="svg-label">E</text>
      <path d="M 416 158 V 202 H 74 V 176" fill="none" stroke="var(--ink)" strokeWidth="4" />
      <path d={reverse ? "M 332 82 H 210" : "M 190 82 H 312"} className="current-arrow" markerEnd="url(#arrow-red)" />
      {braking ? (
        <g aria-label="制动电阻发热">
          <rect x="214" y="184" width="92" height="38" rx="8" fill="#ffedd5" stroke="var(--amber)" />
          <text x="260" y="209" textAnchor="middle" className="svg-axis-label">R_b 热</text>
        </g>
      ) : null}
      <text x="224" y="70" textAnchor="middle" className="svg-axis-label">I={formatNumber(current)}A</text>
      <text x="80" y="224" className="svg-axis-label">V={formatNumber(V)}V</text>
      <text x="370" y="224" className="svg-axis-label">E={formatNumber(E)}V</text>
    </svg>
  );
}
