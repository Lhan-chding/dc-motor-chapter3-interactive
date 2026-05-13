import { useState } from "react";
import { ArrowDefs, DemoFrame, Readout, useDemoClock } from "./shared";

export default function ArmatureReactionDemo() {
  const [playing, setPlaying] = useState(true);
  const [current, setCurrent] = useState(60);
  const [saturation, setSaturation] = useState(false);
  const { time, reset } = useDemoClock(playing, 1);
  const distortion = (current / 120) * (saturation ? 1.25 : 0.8);
  const fluxDrop = saturation ? current * 0.0025 : current * 0.0008;

  return (
    <DemoFrame
      status={saturation ? "饱和后增强侧受限，有效磁通下降更明显" : "电枢电流产生横向磁场，主磁场被扭曲"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      actions={<button type="button" className={saturation ? "pill-button is-active" : "pill-button"} onClick={() => setSaturation((value) => !value)}>饱和</button>}
      sliders={[{ label: "电枢电流", symbol: "I", value: current, min: 0, max: 120, step: 5, unit: "A", onChange: setCurrent }]}
      readouts={
        <>
          <Readout label="畸变" value={distortion} unit="pu" tone="amber" />
          <Readout label="有效磁通下降" value={fluxDrop} unit="pu" tone="purple" />
        </>
      }
    >
      <svg className="reaction-svg" viewBox="0 0 760 310" role="img" aria-label="电枢反应导致磁场畸变">
        <ArrowDefs />
        <text x="190" y="38" textAnchor="middle" className="svg-label">理想主磁场</text>
        <text x="570" y="38" textAnchor="middle" className="svg-label">电枢反应后</text>
        {[0, 1].map((panel) => {
          const x0 = panel === 0 ? 70 : 450;
          return (
            <g key={panel}>
              <rect x={x0} y="70" width="80" height="180" rx="18" fill="#dbeafe" stroke="var(--blue)" />
              <rect x={x0 + 230} y="70" width="80" height="180" rx="18" fill="#fee2e2" stroke="var(--red)" />
              {[112, 148, 184, 220].map((y, index) => {
                const bend = panel === 0 ? 0 : Math.sin(time * 2 + index) * 10 + distortion * 34;
                return <path key={y} d={`M ${x0 + 78} ${y} C ${x0 + 140} ${y - bend}, ${x0 + 174} ${y + bend}, ${x0 + 232} ${y}`} className="flux-line" markerEnd="url(#arrow-blue)" />;
              })}
              {panel === 1 ? <path d={`M ${x0 + 160} 242 C ${x0 + 130} 200, ${x0 + 198} 136, ${x0 + 158} 86`} className="current-arrow" markerEnd="url(#arrow-red)" /> : null}
            </g>
          );
        })}
      </svg>
    </DemoFrame>
  );
}
