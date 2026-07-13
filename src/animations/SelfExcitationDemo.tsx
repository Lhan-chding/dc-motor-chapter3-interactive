import { useMemo, useState } from "react";
import { findSelfExcitationOperatingPoint, magnetizationVoltage } from "../utils/advancedMotorMath";
import { DemoFrame, Readout, useDemoClock } from "./shared";

const GRAPH = { x: 520, y: 76, width: 430, height: 300, currentMax: 7, voltageMax: 320 };

function graphPoint(current: number, voltage: number) {
  const visibleCurrent = Math.min(GRAPH.currentMax, Math.max(0, current));
  const visibleVoltage = Math.min(GRAPH.voltageMax, Math.max(0, voltage));
  return {
    x: GRAPH.x + (visibleCurrent / GRAPH.currentMax) * GRAPH.width,
    y: GRAPH.y + GRAPH.height - (visibleVoltage / GRAPH.voltageMax) * GRAPH.height
  };
}

function visibleResistanceLine(resistance: number) {
  const endCurrent = Math.min(GRAPH.currentMax, GRAPH.voltageMax / resistance);
  return [graphPoint(0, 0), graphPoint(endCurrent, resistance * endCurrent)];
}

function pathFromPoints(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
}

export default function SelfExcitationDemo() {
  const [playing, setPlaying] = useState(true);
  const [fieldResistance, setFieldResistance] = useState(90);
  const [residualFlux, setResidualFlux] = useState(0.14);
  const { time, reset } = useDemoClock(playing, 1);
  const residualVoltage = residualFlux * 60;
  const saturationVoltage = 240;
  const kneeCurrent = 1.2;
  const state = findSelfExcitationOperatingPoint({ fieldResistance, residualVoltage, saturationVoltage, kneeCurrent });
  const activeStage = state.success ? Math.min(4, Math.floor(time / 0.8) % 6) : Math.min(1, Math.floor(time / 0.8) % 3);

  const curves = useMemo(() => {
    const magnetization = Array.from({ length: 90 }, (_, index) => {
      const current = (index / 89) * GRAPH.currentMax;
      return graphPoint(current, magnetizationVoltage({ fieldCurrent: current, residualVoltage, saturationVoltage, kneeCurrent }));
    });
    const resistanceLine = visibleResistanceLine(fieldResistance);
    const criticalLine = visibleResistanceLine(state.criticalResistance);
    return { magnetization, resistanceLine, criticalLine };
  }, [fieldResistance, residualVoltage, state.criticalResistance]);

  const operatingPoint = graphPoint(state.fieldCurrent, state.generatedVoltage);
  const status = state.reason === "no-residual"
    ? "无剩磁：没有初始 E，正反馈无法启动"
    : state.reason === "resistance-too-high"
      ? `Rf≥Rcrit(${state.criticalResistance.toFixed(0)}Ω)：仅剩低电压交点，未成功建压`
      : "剩磁产生初始 E，励磁电流增强磁通，最终停在真实交点";

  const handleReset = () => {
    reset();
    setFieldResistance(90);
    setResidualFlux(0.14);
  };

  return (
    <DemoFrame
      status={status}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={handleReset}
      actions={
        <>
          <button type="button" className="pill-button" onClick={() => setFieldResistance(90)}>可自励</button>
          <button type="button" className="pill-button" onClick={() => setFieldResistance(220)}>超过临界电阻</button>
          <button type="button" className="pill-button" onClick={() => setResidualFlux(0)}>消除剩磁</button>
        </>
      }
      sliders={[
        { label: "励磁电阻", symbol: "Rf", value: fieldResistance, min: 40, max: 260, step: 5, unit: "Ω", onChange: setFieldResistance },
        { label: "剩磁", symbol: "Φr", value: residualFlux, min: 0, max: 0.4, step: 0.02, unit: "pu", onChange: setResidualFlux }
      ]}
      readouts={
        <>
          <Readout label="自励" value={state.success ? "成功" : "失败"} tone={state.success ? "green" : "amber"} />
          <Readout label="Rcrit" value={state.criticalResistance} unit="Ω" tone="blue" />
          <Readout label="If" value={state.fieldCurrent} unit="A" tone="red" />
          <Readout label="Va" value={state.generatedVoltage} unit="V" tone="purple" />
        </>
      }
    >
      <svg className="advanced-book-svg" viewBox="0 0 1040 560" role="img" aria-label="教材图3.16风格的自励并励发电机建压动画">
        <defs>
          <marker id="self-black-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" className="advanced-book-arrow-head" />
          </marker>
          <marker id="self-red-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" className="advanced-book-arrow-head advanced-book-arrow-head--red" />
          </marker>
        </defs>

        <text x="520" y="30" textAnchor="middle" className="advanced-book-title">图 3.16  自励并励发电机的等效电路及磁化曲线</text>

        <g transform="translate(42 72)" aria-label="自励并励发电机回路">
          <text x="212" y="18" textAnchor="middle" className="advanced-book-heading">原动机保持转速，剩磁启动建压</text>
          <circle cx="194" cy="182" r="58" className="advanced-book-machine" />
          <text x="194" y="189" textAnchor="middle" className="advanced-book-label">电枢 E</text>
          <line x1="194" y1="124" x2="194" y2="82" className="advanced-book-wire" />
          <line x1="194" y1="240" x2="194" y2="300" className="advanced-book-wire" />
          <line x1="194" y1="82" x2="360" y2="82" className="advanced-book-wire" />
          <line x1="194" y1="300" x2="360" y2="300" className="advanced-book-wire" />
          <line x1="360" y1="82" x2="360" y2="116" className="advanced-book-wire" />
          <path d="M360 116 l-16 14 l32 20 l-32 20 l32 20 l-16 14" className="advanced-book-wire" />
          <path d="M360 204 c-28 8 -28 28 0 36 c28 8 28 28 0 36" className="advanced-book-wire" />
          <line x1="360" y1="276" x2="360" y2="300" className="advanced-book-wire" />
          <text x="390" y="164" className="advanced-book-label">Rf</text>
          <text x="390" y="246" className="advanced-book-label">励磁绕组</text>
          <path d="M 328 104 V 270" className="advanced-book-current is-active" markerEnd="url(#self-red-arrow)" />
          <text x="312" y="196" className="advanced-book-small">If</text>
          <path d="M 404 280 V 96" className="advanced-book-voltage" markerEnd="url(#self-red-arrow)" />
          <text x="414" y="194" className="advanced-book-label">Va</text>

          <line x1="18" y1="182" x2="136" y2="182" className="advanced-book-shaft" />
          <circle cx="38" cy="182" r="22" className="advanced-book-inertia" />
          <path d="M 12 150 A 40 40 0 0 1 64 146" className="advanced-book-power is-active" markerEnd="url(#self-black-arrow)" />
          <text x="76" y="224" textAnchor="middle" className="advanced-book-small">原动机驱动</text>
          <text x="212" y="344" textAnchor="middle" className="advanced-book-equation">If=Va/Rf</text>
        </g>

        <g aria-label="磁化曲线与励磁电阻线">
          <line x1={GRAPH.x} y1={GRAPH.y + GRAPH.height} x2={GRAPH.x + GRAPH.width + 20} y2={GRAPH.y + GRAPH.height} className="advanced-book-axis" markerEnd="url(#self-black-arrow)" />
          <line x1={GRAPH.x} y1={GRAPH.y + GRAPH.height} x2={GRAPH.x} y2={GRAPH.y - 18} className="advanced-book-axis" markerEnd="url(#self-black-arrow)" />
          <text x={GRAPH.x - 30} y={GRAPH.y - 16} className="advanced-book-label">Va / V</text>
          <text x={GRAPH.x + GRAPH.width} y={GRAPH.y + GRAPH.height + 30} textAnchor="end" className="advanced-book-label">励磁电流 If / A</text>
          {[1, 2, 4, 6].map((value) => {
            const point = graphPoint(value, 0);
            return <text key={value} x={point.x} y={GRAPH.y + GRAPH.height + 18} textAnchor="middle" className="advanced-book-small">{value}</text>;
          })}
          {[100, 200, 300].map((value) => {
            const point = graphPoint(0, value);
            return <text key={value} x={GRAPH.x - 12} y={point.y + 5} textAnchor="end" className="advanced-book-small">{value}</text>;
          })}
          <path d={pathFromPoints(curves.magnetization)} className="advanced-book-magnetization" />
          <path d={pathFromPoints(curves.criticalLine)} className="advanced-book-critical-line" />
          <path d={pathFromPoints(curves.resistanceLine)} className="advanced-book-resistance-line" />
          <text x="774" y="112" className="advanced-book-small">磁化曲线</text>
          <text x="826" y="198" className="advanced-book-small">Rf={fieldResistance.toFixed(0)}Ω</text>
          <text x="650" y="134" className="advanced-book-small">临界电阻线</text>
          {state.reason !== "no-residual" ? (
            <>
              <line x1={operatingPoint.x} y1={operatingPoint.y} x2={operatingPoint.x} y2={GRAPH.y + GRAPH.height} className="advanced-book-live-guide" />
              <line x1={GRAPH.x} y1={operatingPoint.y} x2={operatingPoint.x} y2={operatingPoint.y} className="advanced-book-live-guide" />
              <circle cx={operatingPoint.x} cy={operatingPoint.y} r="7" className={state.success ? "advanced-book-live-point" : "advanced-book-live-point is-warning"} />
              <text x={operatingPoint.x + 12} y={operatingPoint.y - 10} className="advanced-book-label">{state.success ? "稳定工作点" : "低电压交点"}</text>
            </>
          ) : null}
        </g>

        <g transform="translate(68 454)" aria-label="自励正反馈链">
          {["剩磁 Φr", "初始 E", "If=E/Rf", "磁通增强", "E 继续上升", "交点稳定"].map((label, index) => (
            <g key={label} transform={`translate(${index * 154} 0)`}>
              <rect width="118" height="44" rx="5" className={index <= activeStage ? "advanced-book-stage is-active" : "advanced-book-stage"} />
              <text x="59" y="28" textAnchor="middle" className="advanced-book-stage-text">{label}</text>
              {index < 5 ? <line x1="122" y1="22" x2="146" y2="22" className="advanced-book-stage-arrow" markerEnd="url(#self-black-arrow)" /> : null}
            </g>
          ))}
          <text x="462" y="76" textAnchor="middle" className="advanced-book-small">励磁接反、无剩磁或 Rf≥Rcrit，正反馈均不能建立额定电压</text>
        </g>
      </svg>
    </DemoFrame>
  );
}
