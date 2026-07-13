import { useMemo, useState } from "react";
import { seriesMotorOperatingPoint } from "../utils/advancedMotorMath";
import { formatNumber } from "../utils/format";
import { DemoFrame, Readout, useDemoClock } from "./shared";

const SERIES_MODEL = { machineConstant: 1.1, fieldConstant: 0.055, saturationFlux: 0.8 } as const;
const SHUNT_MODEL = { armatureResistance: 0.55, machineConstant: 1.2, fieldResistance: 110, fieldConstant: 0.5, saturationFlux: 0.9 } as const;
const LOAD_MIN = 2;
const LOAD_MAX = 60;

function shuntOperatingPoint(voltage: number, loadTorque: number) {
  const fieldCurrent = voltage / SHUNT_MODEL.fieldResistance;
  const flux = SHUNT_MODEL.saturationFlux * Math.tanh((SHUNT_MODEL.fieldConstant * fieldCurrent) / SHUNT_MODEL.saturationFlux);
  const current = loadTorque / (SHUNT_MODEL.machineConstant * flux);
  const emf = voltage - current * SHUNT_MODEL.armatureResistance;
  return { current, flux, emf, omega: Math.max(0, emf / (SHUNT_MODEL.machineConstant * flux)) };
}

function pathFrom(points: Array<[number, number]>) {
  return points.map(([x, y], index) => `${index ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

export default function ShuntSeriesCompareDemo() {
  const [playing, setPlaying] = useState(true);
  const [voltage, setVoltage] = useState(220);
  const [loadTorque, setLoadTorque] = useState(35);
  const { time, reset } = useDemoClock(playing, 1);
  const shunt = shuntOperatingPoint(voltage, loadTorque);
  const series = seriesMotorOperatingPoint({ voltage, totalResistance: 1.8, loadTorque, ...SERIES_MODEL });
  const curves = useMemo(() => Array.from({ length: 80 }, (_, index) => {
    const torque = LOAD_MIN + (index / 79) * (LOAD_MAX - LOAD_MIN);
    return {
      torque,
      shunt: shuntOperatingPoint(voltage, torque),
      series: seriesMotorOperatingPoint({ voltage, totalResistance: 1.8, loadTorque: torque, ...SERIES_MODEL })
    };
  }), [voltage]);
  const speedMax = Math.max(...curves.flatMap((sample) => [sample.shunt.omega, sample.series.omega])) * 1.06;
  const xScale = (torque: number) => 680 + ((torque - LOAD_MIN) / (LOAD_MAX - LOAD_MIN)) * 286;
  const yScale = (speed: number) => 462 - (Math.max(0, speed) / speedMax) * 310;
  const shuntX = xScale(loadTorque);
  const shuntY = yScale(shunt.omega);
  const seriesX = xScale(loadTorque);
  const seriesY = yScale(series.omega);
  const shuntAngle = time * Math.max(20, shunt.omega * 0.45);
  const seriesAngle = time * Math.max(20, series.omega * 0.45);

  return (
    <DemoFrame
      status={series.noLoadRisk ? "同一小负载下：并励磁通仍由电源维持，串励磁通随 I 变弱并出现飞车趋势" : "并励 Φ 近似恒定、转速变化小；串励 Φ 随 I 变化、低速重载转矩能力强"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => { reset(); setPlaying(true); setVoltage(220); setLoadTorque(35); }}
      actions={<div className="segmented"><button type="button" className={loadTorque <= 8 ? "is-active" : ""} onClick={() => setLoadTorque(5)}>小负载</button><button type="button" className={loadTorque >= 50 ? "is-active" : ""} onClick={() => setLoadTorque(55)}>大负载</button></div>}
      sliders={[
        { label: "共同端电压", symbol: "V", value: voltage, min: 160, max: 300, step: 10, unit: "V", onChange: setVoltage },
        { label: "共同负载转矩", symbol: "TL", value: loadTorque, min: LOAD_MIN, max: LOAD_MAX, step: 1, unit: "N·m", onChange: setLoadTorque }
      ]}
      readouts={<><Readout label="并励 ω" value={shunt.omega} unit="rad/s" tone="blue" /><Readout label="串励 ω" value={series.omega} unit="rad/s" tone={series.noLoadRisk ? "amber" : "green"} /><Readout label="并励 Φ" value={shunt.flux} unit="Wb" tone="purple" /><Readout label="串励 Φ" value={series.flux} unit="Wb" tone="red" /></>}
    >
      <svg className="four-quadrant-book-svg advanced-book-svg" viewBox="0 0 1040 600" role="img" aria-label="并励与串励电路、因果过程及运行点对比">
        <defs><marker id="compare-book-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" className="book-arrow-head" /></marker></defs>
        <rect x="24" y="24" width="992" height="552" rx="8" className="book-figure-panel" /><text x="520" y="58" textAnchor="middle" className="book-title">图 3.14 / 3.15：并励与串励的结构差异</text>

        <g aria-label="并励和串励电路">
          <rect x="46" y="82" width="328" height="454" rx="6" className="book-subpanel" /><text x="210" y="116" textAnchor="middle" className="book-caption">电路结构</text>
          <text x="82" y="150" className="book-equation">并励</text><path d="M 82 172 H 330 M 82 276 H 330 M 82 172 V 276 M 330 172 V 276" className="book-axis" />
          <path d="M 152 172 V 194 l -10 8 l 20 12 l -20 12 l 20 12 l -10 8 V 276" className="book-axis" /><circle cx="270" cy="224" r="34" className="book-point" /><text x="270" y="230" textAnchor="middle" className="book-equation">M</text><path d="M 270 172 V 190 M 270 258 V 276" className="book-axis" />
          <path d="M 102 158 H 310" className="book-running-guide" markerEnd="url(#compare-book-arrow)" /><text x="152" y="294" textAnchor="middle" className="book-small">If≠Ia，Φ≈定值</text>
          <g transform={`translate(328 224) rotate(${shuntAngle})`}><circle r="20" className="book-point" /><line y2="-15" className="book-axis" /></g>

          <text x="82" y="342" className="book-equation">串励</text><path d="M 82 368 H 132" className="book-axis" /><path d="M 132 368 c 8 -18 20 -18 28 0 s 20 18 28 0 s 20 -18 28 0" className="book-axis" /><path d="M 216 368 H 236" className="book-axis" /><circle cx="270" cy="368" r="34" className="book-point" /><text x="270" y="374" textAnchor="middle" className="book-equation">M</text><path d="M 304 368 V 460 H 82 V 368" className="book-axis" />
          <path d="M 100 346 H 238" className="book-running-guide" markerEnd="url(#compare-book-arrow)" /><text x="190" y="482" textAnchor="middle" className="book-small">同一 I 决定 Φ 与 T</text>
          <g transform={`translate(328 414) rotate(${seriesAngle})`}><circle r="20" className="book-point" /><line y2="-15" className="book-axis" /></g>
        </g>

        <g aria-label="结构到性能的因果过程">
          <rect x="394" y="82" width="250" height="454" rx="6" className="book-subpanel" /><text x="519" y="116" textAnchor="middle" className="book-caption">因果过程</text>
          <text x="420" y="154" className="book-equation">并励支路</text>
          {[["V/Rf", `If=${formatNumber(voltage / SHUNT_MODEL.fieldResistance, 2)} A`], ["Φ≈定值", `${formatNumber(shunt.flux, 2)} Wb`], ["TL↑ -> Ia↑", `ω=${formatNumber(shunt.omega, 0)}`]].map(([top, bottom], index) => <g key={top} transform={`translate(420 ${170 + index * 72})`}><rect width="198" height="48" rx="4" className="book-stage" /><text x="99" y="20" textAnchor="middle" className="book-equation">{top}</text><text x="99" y="39" textAnchor="middle" className="book-small">{bottom}</text>{index < 2 ? <line x1="99" y1="49" x2="99" y2="68" className="book-running-guide" markerEnd="url(#compare-book-arrow)" /> : null}</g>)}
          <line x1="414" y1="378" x2="624" y2="378" className="book-guide" />
          <text x="420" y="408" className="book-equation">串励支路</text><text x="420" y="438" className="book-small">TL↓ → I↓ → Φ↓ → ω↑↑</text><text x="420" y="468" className="book-small">当前 I={formatNumber(series.current, 1)} A</text><text x="420" y="498" className="book-small">当前 Φ={formatNumber(series.flux, 2)} Wb</text>
        </g>

        <g aria-label="并励和串励机械特性运行点">
          <rect x="664" y="82" width="330" height="454" rx="6" className="book-subpanel" /><text x="829" y="116" textAnchor="middle" className="book-caption">同一 TL 下的运行点</text>
          <line x1="680" y1="462" x2="974" y2="462" className="book-axis" markerEnd="url(#compare-book-arrow)" /><line x1="680" y1="472" x2="680" y2="136" className="book-axis" markerEnd="url(#compare-book-arrow)" />
          <path d={pathFrom(curves.map((sample) => [xScale(sample.torque), yScale(sample.shunt.omega)]))} className="book-speed-curve" /><path d={pathFrom(curves.map((sample) => [xScale(sample.torque), yScale(sample.series.omega)]))} className="book-current-curve" />
          <line x1={shuntX} y1="462" x2={shuntX} y2={Math.min(shuntY, seriesY)} className="book-running-guide" /><circle cx={shuntX} cy={shuntY} r="7" className="book-live-point" /><circle cx={seriesX} cy={seriesY} r="8" className="book-point" />
          <text x={Math.min(shuntX + 10, 900)} y={shuntY - 10} className="book-small">并励点</text><text x={Math.min(seriesX + 10, 900)} y={seriesY + 22} className="book-small">串励点</text>
          <line x1="718" y1="166" x2="758" y2="166" className="book-speed-curve" /><text x="770" y="172" className="book-small">并励</text><line x1="842" y1="166" x2="882" y2="166" className="book-current-curve" /><text x="894" y="172" className="book-small">串励</text>
          <text x="974" y="492" textAnchor="end" className="book-axis-label">TL</text><text x="692" y="146" className="book-axis-label">ω</text><text x="690" y="518" className="book-note">实线：并励；虚线：串励</text>
        </g>
      </svg>
    </DemoFrame>
  );
}
