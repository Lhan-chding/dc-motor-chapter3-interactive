import { useState } from "react";
import { DemoFrame, Readout, useDemoClock } from "./shared";

type RuleMode = "left" | "right";

const RULE_IMAGE = {
  left: "/images/fleming-left-hand-rule.png",
  right: "/images/fleming-right-hand-rule.png"
} as const;

function ruleCopy(mode: RuleMode) {
  return mode === "left"
    ? {
        title: "左手定则",
        subtitle: "电动机判受力方向",
        use: "电动机",
        known: "B + I",
        result: "F",
        status: "左手：已知磁场 B 和电流 I，判断受力 F",
        labels: ["食指：磁场 B", "中指：电流 I", "拇指：受力 F"],
        caption: "左手用于电动机受力判向"
      }
    : {
        title: "右手定则",
        subtitle: "发电机判感应电势",
        use: "发电机",
        known: "v + B",
        result: "E",
        status: "右手：已知运动 v 和磁场 B，判断感应电势 E",
        labels: ["食指：磁场 B", "拇指：运动 v", "中指：电势 E"],
        caption: "右手用于发电机感应判向"
      };
}

function RulePhoto({ mode, activeStep }: { mode: RuleMode; activeStep: number }) {
  const copy = ruleCopy(mode);

  return (
    <figure className="rule-photo" aria-label={`${copy.title}资料图片`}>
      <div className="rule-photo__imageBox">
        <img src={RULE_IMAGE[mode]} alt={`${copy.title}资料图`} />
      </div>
      <figcaption>
        <strong>{copy.title}</strong>
        <span>{copy.subtitle}</span>
      </figcaption>
      <div className="rule-photo__steps" aria-label="三指对应关系">
        {copy.labels.map((label, index) => (
          <span key={label} className={index === activeStep ? "is-active" : ""}>
            {label}
          </span>
        ))}
      </div>
      <p className="rule-photo__source">
        图片来源：Wikimedia Commons，CC BY-SA 3.0
      </p>
    </figure>
  );
}

function DotCross({ out }: { out: boolean }) {
  return (
    <g className="rule-dot-cross" aria-label={out ? "电流出纸面" : "电流入纸面"}>
      <circle r="18" />
      {out ? (
        <circle r="5" />
      ) : (
        <g>
          <line x1="-8" y1="-8" x2="8" y2="8" />
          <line x1="8" y1="-8" x2="-8" y2="8" />
        </g>
      )}
    </g>
  );
}

function ApplicationSketch({ mode, activeStep, time }: { mode: RuleMode; activeStep: number; time: number }) {
  const isLeft = mode === "left";
  const conductorY = 190 + Math.sin(time * Math.PI * 2) * 8;

  return (
    <svg className="rule-application" viewBox="0 0 520 360" role="img" aria-label="定则在电机导体中的应用">
      <defs>
        <marker id="rule-app-arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--blue)" />
        </marker>
        <marker id="rule-app-arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--red)" />
        </marker>
        <marker id="rule-app-arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--green)" />
        </marker>
        <marker id="rule-app-arrow-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--purple)" />
        </marker>
      </defs>

      <rect x="24" y="24" width="472" height="312" rx="8" className="rule-panel" />
      <text x="260" y="62" textAnchor="middle" className="rule-heading">
        {isLeft ? "应用图：电动机中判受力" : "应用图：发电机中判电势"}
      </text>
      <text x="260" y="88" textAnchor="middle" className="rule-subheading">
        {isLeft ? "把左手定则放到导体受力问题中" : "把右手定则放到导体切割磁场问题中"}
      </text>

      <rect x="58" y="126" width="108" height="150" className="rule-pole" />
      <rect x="354" y="126" width="108" height="150" className="rule-pole" />
      <text x="112" y="196" textAnchor="middle" className="rule-pole-text">N</text>
      <text x="408" y="196" textAnchor="middle" className="rule-pole-text">S</text>

      {[150, 180, 210, 240].map((y) => (
        <path
          key={y}
          d={`M 178 ${y} H 342`}
          className={activeStep === 0 ? "rule-field is-active" : "rule-field"}
          markerEnd="url(#rule-app-arrow-blue)"
        />
      ))}
      <text x="260" y="120" textAnchor="middle" className="rule-label rule-label--blue">B</text>

      <g transform={`translate(260 ${conductorY})`}>
        <rect x="-14" y="-78" width="28" height="156" rx="14" className="rule-conductor" />
        {isLeft ? <DotCross out /> : null}
      </g>

      {isLeft ? (
        <>
          <text x="294" y={conductorY + 7} className="rule-label rule-label--red">I</text>
          <path
            d={`M 260 ${conductorY - 94} V ${conductorY - 144}`}
            className={activeStep === 2 ? "rule-line rule-line--green is-active" : "rule-line rule-line--green"}
            markerEnd="url(#rule-app-arrow-green)"
          />
          <text x="278" y={conductorY - 132} className="rule-label rule-label--green">F</text>
        </>
      ) : (
        <>
          <path
            d={`M 260 ${conductorY + 94} V ${conductorY + 144}`}
            className={activeStep === 2 ? "rule-line rule-line--green is-active" : "rule-line rule-line--green"}
            markerEnd="url(#rule-app-arrow-green)"
          />
          <text x="278" y={conductorY + 138} className="rule-label rule-label--green">v</text>
          <path
            d="M 214 92 H 306"
            className={activeStep === 1 ? "rule-line rule-line--purple is-active" : "rule-line rule-line--purple"}
            markerEnd="url(#rule-app-arrow-purple)"
          />
          <text x="313" y="98" className="rule-label rule-label--purple">E</text>
        </>
      )}

      <g className="rule-caption">
        <rect x="118" y="292" width="284" height="30" rx="4" />
        <text x="260" y="312" textAnchor="middle">
          {isLeft ? "磁场 + 电流 -> 受力" : "运动 + 磁场 -> 感应电势"}
        </text>
      </g>
    </svg>
  );
}

export default function HandRuleDemo() {
  const [playing, setPlaying] = useState(true);
  const [mode, setMode] = useState<RuleMode>("left");
  const [speed, setSpeed] = useState(45);
  const { time, reset } = useDemoClock(playing, speed / 45);
  const activeStep = Math.floor((time * 1.1) % 3);
  const copy = ruleCopy(mode);

  return (
    <DemoFrame
      status={copy.status}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      actions={
        <div className="segmented">
          <button type="button" className={mode === "left" ? "is-active" : ""} onClick={() => setMode("left")}>
            左手定则
          </button>
          <button type="button" className={mode === "right" ? "is-active" : ""} onClick={() => setMode("right")}>
            右手定则
          </button>
        </div>
      }
      sliders={[{ label: "演示速度", symbol: "n", value: speed, min: 20, max: 100, step: 5, unit: "rpm", onChange: setSpeed }]}
      readouts={
        <>
          <Readout label="用途" value={copy.use} tone={mode === "left" ? "green" : "purple"} />
          <Readout label="输入" value={copy.known} tone="blue" />
          <Readout label="输出" value={copy.result} tone={mode === "left" ? "green" : "purple"} />
        </>
      }
    >
      <div className="hand-rule-reference">
        <RulePhoto mode={mode} activeStep={activeStep} />
        <ApplicationSketch mode={mode} activeStep={activeStep} time={time} />
      </div>
    </DemoFrame>
  );
}
