import { useMemo, useState } from "react";
import { armatureTimeConstant, electromechanicalTimeConstant, solveDcMotorTransient } from "../utils/motorMath";
import { formatNumber } from "../utils/format";
import { DemoFrame, Readout, useDemoClock } from "./shared";

type Plot = {
  x: number;
  y: number;
  w: number;
  h: number;
};

const SPEED_PLOT: Plot = { x: 86, y: 104, w: 390, h: 200 };
const CURRENT_PLOT: Plot = { x: 586, y: 104, w: 390, h: 200 };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function xAt(plot: Plot, time: number, duration: number) {
  return plot.x + clamp(time / Math.max(duration, 1e-6), 0, 1) * plot.w;
}

function yAt(value: number, min: number, max: number, plot: Plot) {
  const span = Math.max(max - min, 1e-6);
  return plot.y + plot.h - clamp((value - min) / span, 0, 1) * plot.h;
}

function pathFromSamples(
  samples: Array<{ time: number; value: number }>,
  plot: Plot,
  duration: number,
  min: number,
  max: number
) {
  return samples
    .map((sample, index) => {
      const x = xAt(plot, sample.time, duration);
      const y = yAt(sample.value, min, max, plot);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function nearestSample<T extends { time: number }>(samples: T[], time: number): T {
  return samples.reduce((best, sample) => (Math.abs(sample.time - time) < Math.abs(best.time - time) ? sample : best), samples[0]);
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
  const initialSpeed = V1 / k;
  const finalSpeed = V2 / k;
  const duration = Math.max(0.8, 5 * Math.max(tau, ta));
  const samples = useMemo(() => {
    return solveDcMotorTransient({
      voltage: V2,
      resistance: R,
      motorConstant: k,
      inductance: L,
      inertia: J,
      initialCurrent: 0,
      initialOmega: initialSpeed,
      duration,
      dt: Math.min(0.004, duration / 1400),
      sampleInterval: duration / 150,
      loadTorque: () => 0
    });
  }, [V2, R, k, L, J, initialSpeed, duration]);
  const elapsed = playing ? Math.min(time, duration) : 0;
  const currentSample = nearestSample(samples, elapsed);
  const speed = currentSample.omega;
  const current = currentSample.current;
  const currentPeak = samples.reduce((peak, sample) => Math.max(peak, Math.abs(sample.current)), 1);
  const speedPeak = samples.reduce((peak, sample) => Math.max(peak, sample.omega), Math.max(initialSpeed, finalSpeed, 0));
  const speedFloor = Math.min(0, initialSpeed, finalSpeed, ...samples.map((sample) => sample.omega));
  const speedMax = Math.max(speedPeak * 1.08, 1);
  const speedMin = speedFloor < 0 ? speedFloor * 1.08 : 0;
  const currentMax = currentPeak * 1.14;
  const currentMin = -currentMax;
  const speedPath = pathFromSamples(samples.map((sample) => ({ time: sample.time, value: sample.omega })), SPEED_PLOT, duration, speedMin, speedMax);
  const currentPath = pathFromSamples(samples.map((sample) => ({ time: sample.time, value: sample.current })), CURRENT_PLOT, duration, currentMin, currentMax);
  const speedX = xAt(SPEED_PLOT, elapsed, duration);
  const speedY = yAt(speed, speedMin, speedMax, SPEED_PLOT);
  const currentX = xAt(CURRENT_PLOT, elapsed, duration);
  const currentY = yAt(current, currentMin, currentMax, CURRENT_PLOT);
  const currentZeroY = yAt(0, currentMin, currentMax, CURRENT_PLOT);
  const initialSpeedY = yAt(initialSpeed, speedMin, speedMax, SPEED_PLOT);
  const finalSpeedY = yAt(finalSpeed, speedMin, speedMax, SPEED_PLOT);
  const isDone = playing && elapsed >= duration;
  const stepDirection = V2 >= V1 ? "升速" : "降速";

  return (
    <DemoFrame
      status={playing ? `电压阶跃${stepDirection}：两条曲线由耦合方程积分得到` : "点击电压阶跃：观察电流先建立，转速后变化"}
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
        <text x="520" y="72" textAnchor="middle" className="book-title">电压阶跃后的耦合响应</text>

        <g aria-label="转速响应">
          <line x1={SPEED_PLOT.x} y1={SPEED_PLOT.y + SPEED_PLOT.h} x2={SPEED_PLOT.x + SPEED_PLOT.w + 22} y2={SPEED_PLOT.y + SPEED_PLOT.h} className="book-axis" markerEnd="url(#transient-arrow)" />
          <line x1={SPEED_PLOT.x} y1={SPEED_PLOT.y + SPEED_PLOT.h} x2={SPEED_PLOT.x} y2={SPEED_PLOT.y - 16} className="book-axis" markerEnd="url(#transient-arrow)" />
          <text x={SPEED_PLOT.x - 6} y={SPEED_PLOT.y - 12} textAnchor="end" className="book-axis-label">ω</text>
          <text x={SPEED_PLOT.x + SPEED_PLOT.w + 12} y={SPEED_PLOT.y + SPEED_PLOT.h + 28} textAnchor="end" className="book-axis-label">t/s</text>
          {[1, 2, 3, 4, 5].map((n) => {
            const guideTime = n * tau;
            const x = xAt(SPEED_PLOT, guideTime, duration);
            if (guideTime > duration) return null;
            return (
              <g key={n}>
                <line x1={x} y1={SPEED_PLOT.y + SPEED_PLOT.h} x2={x} y2={SPEED_PLOT.y} className={n === 5 ? "book-guide" : "book-guide faint"} />
                <text x={x} y={SPEED_PLOT.y + SPEED_PLOT.h + 26} textAnchor="middle" className="book-small">{n}τ</text>
              </g>
            );
          })}
          <line x1={SPEED_PLOT.x} y1={initialSpeedY} x2={SPEED_PLOT.x + SPEED_PLOT.w} y2={initialSpeedY} className="book-guide faint" />
          <line x1={SPEED_PLOT.x} y1={finalSpeedY} x2={SPEED_PLOT.x + SPEED_PLOT.w} y2={finalSpeedY} className="book-guide" />
          <path d={speedPath} className="book-speed-curve" />
          <circle cx={speedX} cy={speedY} r="7" className="book-live-point" />
          <text x="222" y="116" className="book-note">J 限制转速斜率</text>
          <text x={SPEED_PLOT.x + SPEED_PLOT.w - 72} y={finalSpeedY - 8} className="book-small">ω₂=V₂/k</text>
          <text x={SPEED_PLOT.x + 18} y={initialSpeedY - 8} className="book-small">ω₁=V₁/k</text>
        </g>

        <g aria-label="电流响应">
          <line x1={CURRENT_PLOT.x} y1={currentZeroY} x2={CURRENT_PLOT.x + CURRENT_PLOT.w + 22} y2={currentZeroY} className="book-axis" markerEnd="url(#transient-arrow)" />
          <line x1={CURRENT_PLOT.x} y1={CURRENT_PLOT.y + CURRENT_PLOT.h} x2={CURRENT_PLOT.x} y2={CURRENT_PLOT.y - 16} className="book-axis" markerEnd="url(#transient-arrow)" />
          <text x={CURRENT_PLOT.x - 6} y={CURRENT_PLOT.y - 12} textAnchor="end" className="book-axis-label">I</text>
          <text x={CURRENT_PLOT.x + CURRENT_PLOT.w + 12} y={currentZeroY + 28} textAnchor="end" className="book-axis-label">t/s</text>
          {[1, 2, 3, 4, 5].map((n) => {
            const guideTime = n * ta;
            const x = xAt(CURRENT_PLOT, guideTime, duration);
            if (guideTime > duration) return null;
            return (
              <g key={n}>
                <line x1={x} y1={CURRENT_PLOT.y + CURRENT_PLOT.h} x2={x} y2={CURRENT_PLOT.y} className={n === 5 ? "book-guide" : "book-guide faint"} />
                <text x={x} y={currentZeroY + 26} textAnchor="middle" className="book-small">{n}Ta</text>
              </g>
            );
          })}
          <path d={currentPath} className="book-current-curve solid" />
          <circle cx={currentX} cy={currentY} r="7" className="book-live-point" />
          <text x="716" y="116" className="book-note">L 限制电流斜率</text>
          <text x={CURRENT_PLOT.x + CURRENT_PLOT.w - 136} y={CURRENT_PLOT.y + 18} className="book-small">稳态无载 I→0</text>
        </g>

        <g transform="translate(250 384)" aria-label="时间常数提示">
          <rect x="0" y="0" width="540" height="72" rx="6" className="book-subpanel" />
          <text x="270" y="22" textAnchor="middle" className="book-equation">L dI/dt = V₂ - RI - kω，J dω/dt = kI</text>
          <text x="270" y="44" textAnchor="middle" className="book-note">τ=RJ/k²、Ta=L/R 只作参考刻度</text>
          <text x="270" y="64" textAnchor="middle" className="book-note">
            t={formatNumber(elapsed, 2)}s / {formatNumber(duration, 2)}s{isDone ? "，接近新稳态" : ""}
          </text>
        </g>
      </svg>
    </DemoFrame>
  );
}
