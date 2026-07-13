import { useState } from "react";
import { DemoFrame, Readout, useDemoClock } from "./shared";

const DEFAULT_RPM = 5200;

function polarPoint(radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return [radius * Math.cos(radians), radius * Math.sin(radians)] as const;
}

function annularSegmentPath(index: number, count: number) {
  const gap = 3;
  const start = (360 / count) * index - 90 + gap;
  const end = (360 / count) * (index + 1) - 90 - gap;
  const [outerStartX, outerStartY] = polarPoint(34, start);
  const [outerEndX, outerEndY] = polarPoint(34, end);
  const [innerEndX, innerEndY] = polarPoint(19, end);
  const [innerStartX, innerStartY] = polarPoint(19, start);
  const largeArc = end - start > 180 ? 1 : 0;

  return [
    `M ${outerStartX} ${outerStartY}`,
    `A 34 34 0 ${largeArc} 1 ${outerEndX} ${outerEndY}`,
    `L ${innerEndX} ${innerEndY}`,
    `A 19 19 0 ${largeArc} 0 ${innerStartX} ${innerStartY}`,
    "Z"
  ].join(" ");
}

function torquePath(
  slots: number,
  phase: number,
  amplitude: number,
  x: number,
  y: number,
  width: number
) {
  const samples = 96;
  return Array.from({ length: samples + 1 }, (_, index) => {
    const progress = index / samples;
    const px = x + progress * width;
    const py = y - Math.sin(progress * Math.PI * 2 * slots + phase) * amplitude;
    return `${index === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`;
  }).join(" ");
}

function averageTorquePath(
  slots: number,
  phases: number[],
  amplitude: number,
  x: number,
  y: number,
  width: number
) {
  const samples = 96;
  return Array.from({ length: samples + 1 }, (_, index) => {
    const progress = index / samples;
    const average = phases.reduce(
      (sum, phase) => sum + Math.sin(progress * Math.PI * 2 * slots + phase),
      0
    ) / phases.length;
    const px = x + progress * width;
    const py = y - average * amplitude;
    return `${index === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`;
  }).join(" ");
}

type MotorDrawingProps = {
  angle: number;
  slots: number;
  skew: boolean;
};

