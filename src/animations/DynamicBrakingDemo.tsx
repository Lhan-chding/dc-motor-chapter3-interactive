import { useState } from "react";
import { copperLoss } from "../utils/motorMath";
import { CircuitSketch, DemoFrame, Readout, useDemoClock } from "./shared";

export default function DynamicBrakingDemo() {
  const [playing, setPlaying] = useState(true);
  const [mode, setMode] = useState<"run" | "brake">("brake");
  const [speed, setSpeed] = useState(140);
  const [k, setK] = useState(1.5);
  const [Rb, setRb] = useState(6);
  const { time, reset } = useDemoClock(playing, 1);
  const decay = mode === "brake" ? Math.exp(-time / Math.max(1, Rb / 2)) : 1;
  const E = k * speed * decay;
  const I = mode === "brake" ? -E / Rb : 18;
  const heat = copperLoss(Math.abs(I), Rb);

  return (
    <DemoFrame
      status={mode === "brake" ? "电机发电，能量在制动电阻中变成热" : "接电源运行，电机输出机械功率"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      actions={
        <div className="segmented">
          <button type="button" className={mode === "run" ? "is-active" : ""} onClick={() => setMode("run")}>接电源</button>
          <button type="button" className={mode === "brake" ? "is-active" : ""} onClick={() => setMode("brake")}>接制动电阻</button>
        </div>
      }
      sliders={[
        { label: "初始转速", symbol: "ω0", value: speed, min: 20, max: 260, step: 5, unit: "rad/s", onChange: setSpeed },
        { label: "电机常数", symbol: "k", value: k, min: 0.5, max: 3, step: 0.1, unit: "", onChange: setK },
        { label: "制动电阻", symbol: "Rb", value: Rb, min: 1, max: 20, step: 0.5, unit: "Ω", onChange: setRb }
      ]}
      readouts={
        <>
          <Readout label="PR=I²Rb" value={heat} unit="W" tone="amber" />
          <Readout label="转速" value={speed * decay} unit="rad/s" tone="green" />
        </>
      }
    >
      <CircuitSketch V={mode === "run" ? 220 : 0} E={E} current={I} braking={mode === "brake"} />
    </DemoFrame>
  );
}
