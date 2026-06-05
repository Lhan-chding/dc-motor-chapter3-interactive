import { useState } from "react";
import { armatureTimeConstant, electromechanicalTimeConstant } from "../utils/motorMath";
import { DemoFrame, Readout, useDemoClock } from "./shared";

function risePath(x0: number, y0: number, width: number, height: number, timeConstant: number) {
  return Array.from({ length: 90 }, (_, index) => {
    const t = (index / 89) * 5;
    const y = 1 - Math.exp(-t / Math.max(0.15, timeConstant));
    const x = x0 + (t / 5) * width;
    const py = y0 - y * height;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${py.toFixed(1)}`;
  }).join(" ");
}

export default function TimeConstantExplorer() {
  const [playing, setPlaying] = useState(true);
  const [R, setR] = useState(2);
  const [J, setJ] = useState(0.18);
  const [k, setK] = useState(1.2);
  const [L, setL] = useState(0.2);
  const { time, reset } = useDemoClock(playing, 0.6);
  const tau = electromechanicalTimeConstant(R, J, k);
  const ta = armatureTimeConstant(L, R);
  const t = (time % 5);
  const mechFast = Math.max(0.18, tau);
  const mechSlow = mechFast * 2.2;
  const elecFast = Math.max(0.05, ta);
  const elecSlow = elecFast * 2.2;
  const mechNow = 1 - Math.exp(-t / mechFast);
  const elecNow = 1 - Math.exp(-t / elecFast);

  return (
    <DemoFrame
      status="实线表示较快响应，虚线表示较慢响应；竖虚线表示当前时刻"
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      sliders={[
        { label: "电阻", symbol: "R", value: R, min: 0.5, max: 8, step: 0.1, unit: "Ω", onChange: setR },
        { label: "惯量", symbol: "J", value: J, min: 0.02, max: 1, step: 0.02, unit: "kg·m²", onChange: setJ },
        { label: "电机常数", symbol: "k", value: k, min: 0.5, max: 3, step: 0.1, unit: "", onChange: setK },
        { label: "电感", symbol: "L", value: L, min: 0.02, max: 1, step: 0.02, unit: "H", onChange: setL }
      ]}
      readouts={
        <>
          <Readout label="τ=RJ/k²" value={tau} unit="s" tone="green" />
          <Readout label="Ta=L/R" value={ta} unit="s" tone="blue" />
        </>
      }
    >
      <svg className="time-constant-book-svg" viewBox="0 0 1040 520" role="img" aria-label="时间常数对响应速度的影响">
        <defs>
          <marker id="tc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" className="book-arrow-head" />
          </marker>
        </defs>
        <rect x="34" y="34" width="972" height="452" rx="8" className="book-figure-panel" />
        <text x="520" y="72" textAnchor="middle" className="book-title">时间常数越大，响应越慢</text>

        <g aria-label="机械时间常数对比">
          <rect x="70" y="104" width="420" height="300" rx="6" className="book-subpanel" />
          <text x="280" y="140" textAnchor="middle" className="book-title">机械响应：J 与 k</text>
          <line x1="116" y1="332" x2="456" y2="332" className="book-axis" markerEnd="url(#tc-arrow)" />
          <line x1="116" y1="332" x2="116" y2="166" className="book-axis" markerEnd="url(#tc-arrow)" />
          <text x="108" y="176" textAnchor="end" className="book-axis-label">ω</text>
          <text x="448" y="358" textAnchor="end" className="book-axis-label">t</text>
          <path d={risePath(116, 332, 318, 138, mechFast)} className="book-speed-curve" />
          <path d={risePath(116, 332, 318, 138, mechSlow)} className="book-slow-curve" />
          <line x1={116 + (t / 5) * 318} y1="332" x2={116 + (t / 5) * 318} y2={332 - mechNow * 138} className="book-running-guide" />
          <circle cx={116 + (t / 5) * 318} cy={332 - mechNow * 138} r="6" className="book-live-point" />
          <text x={126 + (t / 5) * 318} y="322" className="book-small">当前时刻</text>
          <text x="148" y="196" className="book-small">小 J：快</text>
          <text x="302" y="256" className="book-small">大 J：慢</text>
        </g>

        <g aria-label="电枢时间常数对比">
          <rect x="550" y="104" width="420" height="300" rx="6" className="book-subpanel" />
          <text x="760" y="140" textAnchor="middle" className="book-title">电流响应：L 与 R</text>
          <line x1="596" y1="332" x2="936" y2="332" className="book-axis" markerEnd="url(#tc-arrow)" />
          <line x1="596" y1="332" x2="596" y2="166" className="book-axis" markerEnd="url(#tc-arrow)" />
          <text x="588" y="176" textAnchor="end" className="book-axis-label">I</text>
          <text x="928" y="358" textAnchor="end" className="book-axis-label">t</text>
          <path d={risePath(596, 332, 318, 138, elecFast)} className="book-current-curve solid" />
          <path d={risePath(596, 332, 318, 138, elecSlow)} className="book-slow-curve" />
          <line x1={596 + (t / 5) * 318} y1="332" x2={596 + (t / 5) * 318} y2={332 - elecNow * 138} className="book-running-guide" />
          <circle cx={596 + (t / 5) * 318} cy={332 - elecNow * 138} r="6" className="book-live-point" />
          <text x={606 + (t / 5) * 318} y="322" className="book-small">当前时刻</text>
          <text x="628" y="196" className="book-small">小 L：快</text>
          <text x="790" y="256" className="book-small">大 L：慢</text>
        </g>

        <g transform="translate(250 430)" aria-label="时间常数公式">
          <rect x="0" y="0" width="540" height="36" rx="6" className="book-subpanel" />
          <text x="270" y="24" textAnchor="middle" className="book-equation">τ = RJ/k²，Ta = L/R</text>
        </g>
      </svg>
    </DemoFrame>
  );
}
