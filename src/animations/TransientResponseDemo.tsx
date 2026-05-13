import { useState } from "react";
import { armatureTimeConstant, electromechanicalTimeConstant } from "../utils/motorMath";
import { DemoFrame, Plot, Readout, useDemoClock } from "./shared";

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
  const normalizedT = Math.min(5, time / Math.max(0.05, tau));
  const speed = (V2 / k) * (1 - Math.exp(-normalizedT));
  const current = ((V2 - V1) / R) * Math.exp(-time / Math.max(0.03, ta));
  const speedPoints: Array<[number, number]> = Array.from({ length: 100 }, (_, i) => {
    const x = (i / 99) * 5;
    return [x, 1 - Math.exp(-x)] as [number, number];
  });
  const currentPoints: Array<[number, number]> = Array.from({ length: 100 }, (_, i) => {
    const x = (i / 99) * 5;
    return [x, Math.exp(-x * tau / Math.max(0.03, ta))] as [number, number];
  });

  return (
    <DemoFrame
      status={playing ? "电压阶跃后：电流先变化，转速随后逼近稳态" : "点击电压阶跃，观察 1τ 到 5τ"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => {
        reset();
        setPlaying(false);
      }}
      actions={<button type="button" className="pill-button" onClick={() => { reset(); setPlaying(true); }}>电压阶跃</button>}
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
      <div className="demo-split">
        <Plot points={speedPoints} marker={[normalizedT, Math.min(1, speed / Math.max(1, V2 / k))]} xLabel="t/τ" yLabel="ω" color="green" />
        <Plot points={currentPoints} marker={[Math.min(5, time / Math.max(0.03, ta)), Math.max(0, current / Math.max(1, (V2 - V1) / R))]} xLabel="t/Ta" yLabel="I" color="red" />
      </div>
      <div className="zone-labels">
        <span>1τ</span>
        <span>2τ</span>
        <span>3τ</span>
        <span>4～5τ 近稳态</span>
      </div>
    </DemoFrame>
  );
}
