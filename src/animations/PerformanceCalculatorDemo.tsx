import { useState } from "react";
import { convertedPower, copperLoss } from "../utils/motorMath";
import { formatNumber, percent } from "../utils/format";
import { DemoFrame, Readout, useDemoClock } from "./shared";

type PowerNodeProps = {
  x: number;
  y: number;
  title: string;
  value: number;
  formula: string;
};

function PowerNode({ x, y, title, value, formula }: PowerNodeProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="150" height="72" rx="8" className="performance-book-node" />
      <text x="75" y="27" textAnchor="middle" className="performance-book-title">{title}</text>
      <text x="75" y="50" textAnchor="middle" className="performance-book-value">{formatNumber(value, 0)} W</text>
      <text x="75" y="90" textAnchor="middle" className="performance-book-formula">{formula}</text>
    </g>
  );
}

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
  const validConversion = E > 0;

  return (
    <DemoFrame
      status={validConversion ? "功率先扣铜耗，再由 EI 转换并扣机械损耗" : "当前参数使 E≤0，已不适合按电动输出估算"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      sliders={[
        { label: "电压", symbol: "V", value: V, min: 80, max: 400, step: 10, unit: "V", onChange: setV },
        { label: "电阻", symbol: "R", value: R, min: 0.2, max: 5, step: 0.1, unit: "Ω", onChange: setR },
        { label: "电流", symbol: "I", value: I, min: 1, max: 100, step: 1, unit: "A", onChange: setI },
        { label: "电势常数", symbol: "k", value: k, min: 0.5, max: 4, step: 0.1, unit: "", onChange: setK },
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
      <svg className="performance-book-svg" viewBox="0 0 840 360" role="img" aria-label="直流电机性能计算功率平衡图">
        <defs>
          <marker id="performance-book-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="performance-book-arrow-head" />
          </marker>
        </defs>

        <text x="420" y="44" textAnchor="middle" className="performance-book-heading">功率平衡路径</text>
        <text x="278" y="76" textAnchor="middle" className="performance-book-equation">VI = I²R + EI</text>
        <text x="592" y="76" textAnchor="middle" className="performance-book-equation">Pout = EI - P损</text>

        <PowerNode x={56} y={118} title="电输入" value={pin} formula="VI" />
        <PowerNode x={344} y={118} title="电磁转换" value={pconv} formula="EI" />
        <PowerNode x={634} y={118} title="轴输出" value={pout} formula="Pout" />

        <path d="M 206 154 H 344" className="performance-book-main" markerEnd="url(#performance-book-arrow)" />
        <path d="M 494 154 H 634" className="performance-book-main" markerEnd="url(#performance-book-arrow)" />

        <path d="M 270 154 V 250" className="performance-book-loss" markerEnd="url(#performance-book-arrow)" />
        <rect x="190" y="258" width="160" height="54" rx="8" className="performance-book-loss-box" />
        <text x="270" y="281" textAnchor="middle" className="performance-book-loss-title">电枢铜耗</text>
        <text x="270" y="303" textAnchor="middle" className="performance-book-value">{formatNumber(pcu, 0)} W</text>

        <path d="M 560 154 V 250" className="performance-book-loss" markerEnd="url(#performance-book-arrow)" />
        <rect x="480" y="258" width="160" height="54" rx="8" className="performance-book-loss-box" />
        <text x="560" y="281" textAnchor="middle" className="performance-book-loss-title">机械损耗</text>
        <text x="560" y="303" textAnchor="middle" className="performance-book-value">{formatNumber(loss, 0)} W</text>

        <text x="270" y="232" textAnchor="middle" className="performance-book-note">先扣 I²R</text>
        <text x="560" y="232" textAnchor="middle" className="performance-book-note">再扣损耗</text>
      </svg>
    </DemoFrame>
  );
}
