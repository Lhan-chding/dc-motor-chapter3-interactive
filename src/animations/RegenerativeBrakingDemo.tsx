import { useState } from "react";
import { steadyCurrent } from "../utils/motorMath";
import { CircuitSketch, DemoFrame, ProcessChain, Readout, useDemoClock } from "./shared";

export default function RegenerativeBrakingDemo() {
  const [playing, setPlaying] = useState(true);
  const [V, setV] = useState(220);
  const [E, setE] = useState(260);
  const [R, setR] = useState(2);
  const { reset } = useDemoClock(playing, 1);
  const I = steadyCurrent(V, E, R);
  const regen = I < 0;

  return (
    <DemoFrame
      status={regen ? "E>V：电流反向，动能经电机回到电源" : "V>E：仍是正转电动运行"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      actions={<button type="button" className="pill-button" onClick={() => setV(Math.max(0, E - 60))}>降低端电压</button>}
      sliders={[
        { label: "端电压", symbol: "V", value: V, min: 0, max: 320, step: 10, unit: "V", onChange: setV },
        { label: "反电动势", symbol: "E", value: E, min: 0, max: 360, step: 10, unit: "V", onChange: setE },
        { label: "电阻", symbol: "R", value: R, min: 0.5, max: 8, step: 0.1, unit: "Ω", onChange: setR }
      ]}
      readouts={
        <>
          <Readout label="I" value={I} unit="A" tone={regen ? "purple" : "red"} />
          <Readout label="运行" value={regen ? "再生" : "电动"} tone={regen ? "purple" : "green"} />
        </>
      }
    >
      <CircuitSketch V={V} E={E} current={I} />
      <ProcessChain nodes={regen ? ["机械能", "电机", "电源/电池"] : ["电源", "电机", "机械输出"]} activeIndex={2} />
    </DemoFrame>
  );
}
