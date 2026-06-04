import { useState } from "react";
import { DemoFrame, Readout, useDemoClock } from "./shared";

type RuleMode = "left" | "right";
type Point = {
  x: number;
  y: number;
};

function labelFor(mode: RuleMode) {
  return mode === "left"
    ? {
        title: "左手定则",
        subtitle: "电动机：由 B、I 判 F",
        index: "B",
        middle: "I",
        thumb: "F",
        result: "B + I -> F",
        use: "电动机"
      }
    : {
        title: "右手定则",
        subtitle: "发电机：由 v、B 判 E",
        index: "B",
        middle: "E",
        thumb: "v",
        result: "v + B -> E",
        use: "发电机"
      };
}

function Arrow({
  from,
  to,
  label,
  tone,
  active,
  dashed = false
}: {
  from: Point;
  to: Point;
  label: string;
  tone: "blue" | "red" | "green" | "purple";
  active: boolean;
  dashed?: boolean;
}) {
  return (
    <g aria-label={label}>
      <path
        d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
        className={`rule-line rule-line--${tone}${active ? " is-active" : ""}${dashed ? " is-dashed" : ""}`}
        markerEnd={`url(#rule-arrow-${tone})`}
      />
      <text x={to.x + 10} y={to.y - 8} className={`rule-label rule-label--${tone}`}>
        {label}
      </text>
    </g>
  );
}

function HandReference({ mode, activeStep }: { mode: RuleMode; activeStep: number }) {
  const labels = labelFor(mode);

  return (
    <g aria-label={`${labels.title}三指判向示意`}>
      <rect x="46" y="46" width="370" height="318" rx="4" className="rule-panel" />
      <text x="231" y="82" textAnchor="middle" className="rule-heading">{labels.title}</text>
      <text x="231" y="108" textAnchor="middle" className="rule-subheading">{labels.subtitle}</text>

      <g className="rule-hand" aria-label="线稿手势">
        <path d="M 178 260 C 160 236, 164 200, 194 184 C 222 169, 258 178, 277 206 C 296 234, 294 276, 270 300 C 244 326, 199 318, 178 260 Z" />
        <path d="M 210 185 L 210 132" />
        <path d="M 220 132 L 220 185" />
        <path d="M 220 132 C 220 116, 235 116, 235 132 L 235 190" />
        <path d="M 240 194 L 309 153" />
        <path d="M 250 209 L 320 168" />
        <path d="M 309 153 C 323 145, 334 160, 320 168" />
        <path d="M 178 230 L 113 230" />
        <path d="M 178 245 L 113 245" />
        <path d="M 113 230 C 98 230, 98 245, 113 245" />
        <path d="M 196 292 L 164 326" />
        <path d="M 210 302 L 178 338" />
      </g>

      <Arrow from={{ x: 226, y: 138 }} to={{ x: 226, y: 72 }} label={labels.index} tone="blue" active={activeStep === 0} />
      <Arrow from={{ x: 142, y: 238 }} to={{ x: 82, y: 238 }} label={labels.middle} tone={mode === "left" ? "red" : "purple"} active={activeStep === 1} />
      <Arrow from={{ x: 288, y: 172 }} to={{ x: 354, y: 132 }} label={labels.thumb} tone="green" active={activeStep === 2} />

      <g className="rule-caption">
        <rect x="84" y="318" width="294" height="28" rx="4" />
        <text x="231" y="337" textAnchor="middle">{labels.result}</text>
      </g>
    </g>
  );
}

function ConductorMark({ out }: { out: boolean }) {
  return (
    <g className="rule-dot-cross" aria-label={out ? "出纸面" : "入纸面"}>
      <circle r="16" />
      {out ? (
        <circle r="4" />
      ) : (
        <g>
          <line x1="-6" y1="-6" x2="6" y2="6" />
          <line x1="6" y1="-6" x2="-6" y2="6" />
        </g>
      )}
    </g>
  );
}

