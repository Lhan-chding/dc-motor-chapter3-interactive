import { useState } from "react";
import { armatureTimeConstant, electromechanicalTimeConstant } from "../utils/motorMath";
import { DemoFrame, Readout, useDemoClock } from "./shared";

function responsePath(kind: "rise" | "decay", x0: number, y0: number, width: number, height: number, scale = 1) {
  return Array.from({ length: 110 }, (_, index) => {
    const t = (index / 109) * 5;
    const value = kind === "rise" ? 1 - Math.exp(-t) : Math.exp(-t * scale);
    const x = x0 + (t / 5) * width;
    const y = y0 - value * height;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

export default function TransientResponseDemo() {
  const [playing, setPlaying] = useState(false);
  const [V1, setV1] = useState(0);
  const [V2, setV2] = useState(240);
  const [R, setR] = useState(2);
  const [k, setK] = useState(1.4);
  const [J, setJ] = useState(0.18);
  const [L, setL] = useState(0.25);
  const { time, reset } = useDemoClock(playing, 1);
  const tau = electromechanicalTimeConstant(R, J, k);
  const ta = armatureTimeConstant(L, R);
  const tTau = Math.min(5, time / Math.max(0.05, tau));
  const tTa = Math.min(5, time / Math.max(0.03, ta));
  const finalSpeed = V2 / k;
  const speed = finalSpeed * (1 - Math.exp(-tTau));
  const startCurrent = (V2 - V1) / R;
  const current = startCurrent * Math.exp(-time / Math.max(0.03, ta));
  const speedX = 86 + (tTau / 5) * 390;
  const speedY = 304 - (1 - Math.exp(-tTau)) * 190;
  const currentX = 586 + (tTa / 5) * 390;
  const currentY = 304 - Math.exp(-tTa * tau / Math.max(0.03, ta)) * 190;

  return (
    <DemoFrame
      status={playing ? "电压阶跃后：电流先变，转速按时间常数逼近稳态" : "点击电压阶跃，观察 1τ 到 5τ"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => {
        reset();
        setPlaying(false);
      }}
      actions={
        <button
          type="button"
          className="pill-button"
          onClick={() => {
            reset();
            setPlaying(true);
          }}
        >
          电压阶跃
        </button>
      }
      sliders={[
        { label: "初始电压", symbol: "V1", value: V1, min: 0, max: 300, step: 10, unit: "V", onChange: setV1 },
        { label: "阶跃电压", symbol: "V2", value: V2, min: 60, max: 400, step: 10, unit: "V", onChange: setV2 },
        { label: "电阻", symbol: "R", value: R, min: 0.5, max: 8, step: 0.1, unit: "Ω", onChange: setR },
        { label: "电机常数", symbol: "k", value: k, min: 0.5, max: 3, step: 0.1, unit: "", onChange: setK },
        { label: "惯量", symbol: "J", value: J, min: 0.02, max: 1, step: 0.02, unit: "kg·m²", onChange: setJ },
        { label: "电感", symbol: "L", value: L, min: 0.02, max: 1, step: 0.02, unit: "H", onChange: setL }
      ]}
      readouts={
        <>
          <Readout label="τ" value={tau} unit="s" tone="green" />
          <Readout label="Ta" value={ta} unit="s" tone="blue" />
          <Readout label="当前ω" value={speed} unit="rad/s" tone="green" />
          <Readout label="当前I" value={current} unit="A" tone="red" />
        </>
      }
    >
      <svg className="transient-book-svg" viewBox="0 0 1040 520" role="img" aria-label="直流电机瞬态响应线稿图">
        <defs>
          <marker id="transient-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" className="book-arrow-head" />
          </marker>
        </defs>
        <rect x="34" y="34" width="972" height="452" rx="8" className="book-figure-panel" />
        <text x="520" y="72" textAnchor="middle" className="book-title">电压阶跃后的两个时间尺度</text>

        <g aria-label="转速响应">
          <line x1="86" y1="304" x2="498" y2="304" className="book-axis" markerEnd="url(#transient-arrow)" />
          <line x1="86" y1="304" x2="86" y2="88" className="book-axis" markerEnd="url(#transient-arrow)" />
          <text x="80" y="92" textAnchor="end" className="book-axis-label">ω</text>
          <text x="490" y="332" textAnchor="end" className="book-axis-label">t/τ</text>
          {[1, 2, 3, 4, 5].map((n) => {
            const x = 86 + (n / 5) * 390;
            return (
              <g key={n}>
                <line x1={x} y1="304" x2={x} y2="104" className={n === 5 ? "book-guide" : "book-guide faint"} />
                <text x={x} y="330" textAnchor="middle" className="book-small">{n}τ</text>
              </g>
            );
          })}
          <path d={responsePath("rise", 86, 304, 390, 190)} className="book-speed-curve" />
          <circle cx={speedX} cy={speedY} r="7" className="book-live-point" />
          <text x="240" y="116" className="book-note">转速不能瞬间变化</text>
        </g>

        <g aria-label="电流响应">
          <line x1="586" y1="304" x2="998" y2="304" className="book-axis" markerEnd="url(#transient-arrow)" />
          <line x1="586" y1="304" x2="586" y2="88" className="book-axis" markerEnd="url(#transient-arrow)" />
          <text x="580" y="92" textAnchor="end" className="book-axis-label">I</text>
          <text x="990" y="332" textAnchor="end" className="book-axis-label">t/Ta</text>
          {[1, 2, 3, 4, 5].map((n) => {
            const x = 586 + (n / 5) * 390;
            return (
              <g key={n}>
                <line x1={x} y1="304" x2={x} y2="104" className={n === 5 ? "book-guide" : "book-guide faint"} />
                <text x={x} y="330" textAnchor="middle" className="book-small">{n}Ta</text>
              </g>
            );
          })}
          <path d={responsePath("decay", 586, 304, 390, 190, tau / Math.max(0.03, ta))} className="book-current-curve" />
          <circle cx={currentX} cy={currentY} r="7" className="book-live-point" />
          <text x="722" y="116" className="book-note">电流受电感限制</text>
        </g>

        <g transform="translate(250 384)" aria-label="时间常数提示">
          <rect x="0" y="0" width="540" height="58" rx="6" className="book-subpanel" />
          <text x="270" y="24" textAnchor="middle" className="book-equation">τ = RJ/k²，Ta = L/R</text>
          <text x="270" y="44" textAnchor="middle" className="book-note">约 4~5 个时间常数后，工程上可认为接近稳态</text>
        </g>
      </svg>
    </DemoFrame>
  );
}
