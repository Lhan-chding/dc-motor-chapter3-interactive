import { useState } from "react";
import { DemoFrame, Plot, Readout, useDemoClock } from "./shared";

export default function SelfExcitationDemo() {
  const [playing, setPlaying] = useState(true);
  const [Rf, setRf] = useState(90);
  const [residualFlux, setResidualFlux] = useState(0.14);
  const { reset } = useDemoClock(playing, 1);
  const curve = Array.from({ length: 80 }, (_, i) => {
    const ifield = (i / 79) * 4;
    const e = residualFlux * 90 + 260 * (1 - Math.exp(-ifield / 1.2));
    return [ifield, e] as [number, number];
  });
  const line = Array.from({ length: 80 }, (_, i) => {
    const ifield = (i / 79) * 4;
    return [ifield, Rf * ifield] as [number, number];
  });
  const operatingIf = residualFlux <= 0.01 || Rf > 150 ? 0 : Math.max(0.2, (220 - residualFlux * 90) / Rf);
  const success = operatingIf > 0;

  return (
    <DemoFrame
      status={success ? "磁化曲线与励磁电阻线相交，建立稳定电压" : "自励失败：剩磁不足或电阻线太陡"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      sliders={[
        { label: "励磁电阻", symbol: "Rf", value: Rf, min: 40, max: 220, step: 5, unit: "Ω", onChange: setRf },
        { label: "剩磁", symbol: "Φr", value: residualFlux, min: 0, max: 0.4, step: 0.02, unit: "pu", onChange: setResidualFlux }
      ]}
      readouts={
        <>
          <Readout label="自励" value={success ? "成功" : "失败"} tone={success ? "green" : "amber"} />
          <Readout label="If" value={operatingIf} unit="A" tone="blue" />
        </>
      }
    >
      <div className="demo-split">
        <Plot points={curve} marker={[operatingIf, success ? Rf * operatingIf : residualFlux * 90]} xLabel="If" yLabel="E" color="purple" />
        <Plot points={line} marker={[operatingIf, Rf * operatingIf]} xLabel="If" yLabel="RfIf" color={success ? "green" : "amber"} />
      </div>
    </DemoFrame>
  );
}
