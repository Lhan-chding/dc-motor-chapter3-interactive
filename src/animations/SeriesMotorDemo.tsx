import { useMemo, useState } from "react";
import { formatNumber } from "../utils/format";
import { ArrowDefs, DemoFrame, Readout, useDemoClock } from "./shared";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pathFromPoints(points: Array<[number, number]>, x: number, y: number, w: number, h: number) {
  return points
    .map(([px, py], index) => {
      const sx = x + px * w;
      const sy = y + (1 - py) * h;
      return `${index === 0 ? "M" : "L"} ${sx.toFixed(1)} ${sy.toFixed(1)}`;
    })
    .join(" ");
}

export default function SeriesMotorDemo() {
  const [playing, setPlaying] = useState(true);
  const [load, setLoad] = useState(0.55);
  const [V, setV] = useState(220);
  const { time, reset } = useDemoClock(playing, 1);

  const current = clamp(0.1 + load * 1.05, 0.08, 1.55);
  const saturated = current > 0.92;
  const flux = saturated ? 0.92 + (current - 0.92) * 0.32 : current;
  const torque = flux * current;
  const speed = clamp((V / 220) * (0.9 / Math.max(0.1, flux)), 0.35, 3.4);
  const danger = load < 0.15 || speed > 2.6;
  const rotorAngle = (time * 210 * speed) % 360;
  const currentWidth = 3 + current * 4;
  const fluxWidth = 3 + flux * 5;

  const curve = useMemo(
    () =>
      Array.from({ length: 80 }, (_, index) => {
        const l = 0.04 + (index / 79) * 1.16;
        const i = clamp(0.1 + l * 1.05, 0.08, 1.55);
        const phi = i > 0.92 ? 0.92 + (i - 0.92) * 0.32 : i;
        const n = clamp((V / 220) * (0.9 / Math.max(0.1, phi)), 0.35, 3.4);
        return [l / 1.2, n / 3.4] as [number, number];
      }),
    [V]
  );

  const status = danger
    ? "负载太小：I 和 Φ 变小，为产生足够 E，转速会急剧升高"
    : saturated
      ? "电流增大使磁通增强，饱和后转矩增长变慢"
      : "串励关键：同一电流同时增强磁通和电枢转矩";

  return (
    <DemoFrame
      status={status}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => {
        reset();
        setLoad(0.55);
        setV(220);
      }}
      actions={
        <div className="segmented">
          <button type="button" className={load < 0.15 ? "is-active" : ""} onClick={() => setLoad(0.06)}>空载演示</button>
          <button type="button" className={load >= 0.7 ? "is-active" : ""} onClick={() => setLoad(0.85)}>加负载</button>
        </div>
      }
      sliders={[
        { label: "负载转矩", symbol: "TL", value: load, min: 0.03, max: 1.2, step: 0.03, unit: "pu", onChange: setLoad },
        { label: "端电压", symbol: "V", value: V, min: 80, max: 320, step: 10, unit: "V", onChange: setV }
      ]}
      readouts={
        <>
          <Readout label="同一电流 I" value={current} unit="pu" tone="red" />
          <Readout label="磁通 Φ" value={flux} unit="pu" tone="blue" />
          <Readout label="T=ΦI" value={torque} unit="pu" tone="green" />
          <Readout label="转速 n" value={speed} unit="pu" tone={danger ? "amber" : "green"} />
        </>
      }
    >
      <svg className="series-demo-svg" viewBox="0 0 1040 640" role="img" aria-label="串励直流电机为什么低速大转矩且不能空载">
        <ArrowDefs />

        <g aria-label="串励电路" transform="translate(36 34)">
          <rect x="0" y="0" width="456" height="220" rx="24" fill="#ffffff" stroke="var(--border)" />
          <text x="228" y="32" textAnchor="middle" className="svg-axis-label">串励电路：励磁绕组与电枢串联</text>
          <rect x="30" y="78" width="54" height="86" rx="10" fill="#dbeafe" stroke="var(--blue)" strokeWidth="3" />
          <text x="57" y="128" textAnchor="middle" className="svg-label">V</text>
          <path d="M 84 120 H 134" className="series-current-line" strokeWidth={currentWidth} markerEnd="url(#arrow-red)" />
          <path d="M 134 120 c 10 -34, 28 -34, 38 0 s 28 34, 38 0 s 28 -34, 38 0" fill="none" stroke="var(--blue)" strokeWidth={fluxWidth} strokeLinecap="round" />
          <text x="192" y="82" textAnchor="middle" className="svg-axis-label">励磁绕组</text>
          <path d="M 254 120 H 306" className="series-current-line" strokeWidth={currentWidth} markerEnd="url(#arrow-red)" />
          <rect x="306" y="84" width="84" height="72" rx="16" fill="#fee2e2" stroke="var(--red)" strokeWidth="3" />
          <text x="348" y="126" textAnchor="middle" className="svg-axis-label">电枢</text>
          <path d="M 348 156 V 186 H 56 V 164" fill="none" stroke="var(--ink)" strokeWidth="4" />
          <text x="228" y="194" textAnchor="middle" className="series-i-label">同一电流 I 穿过两部分</text>
        </g>

        <g aria-label="电机与负载" transform="translate(532 34)">
          <rect x="0" y="0" width="470" height="320" rx="24" fill="#f8fafc" stroke="var(--border)" />
          <text x="235" y="32" textAnchor="middle" className="svg-axis-label">电流变小会削弱磁场，空载时转速被推高</text>
          <rect x="34" y="76" width="84" height="168" rx="18" fill="#dbeafe" stroke="var(--blue)" strokeWidth="3" />
          <rect x="256" y="76" width="84" height="168" rx="18" fill="#fee2e2" stroke="var(--red)" strokeWidth="3" />
          <text x="76" y="114" textAnchor="middle" className="svg-label">N</text>
          <text x="298" y="114" textAnchor="middle" className="svg-label">S</text>
          {[122, 158, 194].map((y) => (
            <path key={y} d={`M 118 ${y} C 162 ${y - 22}, 214 ${y - 22}, 258 ${y}`} className="flux-line" strokeWidth={fluxWidth} markerEnd="url(#arrow-blue)" opacity={0.3 + flux / 1.7} />
          ))}
          <g transform={`translate(188 160) rotate(${rotorAngle})`}>
            <circle r="64" fill="#ffffff" stroke="#dbe3ee" strokeWidth="8" />
            <rect x="-80" y="-11" width="160" height="22" rx="11" fill="#cbd5e1" />
            <rect x="-11" y="-80" width="22" height="160" rx="11" fill="#e2e8f0" />
            <circle cx="-70" cy="0" r="17" fill="#fee2e2" stroke="var(--red)" strokeWidth="3" />
            <circle cx="70" cy="0" r="17" fill="#fee2e2" stroke="var(--red)" strokeWidth="3" />
            <text x="-70" y="6" textAnchor="middle" className="current-mark">×</text>
            <text x="70" y="6" textAnchor="middle" className="current-mark">·</text>
          </g>
          <path d="M 146 230 A 90 90 0 0 1 134 96" className="torque-arrow" markerEnd="url(#arrow-green)" opacity={0.3 + torque / 2.2} />
          <line x1="250" y1="160" x2="376" y2="160" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
          <circle cx="398" cy="160" r="42" fill={danger ? "#fef3c7" : "#d1fae5"} stroke={danger ? "var(--amber)" : "var(--green)"} strokeWidth="4" />
          <text x="398" y="156" textAnchor="middle" className="svg-axis-label">负载</text>
          <text x="398" y="178" textAnchor="middle" className="svg-axis-label">{formatNumber(load, 2)}pu</text>
          {danger ? <text x="328" y="272" className="danger-text">空载飞车风险</text> : null}
        </g>

        <g aria-label="物理因果链" transform="translate(36 286)">
          <rect x="0" y="0" width="456" height="286" rx="24" fill="#ffffff" stroke="var(--border)" />
          <text x="24" y="34" className="svg-axis-label">为什么空载危险</text>
          {[
            ["TL↓", "负载小"],
            ["I↓", "电流小"],
            ["Φ↓", "磁通小"],
            ["E=kΦω", "需靠ω补足"],
            ["n↑↑", "转速飙升"]
          ].map(([top, bottom], index) => (
            <g key={top} transform={`translate(${24 + (index % 3) * 140} ${62 + Math.floor(index / 3) * 92})`}>
              <rect width="104" height="58" rx="16" className={danger || index < 3 ? "chain-node is-active" : "chain-node"} />
              <text x="52" y="25" textAnchor="middle" className="svg-label">{top}</text>
              <text x="52" y="46" textAnchor="middle" className="chain-text">{bottom}</text>
            </g>
          ))}
          <path d="M 132 91 H 158" className="chain-arrow is-active" markerEnd="url(#arrow-green)" />
          <path d="M 272 91 H 298" className="chain-arrow is-active" markerEnd="url(#arrow-green)" />
          <path d="M 356 122 C 356 154, 78 154, 78 184" className="chain-arrow is-active" fill="none" markerEnd="url(#arrow-green)" />
          <path d="M 132 215 H 158" className="chain-arrow is-active" markerEnd="url(#arrow-green)" />
        </g>

        <g aria-label="量值变化" transform="translate(532 384)">
          <rect x="0" y="0" width="470" height="188" rx="24" fill="#ffffff" stroke="var(--border)" />
          <text x="24" y="34" className="svg-axis-label">负载改变时，先看量值条，再看曲线</text>
          {[
            ["I", current, 1.55, "var(--red)"],
            ["Φ", flux, 1.15, "var(--blue)"],
            ["T", torque, 1.75, "var(--green)"],
            ["n", speed, 3.4, danger ? "var(--amber)" : "var(--green)"]
          ].map(([label, value, max, color], index) => (
            <g key={label as string} transform={`translate(28 ${58 + index * 30})`}>
              <text x="0" y="17" className="svg-axis-label">{label as string}</text>
              <rect x="40" y="2" width="180" height="16" rx="8" fill="#f1f5f9" />
              <rect x="40" y="2" width={180 * clamp((value as number) / (max as number), 0, 1)} height="16" rx="8" fill={color as string} />
              <text x="236" y="17" className="svg-axis-label">{formatNumber(value as number, 2)}</text>
            </g>
          ))}
          <g transform="translate(304 62)">
            <line x1="0" y1="86" x2="130" y2="86" className="axis-line" />
            <line x1="0" y1="86" x2="0" y2="6" className="axis-line" />
            <path d={pathFromPoints(curve, 0, 6, 118, 80)} className={danger ? "response-line response-line--load" : "response-line response-line--omega"} />
            <circle cx={load / 1.2 * 118} cy={6 + (1 - speed / 3.4) * 80} r="7" fill={danger ? "var(--amber)" : "var(--green)"} stroke="#fff" strokeWidth="3" />
            <text x="122" y="104" className="svg-axis-label">TL</text>
            <text x="-14" y="12" className="svg-axis-label">n</text>
          </g>
        </g>
      </svg>
    </DemoFrame>
  );
}
