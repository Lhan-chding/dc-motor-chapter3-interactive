import { useState } from "react";
import { DemoFrame, Readout, useDemoClock } from "./shared";

function fieldPath(x0: number, y: number, bend: number) {
  return `M ${x0 + 92} ${y} C ${x0 + 168} ${y - bend}, ${x0 + 232} ${y + bend}, ${x0 + 308} ${y}`;
}

export default function ArmatureReactionDemo() {
  const [playing, setPlaying] = useState(true);
  const [current, setCurrent] = useState(60);
  const [saturation, setSaturation] = useState(false);
  const { time, reset } = useDemoClock(playing, 1);
  const distortion = (current / 120) * (saturation ? 1.25 : 0.8);
  const fluxDrop = saturation ? current * 0.0025 : current * 0.0008;
  const wobble = playing ? Math.sin(time * 2.2) * 2 : 0;

  return (
    <DemoFrame
      status={saturation ? "饱和后：畸变加重，有效磁通下降" : "电枢电流产生横向磁场，主磁场被扭曲"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      actions={
        <button type="button" className={saturation ? "pill-button is-active" : "pill-button"} onClick={() => setSaturation((value) => !value)}>
          饱和
        </button>
      }
      sliders={[{ label: "电枢电流", symbol: "I", value: current, min: 0, max: 120, step: 5, unit: "A", onChange: setCurrent }]}
      readouts={
        <>
          <Readout label="畸变" value={distortion} unit="pu" tone="amber" />
          <Readout label="有效磁通下降" value={fluxDrop} unit="pu" tone="purple" />
        </>
      }
    >
      <svg className="armature-reaction-book-svg" viewBox="0 0 1040 520" role="img" aria-label="电枢反应使主磁场畸变的线稿图">
        <defs>
          <marker id="reaction-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" className="book-arrow-head" />
          </marker>
        </defs>
        <rect x="34" y="34" width="972" height="452" rx="8" className="book-figure-panel" />
        <text x="262" y="78" textAnchor="middle" className="book-title">理想主磁场</text>
        <text x="778" y="78" textAnchor="middle" className="book-title">电枢反应后</text>

        {[0, 1].map((panel) => {
          const x0 = panel === 0 ? 74 : 590;
          const isReaction = panel === 1;
          const bendBase = isReaction ? 36 + distortion * 54 + wobble : 0;
          const neutralShift = isReaction ? 32 + distortion * 38 : 0;
          return (
            <g key={panel} aria-label={isReaction ? "电枢反应后的磁场" : "理想主磁场"}>
              <rect x={x0} y="150" width="92" height="206" className="book-pole" />
              <rect x={x0 + 300} y="150" width="92" height="206" className="book-pole" />
              <text x={x0 + 46} y="260" textAnchor="middle" className="book-pole-text">N</text>
              <text x={x0 + 346} y="260" textAnchor="middle" className="book-pole-text">S</text>
              {[186, 226, 266, 306].map((y, index) => {
                const bend = isReaction ? bendBase * (index < 2 ? 0.72 : -0.72) : 0;
                return <path key={y} d={fieldPath(x0, y, bend)} className="book-field-line" markerEnd="url(#reaction-arrow)" />;
              })}
              <line x1={x0 + 196 + neutralShift} y1="118" x2={x0 + 196 - neutralShift} y2="392" className="book-guide" />
              <text x={x0 + 196 + neutralShift + 16} y="128" className="book-small">中性线</text>
              {isReaction ? (
                <>
                  <path d={`M ${x0 + 196} 354 C ${x0 + 164} 298, ${x0 + 226} 210, ${x0 + 196} 154`} className="book-armature-field" markerEnd="url(#reaction-arrow)" />
                  <text x={x0 + 234} y="252" className="book-small">电枢磁场</text>
                  <text x={x0 + 196} y="424" textAnchor="middle" className="book-caption">主磁场被横向磁场扭曲</text>
                </>
              ) : (
                <text x={x0 + 196} y="424" textAnchor="middle" className="book-caption">气隙磁密近似对称</text>
              )}
            </g>
          );
        })}
        <text x="520" y="476" textAnchor="middle" className="book-note">
          I 增大：横向磁场增强；饱和时削弱主磁通更明显
        </text>
      </svg>
    </DemoFrame>
  );
}
