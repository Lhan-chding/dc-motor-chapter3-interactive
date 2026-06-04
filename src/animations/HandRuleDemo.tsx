import { useState } from "react";
import { DemoFrame, Readout, useDemoClock } from "./shared";

type RuleMode = "left" | "right";

function HandGesture({ mode, activeStep }: { mode: RuleMode; activeStep: number }) {
  const isLeft = mode === "left";
  const title = isLeft ? "左手定则" : "右手定则";
  const thumbLabel = isLeft ? "F" : "v";
  const indexLabel = "B";
  const middleLabel = isLeft ? "I" : "E";

  return (
    <g aria-label={`${title}手势图`}>
      <rect x="34" y="34" width="354" height="326" rx="10" className="hand-rule-panel" />
      <text x="211" y="74" textAnchor="middle" className="hand-rule-title">{title}</text>
      <text x="211" y="102" textAnchor="middle" className="hand-rule-subtitle">
        {isLeft ? "电动机：判受力" : "发电机：判电势"}
      </text>

      <path d="M 166 210 C 150 184, 158 154, 186 148 C 214 142, 245 158, 260 184 C 278 214, 274 260, 252 284 C 231 307, 184 302, 165 276 C 154 260, 155 231, 166 210 Z" className="hand-palm" />
      <path d="M 188 158 L 174 78 C 172 65, 181 54, 194 52 C 207 50, 218 59, 220 72 L 232 154 Z" className="hand-finger" />
      <path d="M 228 162 L 304 120 C 317 113, 332 118, 339 130 C 346 142, 342 157, 329 164 L 256 204 Z" className="hand-finger" />
      <path d="M 170 236 L 88 238 C 74 238, 64 228, 64 215 C 64 202, 74 192, 88 192 L 170 193 Z" className="hand-finger" />
      <path d="M 178 284 L 154 324 C 148 335, 134 339, 123 333 C 112 327, 108 314, 114 303 L 138 263 Z" className="hand-thumb-base" />

      <path d="M 96 194 H 55" className={activeStep === 1 ? "hand-rule-arrow hand-rule-arrow--red is-active" : "hand-rule-arrow hand-rule-arrow--red"} markerEnd="url(#hand-arrow-red)" />
      <text x="42" y="199" textAnchor="end" className="hand-rule-axis hand-rule-axis--red">{middleLabel}</text>
      <path d="M 205 74 V 34" className={activeStep === 0 ? "hand-rule-arrow hand-rule-arrow--blue is-active" : "hand-rule-arrow hand-rule-arrow--blue"} markerEnd="url(#hand-arrow-blue)" />
      <text x="205" y="25" textAnchor="middle" className="hand-rule-axis hand-rule-axis--blue">{indexLabel}</text>
      <path d="M 321 130 L 360 108" className={activeStep === 2 ? "hand-rule-arrow hand-rule-arrow--green is-active" : "hand-rule-arrow hand-rule-arrow--green"} markerEnd="url(#hand-arrow-green)" />
      <text x="374" y="108" className="hand-rule-axis hand-rule-axis--green">{thumbLabel}</text>

      <g className="hand-rule-caption">
        <rect x="70" y="315" width="282" height="26" rx="4" />
        <text x="211" y="333" textAnchor="middle">
          {isLeft ? "B、I 确定 F" : "v、B 确定 E"}
        </text>
      </g>
    </g>
  );
}

