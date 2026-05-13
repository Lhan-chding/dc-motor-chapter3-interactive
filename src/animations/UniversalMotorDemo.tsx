import { useState } from "react";
import { ArrowDefs, DemoFrame, MotorSketch, Plot, Readout, useDemoClock } from "./shared";

export default function UniversalMotorDemo() {
  const [playing, setPlaying] = useState(true);
  const [mode, setMode] = useState<"dc" | "ac">("ac");
  const [freq, setFreq] = useState(50);
  const { time, reset } = useDemoClock(playing, 1);
  const wave = mode === "ac" ? Math.sin(time * freq * 0.12) : 1;
  const flux = wave;
  const torque = wave * flux;
  const points = Array.from({ length: 100 }, (_, i) => {
    const x = i / 99;
    const y = mode === "ac" ? Math.sin(x * Math.PI * 4) : 1;
    return [x, y] as [number, number];
  });

  return (
    <DemoFrame
      status={mode === "ac" ? "交流下 I 与 Φ 同步反向，转矩仍保持同向" : "直流下 I 与 Φ 稳定，转矩同向输出"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      actions={
        <div className="segmented">
          <button type="button" className={mode === "dc" ? "is-active" : ""} onClick={() => setMode("dc")}>DC</button>
          <button type="button" className={mode === "ac" ? "is-active" : ""} onClick={() => setMode("ac")}>AC</button>
        </div>
      }
      sliders={[{ label: "交流频率", symbol: "f", value: freq, min: 20, max: 80, step: 5, unit: "Hz", onChange: setFreq }]}
      readouts={
        <>
          <Readout label="I" value={wave} unit="pu" tone="red" />
          <Readout label="Φ" value={flux} unit="pu" tone="blue" />
          <Readout label="T=ΦI" value={torque} unit="pu" tone="green" />
        </>
      }
    >
      <div className="demo-split">
        <MotorSketch angle={time * 90} current={wave} phi={Math.abs(flux)} torque={Math.max(0.1, torque)} />
        <div>
          <Plot points={points} marker={[((time * freq * 0.06) % 1), wave]} xLabel="t" yLabel="I,Φ" color="red" />
          <svg className="mini-wave-svg" viewBox="0 0 360 90" role="img" aria-label="转矩始终同向">
            <ArrowDefs />
            <line x1="34" y1="64" x2="330" y2="64" className="axis-line" />
            <path d={Array.from({ length: 100 }, (_, i) => {
              const x = 34 + i * 3;
              const y = 64 - Math.abs(Math.sin((i / 99) * Math.PI * 4)) * 46;
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            }).join(" ")} className="plot-line plot-line--green" />
          </svg>
        </div>
      </div>
    </DemoFrame>
  );
}
