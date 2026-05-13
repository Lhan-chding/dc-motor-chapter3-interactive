import { useMemo, useState } from "react";
import { formatNumber } from "../utils/format";
import { ArrowDefs, DemoFrame, Readout, useDemoClock } from "./shared";

const INITIAL_LOAD = 0.65;
const stages = ["初始平衡", "负载加大", "转速下降", "E 下降", "电流上升", "新平衡"];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function response(t: number, delay: number, tau: number) {
  return t <= delay ? 0 : 1 - Math.exp(-(t - delay) / tau);
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

function stageAt(t: number) {
  if (t < 0.45) return 0;
  if (t < 1.2) return 1;
  if (t < 2.25) return 2;
  if (t < 3.25) return 3;
  if (t < 4.75) return 4;
  return 5;
}

export default function LoadStepDemo() {
  const [playing, setPlaying] = useState(false);
  const [finalLoad, setFinalLoad] = useState(1.45);
  const { time, reset } = useDemoClock(playing, 1);

  const t = Math.min(time, 6);
  const active = playing ? stageAt(t) : 0;
  const loadDelta = Math.max(0.05, finalLoad - INITIAL_LOAD);
  const loadStep = playing && t >= 0.45 ? 1 : 0;
  const loadTorque = INITIAL_LOAD + loadDelta * loadStep;
  const speedFinal = clamp(1 - 0.34 * loadDelta, 0.38, 0.95);
  const speedProgress = playing ? response(t, 1.05, 1.15) : 0;
  const omega = 1 - (1 - speedFinal) * speedProgress;
  const emf = omega;
  const currentProgress = playing ? response(t, 2.45, 1.0) : 0;
  const current = INITIAL_LOAD + loadDelta * currentProgress;
  const electromagneticTorque = current;
  const netTorque = electromagneticTorque - loadTorque;
  const isBalanced = Math.abs(netTorque) < 0.05 && playing && t > 4.75;
  const rotorAngle = (time * 250 * Math.max(0.18, omega)) % 360;
  const loadAngle = (time * 145 * Math.max(0.16, omega)) % 360;
  const currentRatio = clamp(current / 1.7, 0, 1);
  const voltageGap = clamp(1 - emf, 0, 1);

  const curves = useMemo(() => {
    return Array.from({ length: 96 }, (_, index) => {
      const tx = (index / 95) * 6;
      const step = tx >= 0.45 ? 1 : 0;
      const w = 1 - (1 - speedFinal) * response(tx, 1.05, 1.15);
      const i = INITIAL_LOAD + loadDelta * response(tx, 2.45, 1.0);
      const tl = INITIAL_LOAD + loadDelta * step;
      return {
        x: tx / 6,
        omega: clamp(w, 0, 1.7) / 1.7,
        current: clamp(i, 0, 1.7) / 1.7,
        load: clamp(tl, 0, 1.7) / 1.7
      };
    });
  }, [loadDelta, speedFinal]);

  const status = playing ? `找平衡：${stages[active]}` : "点击“突然加负载”，按电路图和电机图观察因果";

  return (
    <DemoFrame
      status={status}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => {
        reset();
        setPlaying(false);
        setFinalLoad(1.45);
      }}
      actions={
        <button
          type="button"
          className="pill-button"
          onClick={() => {
            reset();
            setPlaying(true);
          }}
        >
          突然加负载
        </button>
      }
      sliders={[
        {
          label: "负载阶跃幅值",
          symbol: "TL2",
          value: finalLoad,
          min: 0.8,
          max: 2,
          step: 0.05,
          unit: "pu",
          onChange: setFinalLoad
        }
      ]}
      readouts={
        <>
          <Readout label="ω" value={omega} unit="pu" tone="green" />
          <Readout label="E=kω" value={emf} unit="pu" tone="purple" />
          <Readout label="I" value={current} unit="pu" tone="red" />
          <Readout label="Te-TL" value={netTorque} unit="pu" tone={isBalanced ? "green" : netTorque < 0 ? "amber" : "blue"} />
        </>
      }
    >
      <div className="load-board" aria-label="负载阶跃找平衡演示板">
        <section className="load-panel load-panel--circuit" aria-label="等效电路">
          <h3>等效电路</h3>
          <svg viewBox="0 0 340 230" role="img" aria-label="V E R 和电枢电流关系">
            <ArrowDefs />
            <rect x="24" y="72" width="54" height="76" rx="12" fill="#dbeafe" stroke="var(--blue)" strokeWidth="3" />
            <text x="51" y="118" textAnchor="middle" className="svg-label">V</text>
            <path d="M 78 110 H 126 l10 -18 l18 36 l18 -36 l18 36 l10 -18 H 236" fill="none" stroke="var(--ink)" strokeWidth="5" />
            <circle cx="270" cy="110" r="34" fill="#ede9fe" stroke="var(--purple)" strokeWidth="4" />
            <text x="270" y="118" textAnchor="middle" className="svg-label">E</text>
            <path d="M 270 144 V 174 H 52 V 148" fill="none" stroke="var(--ink)" strokeWidth="5" />
            <path d="M 96 48 H 220" className="current-arrow" strokeWidth={4 + currentRatio * 6} markerEnd="url(#arrow-red)" />
            <text x="158" y="34" textAnchor="middle" className="legend legend--current">I=(V-E)/R</text>
            <line x1="36" y1="204" x2="304" y2="204" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
            <line x1="36" y1="204" x2={36 + 268 * emf} y2="204" stroke="var(--purple)" strokeWidth="14" strokeLinecap="round" />
            <line x1={36 + 268 * emf} y1="204" x2={36 + 268 * (emf + voltageGap)} y2="204" stroke="var(--red)" strokeWidth="14" strokeLinecap="round" />
            <text x="36" y="224" className="svg-axis-label">E</text>
            <text x="244" y="224" className="svg-axis-label">V-E</text>
          </svg>
          <p>转速降 → E 降 → V-E 增 → I 增</p>
        </section>

        <section className="load-panel load-panel--motor" aria-label="电机和负载">
          <h3>电机 + 负载</h3>
          <svg viewBox="0 0 470 260" role="img" aria-label="直流电机带负载运行">
            <ArrowDefs />
            <rect x="28" y="48" width="82" height="140" rx="18" fill="#dbeafe" stroke="var(--blue)" strokeWidth="3" />
            <rect x="220" y="48" width="82" height="140" rx="18" fill="#fee2e2" stroke="var(--red)" strokeWidth="3" />
            <text x="69" y="88" textAnchor="middle" className="svg-label">N</text>
            <text x="261" y="88" textAnchor="middle" className="svg-label">S</text>
            {[92, 122, 152].map((y) => (
              <path key={y} d={`M 108 ${y} C 138 ${y - 18}, 190 ${y - 18}, 222 ${y}`} className="flux-line" markerEnd="url(#arrow-blue)" />
            ))}
            <g transform={`translate(166 120) rotate(${rotorAngle})`}>
              <circle r="58" fill="#f8fafc" stroke="#dbe3ee" strokeWidth="8" />
              <rect x="-70" y="-10" width="140" height="20" rx="10" fill="#cbd5e1" />
              <rect x="-10" y="-70" width="20" height="140" rx="10" fill="#e2e8f0" />
              <circle cx="-60" cy="0" r="17" fill="#fee2e2" stroke="var(--red)" strokeWidth="3" />
              <circle cx="60" cy="0" r="17" fill="#fee2e2" stroke="var(--red)" strokeWidth="3" />
              <text x="-60" y="6" textAnchor="middle" className="current-mark">×</text>
              <text x="60" y="6" textAnchor="middle" className="current-mark">·</text>
            </g>
            <path d="M 112 210 A 94 94 0 0 1 96 78" className="torque-arrow" markerEnd="url(#arrow-green)" opacity={0.35 + electromagneticTorque / 2.5} />
            <line x1="224" y1="120" x2="330" y2="120" stroke="#94a3b8" strokeWidth="11" strokeLinecap="round" />
            <circle cx="356" cy="120" r="44" fill="#fff7ed" stroke="var(--amber)" strokeWidth="4" />
            <g transform={`translate(356 120) rotate(${loadAngle})`}>
              {[0, 120, 240].map((angle) => (
                <rect key={angle} x="-6" y="-38" width="12" height="38" rx="6" fill="#f59e0b" transform={`rotate(${angle})`} />
              ))}
            </g>
            <path d="M 394 176 A 74 74 0 0 0 394 66" className="load-torque-arrow" markerEnd="url(#arrow-amber)" opacity={0.35 + loadTorque / 2.5} />
            <text x="122" y="232" className="legend legend--torque">Te=kI</text>
            <text x="336" y="196" className="legend legend--load">TL</text>
          </svg>
          <p>负载先超过电磁转矩，转子减速</p>
        </section>

        <section className="load-panel load-panel--balance" aria-label="转矩平衡">
          <h3>平衡表</h3>
          <svg viewBox="0 0 260 230" role="img" aria-label="电磁转矩和负载转矩比较">
            <line x1="38" y1="70" x2="222" y2="70" stroke="#fde68a" strokeWidth="18" strokeLinecap="round" />
            <line x1="38" y1="70" x2={38 + 184 * clamp(loadTorque / 2, 0, 1)} y2="70" stroke="var(--amber)" strokeWidth="18" strokeLinecap="round" />
            <text x="38" y="102" className="legend legend--load">TL {formatNumber(loadTorque, 2)}</text>
            <line x1="38" y1="132" x2="222" y2="132" stroke="#d1fae5" strokeWidth="18" strokeLinecap="round" />
            <line x1="38" y1="132" x2={38 + 184 * clamp(electromagneticTorque / 2, 0, 1)} y2="132" stroke="var(--green)" strokeWidth="18" strokeLinecap="round" />
            <text x="38" y="164" className="legend legend--torque">Te {formatNumber(electromagneticTorque, 2)}</text>
            <rect x="54" y="184" width="152" height="30" rx="15" fill={isBalanced ? "#d1fae5" : "#fef3c7"} stroke={isBalanced ? "var(--green)" : "var(--amber)"} />
            <text x="130" y="204" textAnchor="middle" className="stage-chip-text">{isBalanced ? "新平衡" : netTorque < 0 ? "正在减速" : "正在追上"}</text>
          </svg>
          <p>当 Te≈TL，速度进入新稳态</p>
        </section>

        <section className="load-chain" aria-label="负载阶跃因果链">
          {[
            ["TL↑", "负载"],
            ["ω↓", "减速"],
            ["E↓", "反电动势"],
            ["I↑", "电流"],
            ["Te↑", "转矩"],
            ["平衡", "Te≈TL"]
          ].map(([top, bottom], index) => (
            <div key={top} className={index <= active ? "load-chain__node is-active" : "load-chain__node"}>
              <strong>{top}</strong>
              <span>{bottom}</span>
            </div>
          ))}
        </section>

        <section className="load-curve" aria-label="响应曲线记录">
          <svg viewBox="0 0 880 170" role="img" aria-label="负载转矩转速和电流响应曲线">
            <text x="24" y="28" className="svg-axis-label">结果记录曲线</text>
            <line x1="44" y1="136" x2="760" y2="136" className="axis-line" />
            <line x1="44" y1="136" x2="44" y2="44" className="axis-line" />
            <path d={pathFromPoints(curves.map((p) => [p.x, p.load]), 64, 42, 650, 94)} className="response-line response-line--load" />
            <path d={pathFromPoints(curves.map((p) => [p.x, p.omega]), 64, 42, 650, 94)} className="response-line response-line--omega" />
            <path d={pathFromPoints(curves.map((p) => [p.x, p.current]), 64, 42, 650, 94)} className="response-line response-line--current" />
            <line x1={64 + (t / 6) * 650} y1="42" x2={64 + (t / 6) * 650} y2="136" stroke="#0f172a" strokeWidth="3" opacity="0.24" />
            <g transform="translate(760 56)">
              <text x="0" y="0" className="legend legend--load">TL 阶跃</text>
              <text x="0" y="32" className="legend legend--omega">ω 与 E 下降</text>
              <text x="0" y="64" className="legend legend--current">I 与 Te 上升</text>
            </g>
          </svg>
        </section>
      </div>
    </DemoFrame>
  );
}
