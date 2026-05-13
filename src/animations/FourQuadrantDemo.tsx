import { useState } from "react";
import { ArrowDefs, DemoFrame, Readout, useDemoClock } from "./shared";

function quadrant(omega: number, torque: number) {
  if (omega >= 0 && torque >= 0) return "I 正转电动";
  if (omega >= 0 && torque < 0) return "II 正转发电";
  if (omega < 0 && torque < 0) return "III 反转电动";
  return "IV 反转发电";
}

export default function FourQuadrantDemo() {
  const [playing, setPlaying] = useState(true);
  const [omega, setOmega] = useState(80);
  const [torque, setTorque] = useState(40);
  const [V, setV] = useState(220);
  const [E, setE] = useState(180);
  const { reset } = useDemoClock(playing, 1);
  const q = quadrant(omega, torque);
  const motoring = omega * torque >= 0;

  return (
    <DemoFrame
      status={`${q}：${motoring ? "机械功率输出，电动运行" : "机械功率被吸收，制动运行"}`}
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
          <Readout label="象限" value={q} tone={motoring ? "green" : "purple"} />
          <Readout label="功率流" value={motoring ? "电→机" : "机→电/热"} tone={motoring ? "green" : "purple"} />
        </>
      }
    >
      <svg className="quadrant-svg" viewBox="0 0 560 420" role="img" aria-label="直流电机四象限运行图">
        <ArrowDefs />
        <line x1="42" y1="210" x2="522" y2="210" className="axis-line" markerEnd="url(#arrow-blue)" />
        <line x1="280" y1="376" x2="280" y2="44" className="axis-line" markerEnd="url(#arrow-blue)" />
        <text x="506" y="236" className="svg-axis-label">ω</text>
        <text x="298" y="58" className="svg-axis-label">T</text>
        {[
          ["I 正转电动", 390, 116],
          ["II 正转发电", 388, 316],
          ["III 反转电动", 132, 316],
          ["IV 反转发电", 132, 116]
        ].map(([label, x, y]) => (
          <text key={label} x={Number(x)} y={Number(y)} textAnchor="middle" className="quadrant-label">{label}</text>
        ))}
        <circle cx={280 + omega * 1.35} cy={210 - torque * 1.25} r="11" className={motoring ? "workpoint workpoint--green" : "workpoint workpoint--purple"} />
      </svg>
    </DemoFrame>
  );
}
