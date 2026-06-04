import { useState } from "react";
import { maxTheoreticalPower } from "../utils/motorMath";
import { DemoFrame, Readout } from "./shared";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parabolaPath(width: number, height: number) {
  return Array.from({ length: 90 }, (_, index) => {
    const x = index / 89;
    const y = 4 * x * (1 - x);
    const px = 70 + x * width;
    const py = 300 - y * height;
    return `${index === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`;
  }).join(" ");
}

export default function MaxPowerDemo() {
  const [playing, setPlaying] = useState(true);
  const [V, setV] = useState(240);
  const [R, setR] = useState(2);
  const [speedFrac, setSpeedFrac] = useState(0.5);
  const pmax = maxTheoreticalPower(V, R);
  const power = 4 * pmax * speedFrac * (1 - speedFrac);
  const E = V * speedFrac;
  const I = (V - E) / R;
  const torqueRatio = 1 - speedFrac;
  const nearMax = Math.abs(speedFrac - 0.5) < 0.04;
  const markerX = 70 + speedFrac * 400;
  const markerY = 300 - clamp(power / Math.max(pmax, 1), 0, 1) * 210;

  return (
    <DemoFrame
      status={nearMax ? "最大功率点：E=V/2，电流仍很大，不宜长期运行" : "功率由转速和电流共同决定，两端功率都接近零"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => {
        setV(240);
        setR(2);
        setSpeedFrac(0.5);
      }}
      actions={
        <div className="segmented">
          <button type="button" className={speedFrac < 0.05 ? "is-active" : ""} onClick={() => setSpeedFrac(0)}>
            堵转
          </button>
          <button type="button" className={nearMax ? "is-active" : ""} onClick={() => setSpeedFrac(0.5)}>
            最大点
          </button>
          <button type="button" className={speedFrac > 0.95 ? "is-active" : ""} onClick={() => setSpeedFrac(1)}>
            空载
          </button>
        </div>
      }
      sliders={[
        { label: "电枢电压", symbol: "V", value: V, min: 60, max: 500, step: 10, unit: "V", onChange: setV },
        { label: "电枢电阻", symbol: "R", value: R, min: 0.3, max: 10, step: 0.1, unit: "Ω", onChange: setR },
        { label: "速度比例", symbol: "ω/ω0", value: speedFrac, min: 0, max: 1, step: 0.01, unit: "", onChange: setSpeedFrac }
      ]}
      readouts={
        <>
          <Readout label="Pmax" value={pmax} unit="W" tone="amber" />
          <Readout label="E" value={E} unit="V" tone="purple" />
          <Readout label="I" value={I} unit="A" tone="red" />
          <Readout label="当前 P" value={power} unit="W" tone="green" />
        </>
      }
    >
      <svg className="max-power-book-svg" viewBox="0 0 1040 520" role="img" aria-label="最大输出功率线稿推导图">
        <defs>
          <marker id="max-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" className="book-arrow-head" />
          </marker>
        </defs>
        <rect x="34" y="34" width="972" height="452" rx="8" className="book-figure-panel" />

        <g transform="translate(58 56)" aria-label="功率关系推导">
          <rect x="0" y="0" width="432" height="404" rx="6" className="book-subpanel" />
          <text x="216" y="38" textAnchor="middle" className="book-title">为什么中间最大</text>
          <text x="58" y="92" className="book-equation">P = EI</text>
          <text x="58" y="132" className="book-equation">E = V · ω/ω0</text>
          <text x="58" y="172" className="book-equation">I = (V - E) / R</text>

          <line x1="58" y1="230" x2="366" y2="230" className="book-axis" markerEnd="url(#max-arrow)" />
          <text x="58" y="216" className="book-small">电压分配</text>
          <rect x="58" y="246" width="308" height="22" className="book-bar" />
          <rect x="58" y="246" width={308 * speedFrac} height="22" className="book-bar-fill" />
          <line x1={58 + 308 * speedFrac} y1="240" x2={58 + 308 * speedFrac} y2="276" className="book-guide" />
          <text x="58" y="300" className="book-small">E：随转速升高</text>
          <text x="250" y="300" className="book-small">V-E：决定电流</text>

          <g transform="translate(58 330)">
            <rect width="98" height="40" rx="4" className="book-stage" />
            <rect x="114" width="98" height="40" rx="4" className={nearMax ? "book-stage is-active" : "book-stage"} />
            <rect x="228" width="98" height="40" rx="4" className="book-stage" />
            <text x="49" y="25" textAnchor="middle" className="book-stage-text">堵转</text>
            <text x="163" y="25" textAnchor="middle" className="book-stage-text">E=V/2</text>
            <text x="277" y="25" textAnchor="middle" className="book-stage-text">空载</text>
          </g>
        </g>

        <g transform="translate(518 56)" aria-label="功率转速曲线">
          <rect x="0" y="0" width="462" height="404" rx="6" className="book-subpanel" />
          <text x="230" y="38" textAnchor="middle" className="book-title">功率-转速曲线</text>
          <line x1="70" y1="300" x2="492" y2="300" className="book-axis" markerEnd="url(#max-arrow)" />
          <line x1="70" y1="300" x2="70" y2="72" className="book-axis" markerEnd="url(#max-arrow)" />
          <text x="492" y="328" textAnchor="end" className="book-axis-label">ω/ω0</text>
          <text x="44" y="82" className="book-axis-label">P</text>
          <path d={parabolaPath(400, 210)} className="book-power-curve" />
          <line x1="270" y1="300" x2="270" y2="90" className="book-guide" />
          <line x1="70" y1="90" x2="270" y2="90" className="book-guide" />
          <circle cx="270" cy="90" r="7" className="book-point" />
          <text x="282" y="82" className="book-small">Pmax</text>
          <circle cx={markerX} cy={markerY} r="7" className="book-live-point" />
          <line x1={markerX} y1="300" x2={markerX} y2={markerY} className="book-running-guide" />
          <line x1="70" y1={markerY} x2={markerX} y2={markerY} className="book-running-guide" />
          <text x="244" y="330" textAnchor="middle" className="book-small">0.5</text>
          <text x="398" y="118" className="book-note">半空载转速附近</text>
        </g>

        <text x="520" y="486" textAnchor="middle" className="book-note">
          转速升高使 E 增大，但 V-E 变小；两者相乘在中间达到最大
        </text>
      </svg>
    </DemoFrame>
  );
}