function FieldReference({ mode, activeStep, time }: { mode: RuleMode; activeStep: number; time: number }) {
  const labels = labelFor(mode);
  const isLeft = mode === "left";
  const conductorY = 212 + Math.sin(time * Math.PI * 2) * 7;
  const activeForce = activeStep === 2;

  return (
    <g aria-label={`${labels.title}在电机导体中的对应关系`}>
      <rect x="444" y="46" width="470" height="318" rx="4" className="rule-panel" />
      <text x="679" y="82" textAnchor="middle" className="rule-heading">{isLeft ? "电动机判向" : "发电机判向"}</text>
      <text x="679" y="108" textAnchor="middle" className="rule-subheading">{isLeft ? "载流导体在磁场中受力" : "运动导体切割磁场产生电势"}</text>

      <rect x="494" y="142" width="96" height="156" className="rule-pole" />
      <rect x="768" y="142" width="96" height="156" className="rule-pole" />
      <text x="542" y="208" textAnchor="middle" className="rule-pole-text">N</text>
      <text x="816" y="208" textAnchor="middle" className="rule-pole-text">S</text>

      {[166, 202, 238, 274].map((y) => (
        <path
          key={y}
          d={`M 598 ${y} H 760`}
          className={`rule-field${activeStep === 0 ? " is-active" : ""}`}
          markerEnd="url(#rule-arrow-blue)"
        />
      ))}

      <g transform={`translate(679 ${conductorY})`}>
        <rect x="-12" y="-76" width="24" height="152" rx="12" className="rule-conductor" />
        {isLeft ? (
          <g className={activeStep === 1 ? "is-active" : ""}>
            <ConductorMark out />
          </g>
        ) : null}
      </g>

      {isLeft ? (
        <>
          <path
            d={`M 679 ${conductorY - 96} V ${conductorY - 138}`}
            className={`rule-line rule-line--green${activeForce ? " is-active" : ""}`}
            markerEnd="url(#rule-arrow-green)"
          />
          <text x="694" y={conductorY - 130} className="rule-label rule-label--green">F</text>
        </>
      ) : (
        <>
          <path
            d={`M 679 ${conductorY + 94} V ${conductorY + 134}`}
            className={`rule-line rule-line--green${activeStep === 2 ? " is-active" : ""}`}
            markerEnd="url(#rule-arrow-green)"
          />
          <text x="694" y={conductorY + 128} className="rule-label rule-label--green">v</text>
          <g className={`rule-emf${activeStep === 1 ? " is-active" : ""}`}>
            <path d="M 635 132 H 723" />
            <rect x="644" y="114" width="70" height="28" rx="3" />
            <text x="679" y="134" textAnchor="middle">E</text>
          </g>
        </>
      )}

      <g className="rule-caption">
        <rect x="558" y="318" width="242" height="28" rx="4" />
        <text x="679" y="337" textAnchor="middle">{labels.result}</text>
      </g>
    </g>
  );
}

function RuleSteps({ mode, activeStep }: { mode: RuleMode; activeStep: number }) {
  const steps = mode === "left"
    ? ["食指：磁场 B", "中指：电流 I", "拇指：受力 F"]
    : ["食指：磁场 B", "拇指：运动 v", "中指：电势 E"];

  return (
    <g aria-label="判向步骤">
      {steps.map((step, index) => (
        <g key={step} transform={`translate(${132 + index * 245} 400)`}>
          <rect width="200" height="48" rx="4" className={index === activeStep ? "rule-step is-active" : "rule-step"} />
          <text x="100" y="30" textAnchor="middle" className="rule-step-text">{step}</text>
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
  const activeStep = Math.floor((time * 1.1) % 3);
  const labels = labelFor(mode);

  return (
    <DemoFrame
      status={mode === "left" ? "左手定则：电流在磁场中受力" : "右手定则：运动导体产生感应电势"}
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
          <Readout label="用途" value={labels.use} tone={mode === "left" ? "green" : "purple"} />
          <Readout label="输入" value={mode === "left" ? "B + I" : "v + B"} tone="blue" />
          <Readout label="输出" value={mode === "left" ? "F" : "E"} tone={mode === "left" ? "green" : "purple"} />
        </>
      }
    >
      <svg className="hand-rule-svg" viewBox="0 0 960 490" role="img" aria-label="左右手定则线稿教学图">
        <defs>
          {(["blue", "red", "green", "purple"] as const).map((tone) => (
            <marker key={tone} id={`rule-arrow-${tone}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className={`rule-arrow-head rule-arrow-head--${tone}`} />
            </marker>
          ))}
        </defs>
        <rect x="24" y="24" width="912" height="442" rx="18" className="figure32-panel" />
        <HandReference mode={mode} activeStep={activeStep} />
        <FieldReference mode={mode} activeStep={activeStep} time={time} />
        <RuleSteps mode={mode} activeStep={activeStep} />
        <text x="480" y="476" textAnchor="middle" className="figure32-note">左手判电动机受力；右手判发电机感应电势</text>
      </svg>
    </DemoFrame>
  );
}
