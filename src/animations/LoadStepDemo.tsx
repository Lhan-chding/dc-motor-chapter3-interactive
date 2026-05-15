import { useMemo, useState } from "react";
import { solveDcMotorTransient } from "../utils/motorMath";
import { formatNumber } from "../utils/format";
import { DemoFrame, Readout, useDemoClock } from "./shared";

const INITIAL_LOAD = 0.65;
const MOTOR_K = 1;
const ARMATURE_L = 0.2;
const ROTOR_J = 0.95;
const STAGES = ["TL↑", "ω↓", "E↓", "I↑", "Te↑", "平衡"];
const PLOT = { x: 396, y: 66, w: 544, h: 244 };
const SPEED_MIN = 0.36;
const SPEED_MAX = 1.08;
const TORQUE_MAX = 2.1;

type Point = {
  x: number;
  y: number;
};

type LoadState = {
  omega: number;
  current: number;
  loadTorque: number;
  speedFinal: number;
  trace: Array<[number, number]>;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function stageAt(t: number) {
  if (t < 0.45) return 0;
  if (t < 1.2) return 1;
  if (t < 2.25) return 2;
  if (t < 3.25) return 3;
  if (t < 4.75) return 4;
  return 5;
}

function plotPoint(speed: number, torque: number): Point {
  const xRatio = clamp((speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN), 0, 1);
  const yRatio = clamp(torque / TORQUE_MAX, 0, 1);
  return {
    x: PLOT.x + xRatio * PLOT.w,
    y: PLOT.y + PLOT.h - yRatio * PLOT.h
  };
}

function pathFromCurve(points: Array<[number, number]>) {
  return points
    .map(([speed, torque], index) => {
      const point = plotPoint(speed, torque);
      return `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(" ");
}

function motorConstants(loadFinal: number, speedFinal: number) {
  const resistance = (MOTOR_K * MOTOR_K * (1 - speedFinal)) / Math.max(0.04, loadFinal - INITIAL_LOAD);
  const voltage = MOTOR_K + (resistance * INITIAL_LOAD) / MOTOR_K;
  return { resistance, voltage };
}

function loadTorqueAtSpeed(level: number, speedAtLevel: number, speed: number) {
  const speedRatio = clamp(speed / Math.max(0.08, speedAtLevel), 0, 1.5);
  return clamp(level * (0.52 + 0.48 * Math.pow(speedRatio, 1.7)), 0.08, 2.05);
}

function buildMotorCurve(speedFinal: number, loadFinal: number) {
  const { resistance, voltage } = motorConstants(loadFinal, speedFinal);
  return Array.from({ length: 72 }, (_, index) => {
    const speed = SPEED_MIN + ((SPEED_MAX - SPEED_MIN) * index) / 71;
    const torque = clamp((MOTOR_K * (voltage - MOTOR_K * speed)) / resistance, 0.12, 2.0);
    return [speed, torque] as [number, number];
  });
}

function buildLoadCurve(level: number, speedAtLevel: number) {
  return Array.from({ length: 72 }, (_, index) => {
    const speed = SPEED_MIN + ((SPEED_MAX - SPEED_MIN) * index) / 71;
    const torque = loadTorqueAtSpeed(level, speedAtLevel, speed);
    return [speed, torque] as [number, number];
  });
}

function solveLoadState(loadFinal: number, elapsed: number): LoadState {
  const loadDelta = Math.max(0.05, loadFinal - INITIAL_LOAD);
  const speedFinal = clamp(1 - 0.34 * loadDelta, 0.38, 0.95);
  const { resistance, voltage } = motorConstants(loadFinal, speedFinal);
  const stepTime = 0.45;
  const loadTorque = elapsed >= stepTime ? loadTorqueAtSpeed(loadFinal, speedFinal, 1) : INITIAL_LOAD;
  let omega = 1;
  let current = INITIAL_LOAD / MOTOR_K;
  const trace: Array<[number, number]> = [[omega, MOTOR_K * current]];

  if (elapsed <= stepTime) {
    return { omega, current, loadTorque, speedFinal, trace };
  }

  const simTime = elapsed - stepTime;
  const samples = solveDcMotorTransient({
    voltage,
    resistance,
    motorConstant: MOTOR_K,
    inductance: ARMATURE_L,
    inertia: ROTOR_J,
    initialCurrent: current,
    initialOmega: omega,
    duration: simTime,
    dt: 0.006,
    sampleInterval: 0.08,
    loadTorque: (speed) => loadTorqueAtSpeed(loadFinal, speedFinal, speed)
  });
  const latest = samples[samples.length - 1];

  omega = latest.omega;
  current = latest.current;

  return {
    omega,
    current,
    loadTorque: latest.loadTorque,
    speedFinal,
    trace: samples.map((sample) => [sample.omega, sample.electromagneticTorque])
  };
}

export default function LoadStepDemo() {
  const [playing, setPlaying] = useState(false);
  const [finalLoad, setFinalLoad] = useState(1.45);
  const { time, reset } = useDemoClock(playing, 1);

  const t = Math.min(time, 6);
  const active = playing ? stageAt(t) : 0;
  const dynamicState = solveLoadState(finalLoad, playing ? t : 0);
  const { omega, current, loadTorque, speedFinal, trace: runningTrace } = dynamicState;
  const emf = MOTOR_K * omega;
  const electromagneticTorque = MOTOR_K * current;
  const netTorque = electromagneticTorque - loadTorque;
  const isBalanced = Math.abs(netTorque) < 0.05 && playing && t > 4.75;

  const curves = useMemo(() => {
    return {
      motor: buildMotorCurve(speedFinal, finalLoad),
      oldLoad: buildLoadCurve(INITIAL_LOAD, 1),
      newLoad: buildLoadCurve(finalLoad, speedFinal)
    };
  }, [finalLoad, speedFinal]);

  const currentPoint = plotPoint(omega, electromagneticTorque);
  const oldPoint = plotPoint(1, INITIAL_LOAD);
  const newPoint = plotPoint(speedFinal, finalLoad);
  const traceLabelPoint = plotPoint(...(runningTrace[Math.floor(runningTrace.length * 0.58)] ?? runningTrace[0]));
  const status = playing ? `当前：${STAGES[active]}，轨迹由方程积分` : "点击“突然加负载”：按 LdI/dt 与 Jdω/dt 求动态轨迹";

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
      <svg className="load-step-book-svg" viewBox="0 0 1020 430" role="img" aria-label="负载阶跃后直流电机寻找新平衡的转矩转速曲线">
        <defs>
          <marker id="load-book-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="load-book-arrow-head" />
          </marker>
        </defs>

        <g aria-label="电枢等效电路" transform="translate(36 48)">
          <text x="0" y="0" className="load-book-heading">等效电路</text>
          <circle cx="22" cy="60" r="5" className="load-book-terminal" />
          <circle cx="22" cy="160" r="5" className="load-book-terminal" />
          <path d="M 22 60 H 82 l10 -18 l18 36 l18 -36 l18 36 l10 -18 H 226" className="load-book-wire" />
          <circle cx="260" cy="60" r="34" className="load-book-source" />
          <path d="M 226 60 H 260" className="load-book-wire" />
          <path d="M 260 94 V 160 H 22" className="load-book-wire" />
          <path d="M 78 30 H 198" className="load-book-current" markerEnd="url(#load-book-arrow)" />
          <text x="138" y="22" textAnchor="middle" className="load-book-small">I=(V-E)/R</text>
          <text x="20" y="114" textAnchor="middle" className="load-book-label">V</text>
          <text x="260" y="68" textAnchor="middle" className="load-book-label">E</text>
          <text x="118" y="194" textAnchor="middle" className="load-book-note">ω↓ → E↓ → V-E↑ → I↑</text>
        </g>

        <g aria-label="稳态转矩转速曲线">
          <text x={PLOT.x + 20} y="36" className="load-book-heading">稳态转矩-转速曲线</text>
          <line x1={PLOT.x} y1={PLOT.y + PLOT.h} x2={PLOT.x + PLOT.w + 18} y2={PLOT.y + PLOT.h} className="load-book-axis" markerEnd="url(#load-book-arrow)" />
          <line x1={PLOT.x} y1={PLOT.y + PLOT.h} x2={PLOT.x} y2={PLOT.y - 18} className="load-book-axis" markerEnd="url(#load-book-arrow)" />
          <text x={PLOT.x - 28} y={PLOT.y - 20} className="load-book-label">转矩</text>
          <text x={PLOT.x + PLOT.w - 4} y={PLOT.y + PLOT.h + 34} className="load-book-label">转速</text>

          <path d={pathFromCurve(curves.motor)} className="load-book-motor-curve" />
          <path d={pathFromCurve(curves.oldLoad)} className="load-book-load-curve load-book-load-curve--old" />
          <path d={pathFromCurve(curves.newLoad)} className="load-book-load-curve" />
          <path d={pathFromCurve(runningTrace)} className="load-book-running-trace" />

          <line x1={newPoint.x} y1={newPoint.y} x2={newPoint.x} y2={PLOT.y + PLOT.h} className="load-book-guide" />
          <line x1={PLOT.x} y1={newPoint.y} x2={newPoint.x} y2={newPoint.y} className="load-book-guide" />
          <line x1={currentPoint.x} y1={currentPoint.y} x2={currentPoint.x} y2={PLOT.y + PLOT.h} className="load-book-running-guide" />
          <line x1={PLOT.x} y1={currentPoint.y} x2={currentPoint.x} y2={currentPoint.y} className="load-book-running-guide" />
          <circle cx={oldPoint.x} cy={oldPoint.y} r="5" className="load-book-old-point" />
          <circle cx={newPoint.x} cy={newPoint.y} r="6" className="load-book-new-point" />
          <circle cx={currentPoint.x} cy={currentPoint.y} r="7" className="load-book-running-point" />

          <text x={oldPoint.x + 10} y={oldPoint.y - 10} className="load-book-small">原平衡</text>
          <text x={newPoint.x + 12} y={newPoint.y - 14} className="load-book-label">X</text>
          <text x={newPoint.x + 30} y={newPoint.y + 4} className="load-book-small">新平衡</text>
          <text x={PLOT.x + 286} y={PLOT.y + 56} className="load-book-label">电机</text>
          <text x={PLOT.x + 164} y={PLOT.y + 154} className="load-book-label">负载 T_L(ω)</text>
          {runningTrace.length > 4 ? <text x={traceLabelPoint.x + 12} y={traceLabelPoint.y - 10} className="load-book-small">动态轨迹</text> : null}
          <text x={currentPoint.x + 12} y={currentPoint.y + 22} className="load-book-small">运行点</text>
        </g>

        <g aria-label="寻找平衡过程" transform="translate(62 358)">
          {STAGES.map((stage, index) => (
            <g key={stage} transform={`translate(${index * 148} 0)`}>
              <rect width="112" height="38" rx="8" className={index <= active ? "load-book-stage is-active" : "load-book-stage"} />
              <text x="56" y="25" textAnchor="middle" className="load-book-stage-text">{stage}</text>
              {index < STAGES.length - 1 ? <path d="M 116 19 H 142" className="load-book-stage-arrow" markerEnd="url(#load-book-arrow)" /> : null}
            </g>
          ))}
        </g>

        <text x="510" y="418" textAnchor="middle" className="load-book-caption">
          轨迹由 LdI/dt=V-RI-kω 与 Jdω/dt=kI-TL(ω) 数值求解
        </text>
      </svg>
    </DemoFrame>
  );
}
