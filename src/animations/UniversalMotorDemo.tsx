import { useMemo, useState } from "react";
import { formatNumber } from "../utils/format";
import { DemoFrame, Readout, useDemoClock } from "./shared";

const TWO_PI = Math.PI * 2;
const DISPLAY_TIME_SCALE = 0.02;

function pathFrom(points: Array<[number, number]>) {
  return points.map(([x, y], index) => `${index ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

export default function UniversalMotorDemo() {
  const [playing, setPlaying] = useState(true);
  const [voltage, setVoltage] = useState(220);
  const [frequency, setFrequency] = useState(50);
  const { time, reset } = useDemoClock(playing, 1);
  const theta = TWO_PI * frequency * time * DISPLAY_TIME_SCALE;
  const phase = ((theta % TWO_PI) + TWO_PI) % TWO_PI;
  const currentAmplitude = voltage / 220;
  const current = currentAmplitude * Math.sin(theta);
  const flux = 0.85 * current;
  const torque = 1.15 * current * current;
  const instantaneousVoltage = voltage * Math.sin(theta);
  const positiveHalfCycle = current >= 0;
  const rotorAngle = time * (70 + 90 * currentAmplitude * currentAmplitude);
  const markerX = 692 + (phase / TWO_PI) * 270;
  const displayCurrentAmplitude = currentAmplitude / 1.2;
  const displayFluxAmplitude = (0.85 * currentAmplitude) / 1.2;
  const displayTorqueAmplitude = (currentAmplitude * currentAmplitude) / 1.3;
  const waveforms = useMemo(() => Array.from({ length: 121 }, (_, index) => {
    const angle = (index / 120) * TWO_PI;
    const x = 692 + (index / 120) * 270;
    const normalizedCurrent = Math.sin(angle);
    return {
      x,
      currentY: 332 - normalizedCurrent * displayCurrentAmplitude * 116,
      fluxY: 332 - normalizedCurrent * displayFluxAmplitude * 116,
      torqueY: 332 - normalizedCurrent * normalizedCurrent * displayTorqueAmplitude * 116
    };
  }), [displayCurrentAmplitude, displayFluxAmplitude, displayTorqueAmplitude]);
  const currentMarkerY = 332 - Math.sin(theta) * displayCurrentAmplitude * 116;
  const fluxMarkerY = 332 - Math.sin(theta) * displayFluxAmplitude * 116;
  const torqueMarkerY = 332 - Math.sin(theta) * Math.sin(theta) * displayTorqueAmplitude * 116;

  return (
    <DemoFrame
      status="串励磁场与电枢流过同一交流电流：I 与 Φ 每半周同时反向，因此 T=kΦI 始终为正"
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => { reset(); setPlaying(true); setVoltage(220); setFrequency(50); }}
      sliders={[
        { label: "交流电压幅值", symbol: "V̂", value: voltage, min: 110, max: 250, step: 10, unit: "V", onChange: setVoltage },
        { label: "交流频率", symbol: "f", value: frequency, min: 20, max: 80, step: 5, unit: "Hz", onChange: setFrequency }
      ]}
      readouts={<><Readout label="θ" value={(phase * 180) / Math.PI} unit="°" tone="neutral" /><Readout label="I=Îsinθ" value={current} unit="pu" tone="red" /><Readout label="Φ" value={flux} unit="pu" tone="blue" /><Readout label="T∝I²" value={torque} unit="pu" tone="green" /></>}
    >
      <svg className="four-quadrant-book-svg advanced-book-svg" viewBox="0 0 1040 600" role="img" aria-label="通用电动机交流电路、因果过程与同步波形运行点">
        <defs><marker id="universal-book-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" className="book-arrow-head" /></marker></defs>
        <rect x="24" y="24" width="992" height="552" rx="8" className="book-figure-panel" /><text x="520" y="58" textAnchor="middle" className="book-title">通用电动机：交流反向，转矩不反向</text>

        <g aria-label="通用电机串励交流电路">
          <rect x="46" y="82" width="300" height="454" rx="6" className="book-subpanel" /><text x="196" y="116" textAnchor="middle" className="book-caption">串励交流电路</text>
          <circle cx="88" cy="224" r="34" className="book-point" /><path d="M 66 224 q 11 -20 22 0 t 22 0" className="book-axis" /><text x="88" y="276" textAnchor="middle" className="book-small">u={formatNumber(instantaneousVoltage, 0)} V</text>
          <path d="M 88 190 V 160 H 146" className="book-axis" /><path d="M 146 160 c 9 -22 22 -22 31 0 s 22 22 31 0 s 22 -22 31 0" className="book-axis" /><path d="M 239 160 H 270 V 190" className="book-axis" />
          <circle cx="270" cy="224" r="34" className="book-point" /><text x="270" y="230" textAnchor="middle" className="book-equation">M</text><path d="M 270 258 V 306 H 88 V 258" className="book-axis" />
          <path d={positiveHalfCycle ? "M 112 136 H 248" : "M 248 136 H 112"} className="book-running-guide" markerEnd="url(#universal-book-arrow)" /><text x="180" y="126" textAnchor="middle" className="book-equation">I {positiveHalfCycle ? "> 0" : "< 0"}</text>
          <path d={positiveHalfCycle ? "M 118 330 H 250" : "M 250 330 H 118"} className="book-running-guide" markerEnd="url(#universal-book-arrow)" /><text x="184" y="354" textAnchor="middle" className="book-small">I 与 Φ 同号：{positiveHalfCycle ? "正半周" : "负半周"}</text>
          <g transform={`translate(196 424) rotate(${rotorAngle})`}><circle r="52" className="book-point" /><line y2="-40" className="book-axis" markerEnd="url(#universal-book-arrow)" /><circle r="5" className="book-live-point" /></g>
          <path d="M 128 476 A 82 82 0 0 0 264 476" className="book-running-guide" markerEnd="url(#universal-book-arrow)" /><text x="196" y="512" textAnchor="middle" className="book-small">转矩方向始终不变</text>
        </g>

        <g aria-label="通用电机因果过程">
          <rect x="366" y="82" width="292" height="454" rx="6" className="book-subpanel" /><text x="512" y="116" textAnchor="middle" className="book-caption">同一相位 θ 的因果过程</text>
          {[
            [`θ=${formatNumber((phase * 180) / Math.PI, 0)}°`, `f=${frequency} Hz`],
            [`I=Îsinθ=${formatNumber(current, 2)}`, positiveHalfCycle ? "电流正向" : "电流反向"],
            [`Φ∝I=${formatNumber(flux, 2)}`, "Φ 与 I 同号"],
            [`T=kΦI∝I²`, `${formatNumber(torque, 2)} pu，方向为正`]
          ].map(([formula, note], index) => <g key={formula} transform={`translate(394 ${150 + index * 88})`}><rect width="236" height="56" rx="4" className={index === 3 ? "book-stage is-active" : "book-stage"} /><text x="118" y="23" textAnchor="middle" className="book-equation">{formula}</text><text x="118" y="45" textAnchor="middle" className="book-small">{note}</text>{index < 3 ? <line x1="118" y1="57" x2="118" y2="83" className="book-running-guide" markerEnd="url(#universal-book-arrow)" /> : null}</g>)}
          <text x="512" y="516" textAnchor="middle" className="book-note">I、Φ、T 与电路箭头共用 θ</text>
        </g>

        <g aria-label="电流磁通转矩同步波形运行点">
          <rect x="678" y="82" width="316" height="454" rx="6" className="book-subpanel" /><text x="836" y="116" textAnchor="middle" className="book-caption">波形与瞬时运行点</text>
          <line x1="692" y1="332" x2="974" y2="332" className="book-axis" markerEnd="url(#universal-book-arrow)" /><line x1="692" y1="472" x2="692" y2="146" className="book-axis" markerEnd="url(#universal-book-arrow)" />
          <path d={pathFrom(waveforms.map((sample) => [sample.x, sample.currentY]))} className="book-speed-curve" /><path d={pathFrom(waveforms.map((sample) => [sample.x, sample.fluxY]))} className="book-current-curve" /><path d={pathFrom(waveforms.map((sample) => [sample.x, sample.torqueY]))} className="book-slow-curve" />
          <line x1={markerX} y1="472" x2={markerX} y2="146" className="book-running-guide" /><circle cx={markerX} cy={currentMarkerY} r="7" className="book-live-point" /><circle cx={markerX} cy={fluxMarkerY} r="7" className="book-point" /><circle cx={markerX} cy={torqueMarkerY} r="5" className="book-live-point" />
          <line x1="714" y1="404" x2="754" y2="404" className="book-speed-curve" /><text x="762" y="410" className="book-small">I</text><line x1="804" y1="404" x2="844" y2="404" className="book-current-curve" /><text x="852" y="410" className="book-small">Φ</text><line x1="888" y1="404" x2="928" y2="404" className="book-slow-curve" /><text x="936" y="410" className="book-small">T</text>
          <text x="692" y="494" textAnchor="middle" className="book-small">0</text><text x="827" y="494" textAnchor="middle" className="book-small">π</text><text x="962" y="494" textAnchor="middle" className="book-small">2π</text><text x="972" y="522" textAnchor="end" className="book-note">竖线为当前 θ</text>
        </g>
      </svg>
    </DemoFrame>
  );
}
