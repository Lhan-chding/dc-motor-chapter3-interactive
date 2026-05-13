import { useState } from "react";
import { DemoFrame, MotorSketch, Plot, Readout, useDemoClock } from "./shared";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function WeakFieldDemo() {
  const [playing, setPlaying] = useState(true);
  const [vmax, setVmax] = useState(300);
  const [imax, setImax] = useState(80);
  const [phi, setPhi] = useState(1);
  const [k, setK] = useState(1.6);
  const { time, reset } = useDemoClock(playing, 1);

  const safePhi = Math.max(phi, 0.05);
  const baseSpeed = vmax / (k * safePhi);
  const ratedSpeed = vmax / k;
  const speedGain = baseSpeed / ratedSpeed;
  const maxTorque = k * phi * imax;
  const ratedTorque = k * imax;
  const torqueRatio = clamp(maxTorque / Math.max(ratedTorque, 1), 0, 1.2);
  const torquePoints = Array.from({ length: 60 }, (_, index) => {
    const w = (index / 59) * 420;
    const t = w < 180 ? maxTorque : Math.max(20, maxTorque * 180 / Math.max(w, 1));
    return [w, t] as [number, number];
  });
  const powerPoints = torquePoints.map(([w, t]) => [w, (w * t) / 100] as [number, number]);

  return (
    <DemoFrame
      status={phi < 0.7 ? "弱磁：磁通变小，最高转速升高，但最大转矩下降" : "额定磁通：低速恒转矩，高速受电压限制"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => {
        reset();
        setVmax(300);
        setImax(80);
        setPhi(1);
        setK(1.6);
      }}
      actions={
        <div className="segmented">
          <button type="button" className={phi >= 0.9 ? "is-active" : ""} onClick={() => setPhi(1)}>额定磁通</button>
          <button type="button" className={phi < 0.7 ? "is-active" : ""} onClick={() => setPhi(0.55)}>进入弱磁</button>
        </div>
      }
      sliders={[
        { label: "最大电压", symbol: "Vmax", value: vmax, min: 120, max: 500, step: 10, unit: "V", onChange: setVmax },
        { label: "最大电流", symbol: "Imax", value: imax, min: 20, max: 160, step: 5, unit: "A", onChange: setImax },
        { label: "磁通", symbol: "Φ", value: phi, min: 0.25, max: 1.2, step: 0.05, unit: "Wb", onChange: setPhi },
        { label: "电机常数", symbol: "k", value: k, min: 0.8, max: 3, step: 0.1, unit: "", onChange: setK }
      ]}
      readouts={
        <>
          <Readout label="最高转速" value={baseSpeed} unit="rad/s" tone="green" />
          <Readout label="最大转矩" value={maxTorque} unit="N·m" tone="amber" />
          <Readout label="升速倍数" value={speedGain} unit="x" tone="purple" />
        </>
      }
    >
      <div className="demo-split">
        <div className="mechanism-stack">
          <MotorSketch angle={time * 90 * speedGain} phi={phi} current={imax / 80} torque={torqueRatio} />
          <svg className="steady-cause-svg" viewBox="0 0 520 210" role="img" aria-label="弱磁时磁通转速和转矩的变化">
            <rect x="16" y="16" width="488" height="178" rx="20" fill="#ffffff" stroke="var(--border)" />
            <text x="260" y="42" textAnchor="middle" className="svg-axis-label">电压已到上限后，只能靠减小 Φ 升速</text>
            {[
              ["Φ", phi / 1.2, "var(--blue)", "磁通"],
              ["nmax", clamp(speedGain / 2.2, 0, 1), "var(--green)", "最高转速"],
              ["Tmax", torqueRatio / 1.2, "var(--amber)", "最大转矩"]
            ].map(([label, ratio, color, desc], index) => (
              <g key={label as string} transform={`translate(54 ${68 + index * 38})`}>
                <text x="0" y="17" className="svg-axis-label">{label as string}</text>
                <rect x="72" y="2" width="268" height="18" rx="9" fill="#f1f5f9" />
                <rect x="72" y="2" width={268 * clamp(ratio as number, 0, 1)} height="18" rx="9" fill={color as string} />
                <text x="356" y="17" className="svg-axis-label">{desc as string}</text>
              </g>
            ))}
            <text x="62" y="188" className="series-rule">Φ↓ → E=kΦω 需要更高ω；Tmax=kΦImax 同时下降</text>
          </svg>
        </div>
        <div className="curve-stack">
          <Plot points={torquePoints} marker={[baseSpeed, maxTorque]} xLabel="ω" yLabel="T" color="green" label="恒转矩区和弱磁区" />
          <Plot points={powerPoints} marker={[baseSpeed, (baseSpeed * maxTorque) / 100]} xLabel="ω" yLabel="P" color="blue" label="近似恒功率区" />
        </div>
      </div>
    </DemoFrame>
  );
}