function FieldScene({ mode, activeStep, phase }: { mode: RuleMode; activeStep: number; phase: number }) {
  const isLeft = mode === "left";
  const y = 210 + Math.sin(phase * Math.PI * 2) * 18;
  const conductorOut = isLeft;
  const forceUp = isLeft;
  const status = isLeft ? "B + I -> F" : "v + B -> E";

  return (
    <g aria-label={isLeft ? "左手定则对应电动机导体图" : "右手定则对应发电机导体图"}>
      <rect x="420" y="34" width="430" height="326" rx="10" className="hand-rule-panel" />
      <text x="635" y="74" textAnchor="middle" className="hand-rule-title">{isLeft ? "载流导体受力" : "运动导体感应"}</text>

      <rect x="466" y="120" width="94" height="190" className="hand-rule-pole hand-rule-pole--n" />
      <rect x="710" y="120" width="94" height="190" className="hand-rule-pole hand-rule-pole--s" />
      <text x="513" y="178" textAnchor="middle" className="hand-rule-pole-text">N</text>
      <text x="757" y="178" textAnchor="middle" className="hand-rule-pole-text">S</text>

      {[150, 190, 230, 270].map((lineY) => (
        <path key={lineY} d={`M 562 ${lineY} H 704`} className={activeStep === 0 ? "hand-field-line is-active" : "hand-field-line"} markerEnd="url(#hand-arrow-blue)" />
      ))}

      <g transform={`translate(635 ${y})`}>
        <rect x="-13" y="-72" width="26" height="144" rx="13" className="hand-conductor" />
        {isLeft ? (
          <g className={activeStep === 1 ? "hand-current-mark is-active" : "hand-current-mark"}>
            <circle r="22" />
            {conductorOut ? <circle r="5" /> : (
              <g>
                <line x1="-8" y1="-8" x2="8" y2="8" />
                <line x1="8" y1="-8" x2="-8" y2="8" />
              </g>
            )}
          </g>
        ) : (
          <path d={phase % 1 < 0.5 ? "M 0 84 V 116" : "M 0 -84 V -116"} className={activeStep === 1 ? "hand-motion-line is-active" : "hand-motion-line"} markerEnd="url(#hand-arrow-green)" />
        )}
      </g>

      {isLeft ? (
        <path d={forceUp ? `M 635 ${y - 88} V ${y - 128}` : `M 635 ${y + 88} V ${y + 128}`} className={activeStep === 2 ? "hand-force-line is-active" : "hand-force-line"} markerEnd="url(#hand-arrow-green)" />
      ) : (
        <g className={activeStep === 2 ? "hand-emf-meter is-active" : "hand-emf-meter"}>
          <path d="M 602 142 C 580 142, 574 118, 594 108 H 676 C 696 118, 690 142, 668 142" />
          <rect x="597" y="92" width="76" height="28" rx="4" />
          <text x="635" y="112" textAnchor="middle">E</text>
        </g>
      )}

      <g className="hand-rule-result">
        <rect x="536" y="316" width="198" height="28" rx="4" />
        <text x="635" y="335" textAnchor="middle">{status}</text>
      </g>
    </g>
  );
}

function RuleSteps({ mode, activeStep }: { mode: RuleMode; activeStep: number }) {
  const steps = mode === "left"
    ? ["食指指磁场 B", "中指指电流 I", "拇指是受力 F"]
    : ["食指指磁场 B", "拇指指运动 v", "中指是电势 E"];

  return (
    <g aria-label="三步判向">
      {steps.map((step, index) => (
        <g key={step} transform={`translate(${90 + index * 250} 392)`}>
          <rect width="208" height="48" rx="6" className={index === activeStep ? "hand-step is-active" : "hand-step"} />
          <text x="104" y="30" textAnchor="middle" className="hand-step-text">{step}</text>
        </g>
      ))}
    </g>
  );
}

export default function HandRuleDemo() {
  const [playing, setPlaying] = useState(true);
  const [mode, setMode] = useState<RuleMode>("left");
  const [speed, setSpeed] = useState(45);
  const { time, reset } = useDemoClock(playing, speed / 45);
  const activeStep = Math.floor((time * 1.2) % 3);
  const phase = time * 0.7;
  const status = mode === "left"
    ? "左手定则：已知 B 和 I，判断受力 F"
    : "右手定则：已知 v 和 B，判断感应电势 E";

  return (
    <DemoFrame
      status={status}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      actions={
        <div className="segmented">
          <button type="button" className={mode === "left" ? "is-active" : ""} onClick={() => setMode("left")}>左手定则</button>
          <button type="button" className={mode === "right" ? "is-active" : ""} onClick={() => setMode("right")}>右手定则</button>
        </div>
      }
      sliders={[{ label: "演示速度", symbol: "n", value: speed, min: 20, max: 100, step: 5, unit: "rpm", onChange: setSpeed }]}
      readouts={
        <>
          <Readout label="用途" value={mode === "left" ? "电动机" : "发电机"} tone={mode === "left" ? "green" : "purple"} />
          <Readout label="输入" value={mode === "left" ? "B + I" : "v + B"} tone="blue" />
          <Readout label="输出" value={mode === "left" ? "F" : "E"} tone={mode === "left" ? "green" : "purple"} />
        </>
      }
    >
      <svg className="hand-rule-svg" viewBox="0 0 880 470" role="img" aria-label="左右手定则手势与电机物理量对应图">
        <defs>
          <marker id="hand-arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--blue)" />
          </marker>
          <marker id="hand-arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--red)" />
          </marker>
          <marker id="hand-arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--green)" />
          </marker>
        </defs>
        <HandGesture mode={mode} activeStep={activeStep} />
        <FieldScene mode={mode} activeStep={activeStep} phase={phase} />
        <RuleSteps mode={mode} activeStep={activeStep} />
      </svg>
    </DemoFrame>
  );
}
