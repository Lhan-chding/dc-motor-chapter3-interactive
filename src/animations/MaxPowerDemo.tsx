import { useState } from "react";
import { maxTheoreticalPower } from "../utils/motorMath";
import { ArrowDefs, DemoFrame, Plot, Readout, useDemoClock } from "./shared";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function MaxPowerDemo() {
  const [playing, setPlaying] = useState(true);
  const [V, setV] = useState(240);
  const [R, setR] = useState(2);
  const [speedFrac, setSpeedFrac] = useState(0.5);
  const { time, reset } = useDemoClock(playing, 1);
  const pmax = maxTheoreticalPower(V, R);
  const points: Array<[number, number]> = Array.from({ length: 80 }, (_, index) => {
    const x = index / 79;
    return [x, 4 * pmax * x * (1 - x)] as [number, number];
  });
  const power = 4 * pmax * speedFrac * (1 - speedFrac);
  const E = V * speedFrac;
  const I = (V - E) / R;
  const torqueRatio = 1 - speedFrac;
  const nearMax = Math.abs(speedFrac - 0.5) < 0.04;
  const wheelAngle = (time * (60 + speedFrac * 220)) % 360;

  return (
    <DemoFrame
      status={nearMax ? "最大功率点：E=V/2，电流仍很大，不宜长期运行" : "功率由转矩和转速共同决定，两端都接近零"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => {
        reset();
        setV(240);
        setR(2);
        setSpeedFrac(0.5);
      }}
      actions={
        <div className="segmented">
          <button type="button" className={speedFrac < 0.05 ? "is-active" : ""} onClick={() => setSpeedFrac(0)}>堵转</button>
          <button type="button" className={nearMax ? "is-active" : ""} onClick={() => setSpeedFrac(0.5)}>最大点</button>
          <button type="button" className={speedFrac > 0.95 ? "is-active" : ""} onClick={() => setSpeedFrac(1)}>空载</button>
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
      <div className="demo-split">
        <svg className="steady-cause-svg" viewBox="0 0 540 430" role="img" aria-label="最大输出功率的物理原因">
          <ArrowDefs />
          <rect x="20" y="22" width="500" height="384" rx="24" fill="#ffffff" stroke="var(--border)" />
          <text x="270" y="56" textAnchor="middle" className="svg-axis-label">P=EI：E 代表转速，I 代表转矩</text>
          <g transform="translate(70 92)">
            <circle cx="80" cy="80" r="64" fill="#f8fafc" stroke="#dbe3ee" strokeWidth="8" />
            <g transform={`translate(80 80) rotate(${wheelAngle})`}>
              <rect x="-7" y="-58" width="14" height="58" rx="7" fill="var(--green)" />
              <rect x="-7" y="-58" width="14" height="58" rx="7" fill="var(--green)" transform="rotate(120)" />
              <rect x="-7" y="-58" width="14" height="58" rx="7" fill="var(--green)" transform="rotate(240)" />
            </g>
            <path d="M 26 156 A 82 82 0 0 1 24 40" className="torque-arrow" markerEnd="url(#arrow-green)" opacity={0.25 + torqueRatio} />
            <text x="80" y="172" textAnchor="middle" className="svg-axis-label">ω={Math.round(speedFrac * 100)}%</text>
          </g>
          <g transform="translate(250 96)">
            {[
              ["E", speedFrac, "var(--purple)", "转速"],
              ["I", clamp(I / Math.max(V / R, 1), 0, 1), "var(--red)", "转矩电流"],
              ["P", clamp(power / Math.max(pmax, 1), 0, 1), "var(--green)", "输出功率"]
            ].map(([label, ratio, color, desc], index) => (
              <g key={label as string} transform={`translate(0 ${index * 56})`}>
                <text x="0" y="18" className="svg-axis-label">{label as string}</text>
                <rect x="42" y="2" width="178" height="18" rx="9" fill="#f1f5f9" />
                <rect x="42" y="2" width={178 * (ratio as number)} height="18" rx="9" fill={color as string} />
                <text x="236" y="18" className="svg-axis-label">{desc as string}</text>
              </g>
            ))}
          </g>
          <g transform="translate(68 302)">
            <rect width="404" height="58" rx="18" className={nearMax ? "stage-chip is-active" : "stage-chip"} />
            <text x="202" y="24" textAnchor="middle" className="stage-chip-text">E=V/2 时，速度和转矩取得折中</text>
            <text x="202" y="44" textAnchor="middle" className="chain-text">这是理论点，不是长期额定点</text>
          </g>
        </svg>
        <Plot points={points} marker={[speedFrac, power]} xLabel="ω/ω0" yLabel="P" color="amber" label="功率-转速结果曲线" />
      </div>
    </DemoFrame>
  );
}
