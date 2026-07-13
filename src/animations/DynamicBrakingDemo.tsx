import { useState } from "react";
import { dynamicBrakingResponse } from "../utils/advancedMotorMath";
import { DemoFrame, Readout, useDemoClock } from "./shared";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function DynamicBrakingDemo() {
  const [playing, setPlaying] = useState(true);
  const [mode, setMode] = useState<"run" | "brake">("brake");
  const [initialOmega, setInitialOmega] = useState(140);
  const [motorConstant, setMotorConstant] = useState(1.5);
  const [armatureResistance, setArmatureResistance] = useState(1);
  const [brakingResistance, setBrakingResistance] = useState(6);
  const [inertia, setInertia] = useState(0.35);
  const { time, reset } = useDemoClock(playing, 1);
  const braking = dynamicBrakingResponse({
    initialOmega,
    time: mode === "brake" ? time : 0,
    motorConstant,
    armatureResistance,
    brakingResistance,
    inertia
  });
  const omega = mode === "brake" ? braking.omega : initialOmega;
  const current = mode === "brake" ? braking.current : 18;
  const torque = mode === "brake" ? braking.torque : motorConstant * current;
  const speedRatio = clamp(Math.abs(omega / Math.max(initialOmega, 1e-6)), 0, 1);
  const currentRatio = clamp(Math.abs(current) / Math.max(Math.abs(-motorConstant * initialOmega / (armatureResistance + brakingResistance)), 1e-6), 0, 1);
  const heatRatio = clamp(braking.brakingResistorPower / Math.max(1, motorConstant * motorConstant * initialOmega * initialOmega / (armatureResistance + brakingResistance)), 0, 1);
  const displayedBrakePower = mode === "brake" ? braking.brakingResistorPower : 0;

  const switchMode = (nextMode: "run" | "brake") => {
    reset();
    setMode(nextMode);
    setPlaying(true);
  };
  const handleReset = () => {
    reset();
    setMode("brake");
    setInitialOmega(140);
    setMotorConstant(1.5);
    setArmatureResistance(1);
    setBrakingResistance(6);
    setInertia(0.35);
  };

  return (
    <DemoFrame
      status={mode === "brake" ? "断开电源并接入 Rb：E 驱动反向电流，制动转矩随转速一起衰减" : "接电源运行：电源维持转速，制动支路断开"}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={handleReset}
      actions={
        <div className="segmented">
          <button type="button" className={mode === "run" ? "is-active" : ""} onClick={() => switchMode("run")}>接电源</button>
          <button type="button" className={mode === "brake" ? "is-active" : ""} onClick={() => switchMode("brake")}>接制动电阻</button>
        </div>
      }
      sliders={[
        { label: "初始转速", symbol: "ω0", value: initialOmega, min: 20, max: 260, step: 5, unit: "rad/s", onChange: setInitialOmega },
        { label: "电机常数", symbol: "k", value: motorConstant, min: 0.5, max: 3, step: 0.1, unit: "", onChange: setMotorConstant },
        { label: "电枢电阻", symbol: "Ra", value: armatureResistance, min: 0.2, max: 4, step: 0.1, unit: "Ω", onChange: setArmatureResistance },
        { label: "制动电阻", symbol: "Rb", value: brakingResistance, min: 0.5, max: 20, step: 0.5, unit: "Ω", onChange: setBrakingResistance },
        { label: "转动惯量", symbol: "J", value: inertia, min: 0.05, max: 1.2, step: 0.05, unit: "kg·m²", onChange: setInertia }
      ]}
      readouts={
        <>
          <Readout label="τb" value={braking.timeConstant} unit="s" tone="blue" />
          <Readout label="ω" value={omega} unit="rad/s" tone="green" />
          <Readout label="I" value={current} unit="A" tone={mode === "brake" ? "purple" : "red"} />
          <Readout label="PRb" value={displayedBrakePower} unit="W" tone="amber" />
        </>
      }
    >
      <svg className="advanced-book-svg" viewBox="0 0 1040 560" role="img" aria-label="能耗制动开关、电路、能量和减速过程动画">
        <defs>
          <marker id="brake-black-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" className="advanced-book-arrow-head" />
          </marker>
          <marker id="brake-red-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" className="advanced-book-arrow-head advanced-book-arrow-head--red" />
          </marker>
        </defs>

        <text x="520" y="30" textAnchor="middle" className="advanced-book-title">能耗制动：电枢从电源切换到制动电阻</text>

        <g transform="translate(40 64)" aria-label="能耗制动切换电路">
          <text x="250" y="18" textAnchor="middle" className="advanced-book-heading">开关位置与电流路径</text>
          <circle cx="270" cy="176" r="54" className="advanced-book-machine" />
          <text x="270" y="183" textAnchor="middle" className="advanced-book-label">E=kω</text>
          <path d="M 270 122 V 108 l-12 -10 l24 -16 l-24 -16 l24 -16 l-12 -8" className="advanced-book-wire" />
          <text x="296" y="86" className="advanced-book-small">Ra</text>
          <circle cx="270" cy="42" r="5" className="advanced-book-terminal" />
          <circle cx="120" cy="42" r="5" className="advanced-book-terminal" />
          <circle cx="420" cy="42" r="5" className="advanced-book-terminal" />
          <line x1="270" y1="42" x2={mode === "run" ? 130 : 410} y2="42" className="advanced-book-switch" />
          <text x="270" y="28" textAnchor="middle" className="advanced-book-small">S</text>

          <path d="M120 42 H78 V298 H270 V230" className={mode === "run" ? "advanced-book-wire is-active" : "advanced-book-wire"} />
          <line x1="56" y1="142" x2="100" y2="142" className="advanced-book-wire" />
          <line x1="66" y1="164" x2="90" y2="164" className="advanced-book-wire" />
          <text x="44" y="158" className="advanced-book-label">V</text>

          <path d="M420 42 V92 l14 12 l-28 20 l28 20 l-28 20 l14 12 V298 H270" className={mode === "brake" ? "advanced-book-wire is-active" : "advanced-book-wire"} />
          <text x="448" y="142" className="advanced-book-label">Rb</text>
          <path d={mode === "brake" ? "M 300 22 H 398" : "M 142 22 H 242"} className="advanced-book-current is-active" markerEnd="url(#brake-red-arrow)" />
          <path d="M 270 210 V 142" className="advanced-book-emf" markerEnd="url(#brake-black-arrow)" />
          <text x="270" y="328" textAnchor="middle" className="advanced-book-small">{mode === "brake" ? "I=−E/(Ra+Rb)：实际电流从电机流向 Rb" : "电源维持运行，Rb 支路断开"}</text>
          {mode === "brake" ? (
            <g aria-label="制动电阻发热">
              {[0, 1, 2].map((index) => (
                <path key={index} d={`M ${406 + index * 14} ${92 - heatRatio * 18} q 8 -10 0 -20`} className="advanced-book-heat" />
              ))}
            </g>
          ) : null}
        </g>

        <g transform="translate(544 64)" aria-label="能耗制动机械过程">
          <text x="222" y="18" textAnchor="middle" className="advanced-book-heading">动能怎样变成热</text>
          <circle cx="92" cy="122" r="74" className="advanced-book-inertia" />
          <circle cx="92" cy="122" r="12" className="advanced-book-terminal" />
          <line x1="92" y1="122" x2={92 + 58 * Math.cos(-time * 5 * speedRatio)} y2={122 + 58 * Math.sin(-time * 5 * speedRatio)} className="advanced-book-rotor-line" />
          <path d="M 34 88 A 70 70 0 0 1 140 58" className="advanced-book-power" markerEnd="url(#brake-black-arrow)" />
          <text x="92" y="220" textAnchor="middle" className="advanced-book-label">ω={omega.toFixed(1)} rad/s</text>

          <path d="M 176 122 H 268" className="advanced-book-power is-active" markerEnd="url(#brake-black-arrow)" />
          <rect x="286" y="72" width="116" height="100" rx="5" className="advanced-book-resistor-box" />
          <path d="M 310 122 l14 -18 l22 36 l22 -36 l22 36" className="advanced-book-wire" />
          <text x="344" y="194" textAnchor="middle" className="advanced-book-label">Rb 发热</text>

          <g transform="translate(10 260)">
            <text x="0" y="14" className="advanced-book-small">转速 ω</text>
            <rect x="82" y="0" width="300" height="16" className="advanced-book-meter" />
            <rect x="82" y="0" width={300 * speedRatio} height="16" className="advanced-book-meter-fill" />
            <text x="0" y="52" className="advanced-book-small">制动电流 |I|</text>
            <rect x="82" y="38" width="300" height="16" className="advanced-book-meter" />
            <rect x="82" y="38" width={300 * currentRatio} height="16" className="advanced-book-meter-fill advanced-book-meter-fill--red" />
            <text x="0" y="90" className="advanced-book-small">制动转矩 |T|</text>
            <rect x="82" y="76" width="300" height="16" className="advanced-book-meter" />
            <rect x="82" y="76" width={300 * currentRatio} height="16" className="advanced-book-meter-fill" />
          </g>
        </g>

        <g transform="translate(74 432)" aria-label="能耗制动推导关系">
          <rect width="892" height="82" rx="5" className="advanced-book-equation-panel" />
          <text x="446" y="28" textAnchor="middle" className="advanced-book-equation">E=kω　 I=−E/(Ra+Rb)　 J·dω/dt=kI</text>
          <text x="446" y="58" textAnchor="middle" className="advanced-book-equation">ω(t)=ω0e^(−t/τb)　 τb=J(Ra+Rb)/k²</text>
        </g>
      </svg>
    </DemoFrame>
  );
}