function MotorDrawing({ angle, slots, skew }: MotorDrawingProps) {
  const slicePhases = skew ? [-1.8, 0, 1.8] : [0, 0, 0];
  const slotLines = Array.from({ length: slots }, (_, index) => 484 + index * (174 / Math.max(1, slots - 1)));

  return (
    <svg
      className="advanced-book-micro-svg"
      viewBox="0 0 760 460"
      role="img"
      aria-label={`${slots} 槽微型永磁直流电机线稿，展示槽、线圈、换向片与斜槽定位转矩平均`}
    >
      <defs>
        <marker id="advanced-book-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="#171717" />
        </marker>
      </defs>

      <g className="advanced-book-figure-heading">
        <text x="42" y="28">(a) 电枢横截面</text>
        <text x="330" y="28">(b) 数量关系</text>
        <text x="476" y="28">(c) 槽的轴向展开</text>
      </g>

      <g transform="translate(170 132)" className="advanced-book-rotor-section">
        <circle r="102" fill="#fff" stroke="#171717" strokeWidth="2" />
        <path d="M -102 -18 H -126 V 18 H -102" fill="none" stroke="#171717" strokeWidth="2" />
        <path d="M 102 -18 H 126 V 18 H 102" fill="none" stroke="#171717" strokeWidth="2" />
        <text x="-116" y="5" textAnchor="middle" className="advanced-book-pole-label">N</text>
        <text x="116" y="5" textAnchor="middle" className="advanced-book-pole-label">S</text>

        <g transform={`rotate(${angle})`}>
          <circle r="70" fill="#fff" stroke="#171717" strokeWidth="2.5" />
          <circle r="43" fill="none" stroke="#171717" strokeWidth="1" />
          {Array.from({ length: slots }, (_, index) => {
            const slotAngle = (360 / slots) * index;
            return (
              <g key={`slot-${index}`} transform={`rotate(${slotAngle})`}>
                <path d="M -9 -70 L -12 -53 H 12 L 9 -70" fill="#fff" stroke="#171717" strokeWidth="2" />
                <path d="M -15 -50 Q 0 -40 15 -50 M -15 -45 Q 0 -35 15 -45" fill="none" stroke="#171717" strokeWidth="1.6" />
              </g>
            );
          })}
          <circle r="8" fill="#fff" stroke="#171717" strokeWidth="2" />
          <g className="advanced-book-commutator">
            {Array.from({ length: slots }, (_, index) => (
              <path key={`segment-${index}`} d={annularSegmentPath(index, slots)} fill="#fff" stroke="#171717" strokeWidth="1.5" />
            ))}
          </g>
        </g>
        <line x1="-38" y1="90" x2="38" y2="90" stroke="#171717" strokeWidth="5" />
        <line x1="-38" y1="84" x2="-38" y2="96" stroke="#171717" strokeWidth="2" />
        <line x1="38" y1="84" x2="38" y2="96" stroke="#171717" strokeWidth="2" />
        <text x="0" y="120" textAnchor="middle" className="advanced-book-caption">换向器随电枢旋转，电刷固定</text>
      </g>

      <g className="advanced-book-count-relation">
        <text x="334" y="76">槽数</text>
        <text x="334" y="111">线圈数</text>
        <text x="334" y="146">换向片数</text>
        <path d="M 385 70 H 424 M 385 105 H 424 M 385 140 H 424" stroke="#171717" markerEnd="url(#advanced-book-arrow)" />
        <text x="440" y="76" textAnchor="middle">{slots}</text>
        <text x="440" y="111" textAnchor="middle">{slots}</text>
        <text x="440" y="146" textAnchor="middle">{slots}</text>
        <path d="M 334 174 H 450" stroke="#171717" strokeWidth="1" />
        <text x="392" y="198" textAnchor="middle" className="advanced-book-equation">Z = C = K = {slots}</text>
        <text x="392" y="220" textAnchor="middle" className="advanced-book-caption">每个线圈接相邻两片</text>
      </g>

      <g className="advanced-book-skew-view">
        <rect x="476" y="52" width="174" height="166" fill="#fff" stroke="#171717" strokeWidth="2" />
        <line x1="476" y1="82" x2="650" y2="82" stroke="#171717" strokeDasharray="4 4" />
        <line x1="476" y1="188" x2="650" y2="188" stroke="#171717" strokeDasharray="4 4" />
        {slotLines.map((y, index) => {
          const normalizedY = slots === 1 ? 0 : (y - 484) / 174;
          const drawY = 62 + normalizedY * 146;
          const offset = skew ? 24 : 0;
          return (
            <line
              key={`axial-slot-${index}`}
              x1={492 - offset / 2}
              y1={drawY - offset / 2}
              x2={634 + offset / 2}
              y2={drawY + offset / 2}
              stroke="#171717"
              strokeWidth="3"
            />
          );
        })}
        <line x1="664" y1="61" x2="664" y2="208" stroke="#171717" markerEnd="url(#advanced-book-arrow)" />
        <text x="680" y="138" className="advanced-book-axis-label">轴向 z</text>
        <text x="563" y="240" textAnchor="middle" className="advanced-book-caption">{skew ? "斜槽：各轴向切片错相" : "直槽：各轴向切片同相"}</text>
      </g>

      <g className="advanced-book-torque-plot">
        <text x="42" y="280" className="advanced-book-figure-heading">(d) 定位转矩的空间平均</text>
        <line x1="76" y1="382" x2="704" y2="382" stroke="#171717" markerEnd="url(#advanced-book-arrow)" />
        <line x1="76" y1="416" x2="76" y2="304" stroke="#171717" markerEnd="url(#advanced-book-arrow)" />
        <line x1="76" y1="348" x2="704" y2="348" stroke="#171717" strokeDasharray="3 4" />
        <text x="714" y="387" className="advanced-book-axis-label">转角 θ</text>
        <text x="52" y="306" textAnchor="middle" className="advanced-book-axis-label">T<tspan baselineShift="sub">cog</tspan></text>
        {slicePhases.map((phase, index) => (
          <path
            key={`slice-${index}`}
            d={torquePath(slots, phase, 26, 76, 348, 628)}
            fill="none"
            stroke="#777"
            strokeWidth="1.2"
            strokeDasharray={index === 1 ? "6 4" : "2 4"}
            opacity="0.7"
          />
        ))}
        <path
          d={averageTorquePath(slots, slicePhases, 26, 76, 348, 628)}
          fill="none"
          stroke="#171717"
          strokeWidth="3"
          className="advanced-book-average-line"
        />
        <line x1="530" y1="410" x2="567" y2="410" stroke="#777" strokeWidth="1.2" strokeDasharray="3 4" />
        <text x="575" y="415" className="advanced-book-legend">轴向切片</text>
        <line x1="630" y1="410" x2="667" y2="410" stroke="#171717" strokeWidth="3" />
        <text x="675" y="415" className="advanced-book-legend">平均值</text>
        <text x="76" y="444" className="advanced-book-caption">
          {skew ? "斜槽使不同 z 位置的峰谷错开，积分后定位转矩显著减小。" : "直槽各切片峰谷重合，平均后脉动不变。"}
        </text>
      </g>
    </svg>
  );
}

