import { useState } from "react";
import { ArrowDefs, DemoFrame, Plot, Readout, useDemoClock } from "./shared";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function ShuntSeriesCompareDemo() {
  const [playing, setPlaying] = useState(true);
  const [load, setLoad] = useState(0.6);
  const { time, reset } = useDemoClock(playing, 1);

  const shuntSpeed = 1 - 0.12 * load;
  const shuntFlux = 1;
  const seriesCurrent = clamp(0.12 + load * 0.98, 0.08, 1.25);
  const seriesFlux = seriesCurrent > 0.9 ? 0.9 + (seriesCurrent - 0.9) * 0.25 : seriesCurrent;
  const seriesSpeed = Math.min(1.65, 0.34 / Math.max(0.08, seriesFlux));
  const noLoadRisk = load < 0.18;
  const shuntPoints = Array.from({ length: 60 }, (_, i) => [i / 59, 1 - 0.12 * (i / 59)] as [number, number]);
  const seriesPoints = Array.from({ length: 60 }, (_, i) => {
    const x = 0.05 + (i / 59) * 0.95;
    return [x, Math.min(1.65, 0.34 / Math.max(0.08, 0.12 + x * 0.98))] as [number, number];
  });

  return (
    <DemoFrame
      status={noLoadRisk ? "串励负载过小：磁通弱，转速快速升高" : "并励磁通近似恒定；串励磁通跟着负载电流变"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => {
        reset();
        setLoad(0.6);
      }}
      actions={
        <div className="segmented">
          <button type="button" className={load < 0.18 ? "is-active" : ""} onClick={() => setLoad(0.08)}>小负载</button>
          <button type="button" className={load > 0.75 ? "is-active" : ""} onClick={() => setLoad(0.9)}>大负载</button>
        </div>
      }
      sliders={[{ label: "负载比例", symbol: "TL", value: load, min: 0.05, max: 1, step: 0.05, unit: "pu", onChange: setLoad }]}
      readouts={
        <>
          <Readout label="并励速度" value={shuntSpeed} unit="pu" tone="blue" />
          <Readout label="串励速度" value={seriesSpeed} unit="pu" tone={noLoadRisk ? "amber" : "green"} />
          <Readout label="串励Φ" value={seriesFlux} unit="pu" tone="purple" />
        </>
      }
    >
      <div className="demo-split">
        <svg className="compare-circuit-svg" viewBox="0 0 560 430" role="img" aria-label="并励和串励结构对比">
          <ArrowDefs />
          <rect x="18" y="22" width="244" height="374" rx="22" fill="#ffffff" stroke="var(--border)" />
          <rect x="298" y="22" width="244" height="374" rx="22" fill="#ffffff" stroke="var(--border)" />
          <text x="140" y="58" textAnchor="middle" className="svg-label">并励</text>
          <text x="420" y="58" textAnchor="middle" className="svg-label">串励</text>

          <g transform="translate(46 84)">
            <rect x="0" y="0" width="54" height="112" rx="12" fill="#dbeafe" stroke="var(--blue)" strokeWidth="3" />
            <line x1="54" y1="30" x2="166" y2="30" className="current-arrow" markerEnd="url(#arrow-red)" />
            <line x1="54" y1="82" x2="166" y2="82" className="current-arrow" markerEnd="url(#arrow-red)" />
            <rect x="112" y="6" width="74" height="48" rx="12" fill="#dbeafe" stroke="var(--blue)" strokeWidth="3" />
            <rect x="112" y="58" width="74" height="48" rx="12" fill="#fee2e2" stroke="var(--red)" strokeWidth="3" />
            <text x="149" y="36" textAnchor="middle" className="svg-axis-label">励磁</text>
            <text x="149" y="88" textAnchor="middle" className="svg-axis-label">电枢</text>
          </g>
          <g transform="translate(70 242)">
            <circle cx="70" cy="56" r="42" fill="#f8fafc" stroke="#dbe3ee" strokeWidth="7" />
            <path d={`M 70 56 l ${34 * Math.cos(time * shuntSpeed)} ${34 * Math.sin(time * shuntSpeed)}`} stroke="var(--green)" strokeWidth="8" strokeLinecap="round" />
            <text x="70" y="124" textAnchor="middle" className="svg-axis-label">Φ≈定值，转速略降</text>
          </g>

          <g transform="translate(328 92)">
            <rect x="0" y="0" width="54" height="92" rx="12" fill="#dbeafe" stroke="var(--blue)" strokeWidth="3" />
            <path d="M 54 46 H 92" className="series-current-line" markerEnd="url(#arrow-red)" />
            <path d="M 92 46 c 10 -26, 26 -26, 36 0 s 26 26, 36 0" fill="none" stroke="var(--blue)" strokeWidth={3 + seriesFlux * 5} strokeLinecap="round" />
            <path d="M 166 46 H 196" className="series-current-line" markerEnd="url(#arrow-red)" />
            <rect x="196" y="14" width="66" height="64" rx="12" fill="#fee2e2" stroke="var(--red)" strokeWidth="3" />
            <path d="M 229 78 V 116 H 28 V 92" fill="none" stroke="var(--ink)" strokeWidth="4" />
            <text x="132" y="132" textAnchor="middle" className="svg-axis-label">I 同时决定 Φ 与 T</text>
          </g>
          <g transform="translate(350 248)">
            <circle cx="70" cy="50" r="42" fill={noLoadRisk ? "#fef3c7" : "#f8fafc"} stroke={noLoadRisk ? "var(--amber)" : "#dbe3ee"} strokeWidth="7" />
            <path d={`M 70 50 l ${34 * Math.cos(time * seriesSpeed * 1.5)} ${34 * Math.sin(time * seriesSpeed * 1.5)}`} stroke={noLoadRisk ? "var(--amber)" : "var(--green)"} strokeWidth="8" strokeLinecap="round" />
            <text x="70" y="118" textAnchor="middle" className="svg-axis-label">{noLoadRisk ? "小负载会飞车" : "低速大转矩"}</text>
          </g>
        </svg>
        <div className="curve-stack">
          <Plot points={shuntPoints} marker={[load, shuntSpeed]} xLabel="T" yLabel="n" color="blue" label="并励转速特性" />
          <Plot points={seriesPoints} marker={[load, seriesSpeed]} xLabel="T" yLabel="n" color={noLoadRisk ? "amber" : "green"} label="串励转速特性" />
        </div>
      </div>
    </DemoFrame>
  );
}
