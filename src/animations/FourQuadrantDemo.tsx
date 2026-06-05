import { useState } from "react";
import { DemoFrame, Readout, useDemoClock } from "./shared";

function quadrant(omega: number, torque: number) {
  if (omega >= 0 && torque >= 0) {
    return { name: "I 正转电动", flow: "电->机", motoring: true };
  }
  if (omega >= 0 && torque < 0) {
    return { name: "II 正转发电", flow: "机->电", motoring: false };
  }
  if (omega < 0 && torque < 0) {
    return { name: "III 反转电动", flow: "电->机", motoring: true };
  }
  return { name: "IV 反转发电", flow: "机->电", motoring: false };
}

export default function FourQuadrantDemo() {
  const [playing, setPlaying] = useState(true);
  const [omega, setOmega] = useState(80);
  const [torque, setTorque] = useState(40);
  const [V, setV] = useState(220);
  const [E, setE] = useState(180);
  const { reset } = useDemoClock(playing, 1);
  const q = quadrant(omega, torque);
  const pointX = 520 + omega * 2.25;
  const pointY = 260 - torque * 1.55;
  const current = V - E;

  return (
    <DemoFrame
      status={`${q.name}：${q.motoring ? "转速和转矩同号，电动运行" : "转速和转矩异号，制动/发电运行"}`}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      sliders={[
        { label: "转速", symbol: "ω", value: omega, min: -160, max: 160, step: 5, unit: "rad/s", onChange: setOmega },
        { label: "转矩", symbol: "T", value: torque, min: -120, max: 120, step: 5, unit: "N·m", onChange: setTorque },
        { label: "端电压", symbol: "V", value: V, min: -300, max: 300, step: 10, unit: "V", onChange: setV },
        { label: "反电动势", symbol: "E", value: E, min: -300, max: 300, step: 10, unit: "V", onChange: setE }
      ]}
      readouts={
        <>
          <Readout label="象限" value={q.name} tone={q.motoring ? "green" : "purple"} />
          <Readout label="功率流" value={q.flow} tone={q.motoring ? "green" : "purple"} />
          <Readout label="V-E" value={current} unit="V" tone={current >= 0 ? "red" : "purple"} />
        </>
      }
    >
      <svg className="four-quadrant-book-svg" viewBox="0 0 1040 520" role="img" aria-label="直流电机四象限运行线稿图">
        <defs>
          <marker id="fq-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" className="book-arrow-head" />
          </marker>
        </defs>
        <rect x="34" y="34" width="972" height="452" rx="8" className="book-figure-panel" />
        <text x="520" y="72" textAnchor="middle" className="book-title">四象限运行：看 ω 与 T 的符号</text>

        <line x1="116" y1="260" x2="936" y2="260" className="book-axis" markerEnd="url(#fq-arrow)" />
        <line x1="520" y1="442" x2="520" y2="92" className="book-axis" markerEnd="url(#fq-arrow)" />
        <text x="930" y="292" textAnchor="end" className="book-axis-label">ω</text>
        <text x="544" y="110" className="book-axis-label">T</text>

        <line x1="116" y1="92" x2="936" y2="442" className="book-guide faint" />
        <line x1="116" y1="442" x2="936" y2="92" className="book-guide faint" />
        <text x="710" y="152" textAnchor="middle" className="book-quadrant-label">I 正转电动</text>
        <text x="714" y="384" textAnchor="middle" className="book-quadrant-label">II 正转发电</text>
        <text x="320" y="384" textAnchor="middle" className="book-quadrant-label">III 反转电动</text>
        <text x="320" y="152" textAnchor="middle" className="book-quadrant-label">IV 反转发电</text>

        <line x1={pointX} y1="260" x2={pointX} y2={pointY} className="book-running-guide" />
        <line x1="520" y1={pointY} x2={pointX} y2={pointY} className="book-running-guide" />
        <circle cx={pointX} cy={pointY} r="10" className="book-live-point" />
        <text x={pointX + 18} y={pointY - 12} className="book-small">运行点</text>

        <g transform="translate(404 452)" aria-label="功率流向说明">
          <rect x="0" y="0" width="232" height="30" rx="5" className="book-stage" />
          <text x="116" y="21" textAnchor="middle" className="book-stage-text">{q.motoring ? "ωT > 0：电动" : "ωT < 0：制动/发电"}</text>
        </g>

        <g transform="translate(76 80)" aria-label="电压和反电动势关系">
          <rect x="0" y="0" width="210" height="72" rx="6" className="book-subpanel" />
          <text x="16" y="28" className="book-small">电枢电流方向</text>
          <text x="16" y="54" className="book-equation">I ∝ V - E</text>
        </g>
      </svg>
    </DemoFrame>
  );
}
