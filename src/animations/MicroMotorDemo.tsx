import { useState } from "react";
import { ArrowDefs, DemoFrame, Readout, useDemoClock } from "./shared";

export default function MicroMotorDemo() {
  const [playing, setPlaying] = useState(true);
  const [slots, setSlots] = useState(3);
  const [skew, setSkew] = useState(false);
  const [speed, setSpeed] = useState(5200);
  const { time, reset } = useDemoClock(playing, speed / 5200);
  const ripple = (slots === 3 ? 0.36 : 0.22) * (skew ? 0.42 : 1);
  const angle = time * speed * 0.05;

  return (
    <DemoFrame
      status={skew ? "转子斜槽后，定位转矩和脉动明显减小" : "槽数少时，定位转矩和转矩脉动更明显"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      actions={<button type="button" className={skew ? "pill-button is-active" : "pill-button"} onClick={() => setSkew((value) => !value)}>转子斜槽</button>}
      sliders={[
        { label: "槽数", symbol: "Z", value: slots, min: 3, max: 5, step: 2, unit: "", onChange: setSlots },
        { label: "转速", symbol: "n", value: speed, min: 800, max: 10000, step: 200, unit: "rpm", onChange: setSpeed }
      ]}
      readouts={
        <>
          <Readout label="脉动" value={ripple} unit="pu" tone={ripple > 0.25 ? "amber" : "green"} />
          <Readout label="优先级" value="成本" tone="blue" />
        </>
      }
    >
      <svg className="micro-svg" viewBox="0 0 620 340" role="img" aria-label="微型永磁直流电机动画">
        <ArrowDefs />
        <rect x="52" y="56" width="120" height="220" rx="22" fill="#dbeafe" stroke="var(--blue)" />
        <rect x="448" y="56" width="120" height="220" rx="22" fill="#fee2e2" stroke="var(--red)" />
        <text x="112" y="92" textAnchor="middle" className="svg-label">N</text>
        <text x="508" y="92" textAnchor="middle" className="svg-label">S</text>
        <g transform={`translate(310 168) rotate(${angle})`}>
          <circle r="84" fill="#f8fafc" stroke="var(--border)" strokeWidth="8" />
          {Array.from({ length: slots }, (_, i) => {
            const a = (360 / slots) * i;
            return (
              <g key={i} transform={`rotate(${a})`}>
                <rect x="-14" y="-82" width="28" height="104" rx="10" fill={skew ? "#bfdbfe" : "#cbd5e1"} transform={skew ? "skewX(-10)" : undefined} />
              </g>
            );
          })}
          <circle r="26" fill="#fde68a" stroke="#b45309" />
        </g>
        <path d={`M 310 168 m -112 0 a 112 112 0 1 0 224 0 a 112 112 0 1 0 -224 0`} fill="none" stroke="var(--amber)" strokeWidth={6 + ripple * 8} strokeDasharray="8 18" opacity="0.55" />
        <text x="310" y="310" textAnchor="middle" className="svg-axis-label">定位转矩脉动：{ripple.toFixed(2)} pu</text>
      </svg>
    </DemoFrame>
  );
}
