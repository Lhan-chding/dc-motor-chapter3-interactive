import { useState } from "react";
import { armatureTimeConstant, electromechanicalTimeConstant } from "../utils/motorMath";
import { DemoFrame, Plot, Readout, useDemoClock } from "./shared";

export default function TimeConstantExplorer() {
  const [playing, setPlaying] = useState(true);
  const [R, setR] = useState(2);
  const [J, setJ] = useState(0.18);
  const [k, setK] = useState(1.2);
  const [L, setL] = useState(0.2);
  const { reset } = useDemoClock(playing, 1);
  const tau = electromechanicalTimeConstant(R, J, k);
  const ta = armatureTimeConstant(L, R);
  const fastMech = Array.from({ length: 80 }, (_, i) => [i / 79, 1 - Math.exp(-(i / 79) * 5 / Math.max(0.2, tau))] as [number, number]);
  const slowMech = Array.from({ length: 80 }, (_, i) => [i / 79, 1 - Math.exp(-(i / 79) * 5 / Math.max(0.2, tau * 2.2))] as [number, number]);
  const fastElec = Array.from({ length: 80 }, (_, i) => [i / 79, 1 - Math.exp(-(i / 79) * 5 / Math.max(0.03, ta))] as [number, number]);
  const slowElec = Array.from({ length: 80 }, (_, i) => [i / 79, 1 - Math.exp(-(i / 79) * 5 / Math.max(0.03, ta * 2.2))] as [number, number]);

  return (
    <DemoFrame
      status="对比曲线显示：J 控制机械慢快，L 控制电流慢快"
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
      <div className="demo-split">
        <div>
          <Plot points={fastMech} xLabel="t" yLabel="小J" color="green" />
          <Plot points={slowMech} xLabel="t" yLabel="大J" color="amber" />
        </div>
        <div>
          <Plot points={fastElec} xLabel="t" yLabel="小L" color="blue" />
          <Plot points={slowElec} xLabel="t" yLabel="大L" color="purple" />
        </div>
      </div>
    </DemoFrame>
  );
}