export default function MicroMotorDemo() {
  const [playing, setPlaying] = useState(true);
  const [slots, setSlots] = useState<3 | 5>(3);
  const [skew, setSkew] = useState(false);
  const [rpm, setRpm] = useState(DEFAULT_RPM);
  const { time, reset: resetClock } = useDemoClock(playing, rpm / DEFAULT_RPM);
  const angle = time * 90;
  const ripple = (slots === 3 ? 1 : 0.62) * (skew ? 0.2 : 1);

  const handleReset = () => {
    resetClock();
    setPlaying(false);
    setSlots(3);
    setSkew(false);
    setRpm(DEFAULT_RPM);
  };

  return (
    <DemoFrame
      status={skew
        ? "斜槽让不同轴向位置的定位转矩错相，空间平均后脉动显著降低"
        : `${slots} 槽电枢中，槽数、线圈数与换向片数相等；直槽定位转矩同相叠加`}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={handleReset}
      actions={
        <div className="advanced-book-actions segmented" aria-label="微型电机结构选择">
          <button type="button" className={slots === 3 ? "is-active" : ""} aria-pressed={slots === 3} onClick={() => setSlots(3)}>三槽</button>
          <button type="button" className={slots === 5 ? "is-active" : ""} aria-pressed={slots === 5} onClick={() => setSlots(5)}>五槽</button>
          <button type="button" className={skew ? "is-active" : ""} aria-pressed={skew} onClick={() => setSkew((value) => !value)}>{skew ? "斜槽" : "直槽"}</button>
        </div>
      }
      sliders={[
        { label: "转速", symbol: "n", value: rpm, min: 800, max: 10000, step: 200, unit: "rpm", onChange: setRpm }
      ]}
      readouts={
        <>
          <Readout label="槽/线圈/换向片" value={`${slots}/${slots}/${slots}`} tone="blue" />
          <Readout label="定位转矩幅值" value={ripple} unit="pu" tone={ripple > 0.7 ? "amber" : "green"} />
          <Readout label="槽型" value={skew ? "空间错相" : "轴向同相"} tone={skew ? "green" : "amber"} />
        </>
      }
    >
      <MotorDrawing angle={angle} slots={slots} skew={skew} />
    </DemoFrame>
  );
}
