import { useState } from "react";
import { convertedPower, copperLoss } from "../utils/motorMath";
import { percent } from "../utils/format";
import { ArrowDefs, DemoFrame, Readout, useDemoClock } from "./shared";

export default function PerformanceCalculatorDemo() {
  const [playing, setPlaying] = useState(true);
  const [V, setV] = useState(240);
  const [R, setR] = useState(1.2);
  const [I, setI] = useState(28);
  const [k, setK] = useState(1.8);
  const [loss, setLoss] = useState(450);
  const { reset } = useDemoClock(playing, 1);
  const E = V - I * R;
  const omega = E / k;
  const pin = V * I;
  const pcu = copperLoss(I, R);
  const pconv = convertedPower(E, I);
  const pout = Math.max(0, pconv - loss);
  const efficiency = pin > 0 ? pout / pin : 0;

  return (
    <DemoFrame
      status="输入功率沿能量流分成铜耗、转换功率和轴输出"
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      sliders={[
        { label: "电压", symbol: "V", value: V, min: 80, max: 400, step: 10, unit: "V", onChange: setV },
        { label: "电阻", symbol: "R", value: R, min: 0.2, max: 5, step: 0.1, unit: "Ω", onChange: setR },
        { label: "电流", symbol: "I", value: I, min: 1, max: 100, step: 1, unit: "A", onChange: setI },
        { label: "电机常数", symbol: "k", value: k, min: 0.5, max: 4, step: 0.1, unit: "", onChange: setK },
        { label: "机械损耗", symbol: "loss", value: loss, min: 0, max: 2000, step: 50, unit: "W", onChange: setLoss }
      ]}
      readouts={
        <>
          <Readout label="E" value={E} unit="V" tone="purple" />
          <Readout label="ω" value={omega} unit="rad/s" tone="green" />
          <Readout label="η" value={percent(efficiency)} tone="blue" />
        </>
      }
    >
      <svg className="sankey-svg" viewBox="0 0 760 310" role="img" aria-label="直流电机能量流仪表盘">
        <ArrowDefs />
        <rect x="44" y="92" width="140" height="72" rx="18" className="flow-box flow-box--blue" />
        <text x="114" y="122" textAnchor="middle" className="svg-label">输入 VI</text>
        <text x="114" y="150" textAnchor="middle" className="svg-axis-label">{Math.round(pin)} W</text>
        <path d="M 184 128 H 292" className="flow-line" markerEnd="url(#arrow-green)" />
        <rect x="292" y="92" width="150" height="72" rx="18" className="flow-box flow-box--purple" />
        <text x="367" y="122" textAnchor="middle" className="svg-label">转换 EI</text>
        <text x="367" y="150" textAnchor="middle" className="svg-axis-label">{Math.round(pconv)} W</text>
        <path d="M 442 128 H 550" className="flow-line" markerEnd="url(#arrow-green)" />
        <rect x="550" y="92" width="150" height="72" rx="18" className="flow-box flow-box--green" />
        <text x="625" y="122" textAnchor="middle" className="svg-label">轴输出</text>
        <text x="625" y="150" textAnchor="middle" className="svg-axis-label">{Math.round(pout)} W</text>
        <path d="M 248 128 C 258 214, 322 232, 384 232" className="loss-line" markerEnd="url(#arrow-amber)" />
        <rect x="384" y="210" width="128" height="50" rx="14" className="flow-box flow-box--amber" />
        <text x="448" y="242" textAnchor="middle" className="svg-axis-label">铜耗 {Math.round(pcu)}W</text>
        <path d="M 500 128 C 514 198, 562 218, 620 224" className="loss-line" markerEnd="url(#arrow-amber)" />
        <text x="624" y="248" textAnchor="middle" className="svg-axis-label">机械损耗</text>
      </svg>
    </DemoFrame>
  );
}
