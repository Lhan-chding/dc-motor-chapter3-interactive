import { useState } from "react";
import { steadyCurrent } from "../utils/motorMath";
import { DemoFrame, Readout, useDemoClock } from "./shared";

export default function RegenerativeBrakingDemo() {
  const [playing, setPlaying] = useState(true);
  const [V, setV] = useState(280);
  const [E, setE] = useState(260);
  const [R, setR] = useState(2);
  const [sourceAcceptsEnergy, setSourceAcceptsEnergy] = useState(true);
  const { time, reset } = useDemoClock(playing, 1);
  const regenRequested = E > V + 1e-6;
  const protectionOpen = regenRequested && !sourceAcceptsEnergy;
  const current = protectionOpen ? 0 : steadyCurrent(V, E, R);
  const torque = current;
  const terminalPower = V * current;
  const copperLoss = current * current * R;
  const regen = current < -1e-6;
  const neutral = Math.abs(current) <= 1e-6;
  const energyProgress = (time * 0.35) % 1;

  const status = protectionOpen
    ? "电源不能吸收：保护断开回路，I=0；实际系统需升压保护或耗能支路"
    : neutral
    ? "V=E：I=0、T=0，处在电动与再生的边界"
    : regen && sourceAcceptsEnergy
      ? "E>V：I 与 T 反向，机械能经电机回到可吸收电源"
      : "V>E：I 与 T 为正，电源向电机输入能量";

  const handleReset = () => {
    reset();
    setV(280);
    setE(260);
    setR(2);
    setSourceAcceptsEnergy(true);
  };

  return (
    <DemoFrame
      status={status}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={handleReset}
      actions={
        <>
          <button type="button" className="pill-button" onClick={() => setV(Math.max(0, E - 60))}>降低端电压</button>
          <button type="button" className={sourceAcceptsEnergy ? "pill-button is-active" : "pill-button"} onClick={() => setSourceAcceptsEnergy((value) => !value)}>电源可吸收</button>
        </>
      }
      sliders={[
        { label: "端电压", symbol: "V", value: V, min: 0, max: 320, step: 10, unit: "V", onChange: setV },
        { label: "反电动势", symbol: "E", value: E, min: 0, max: 360, step: 10, unit: "V", onChange: setE },
        { label: "回路电阻", symbol: "R", value: R, min: 0.5, max: 8, step: 0.1, unit: "Ω", onChange: setR }
      ]}
      readouts={
        <>
          <Readout label="I=(V−E)/R" value={current} unit="A" tone={regen ? "purple" : neutral ? "neutral" : "red"} />
          <Readout label="T=kI" value={torque} unit="pu" tone={regen ? "purple" : "green"} />
          <Readout label={protectionOpen ? "保护状态" : "端口功率 VI"} value={protectionOpen ? "开路" : terminalPower} unit={protectionOpen ? undefined : "W"} tone={protectionOpen ? "amber" : terminalPower < 0 ? "purple" : "blue"} />
        </>
      }
    >
      <svg className="advanced-book-svg" viewBox="0 0 1040 520" role="img" aria-label="全速再生制动电路与能量流动画">
        <defs>
          <marker id="regen-black-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" className="advanced-book-arrow-head" />
          </marker>
          <marker id="regen-red-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" className="advanced-book-arrow-head advanced-book-arrow-head--red" />
          </marker>
        </defs>

        <text x="520" y="30" textAnchor="middle" className="advanced-book-title">全速再生：先改变 V−E，再改变电流与转矩</text>

        <g transform="translate(46 58)" aria-label="再生制动等效电路">
          <text x="210" y="20" textAnchor="middle" className="advanced-book-heading">等效电路</text>
          <circle cx="44" cy="92" r="4" className="advanced-book-terminal" />
          <circle cx="44" cy="270" r="4" className="advanced-book-terminal" />
          <line x1="44" y1="92" x2="112" y2="92" className="advanced-book-wire" />
          <path d="M112 92 l14 -18 l22 36 l22 -36 l22 36 l14 -18" className="advanced-book-wire" />
          <line x1="226" y1="92" x2="310" y2="92" className="advanced-book-wire" />
          <circle cx="310" cy="181" r="52" className="advanced-book-machine" />
          <line x1="310" y1="92" x2="310" y2="129" className="advanced-book-wire" />
          <line x1="310" y1="233" x2="310" y2="270" className="advanced-book-wire" />
          <line x1="310" y1="270" x2="44" y2="270" className="advanced-book-wire" />
          <line x1="27" y1="158" x2="61" y2="158" className="advanced-book-wire" />
          <line x1="34" y1="178" x2="54" y2="178" className="advanced-book-wire" />
          {!protectionOpen ? <path d={current < 0 ? "M 250 60 H 102" : "M 102 60 H 250"} className="advanced-book-current is-active" markerEnd="url(#regen-red-arrow)" /> : null}
          <path d="M 310 214 V 146" className="advanced-book-emf" markerEnd="url(#regen-black-arrow)" />
          <path d="M 12 226 V 112" className="advanced-book-voltage" markerEnd="url(#regen-red-arrow)" />
          <text x="164" y="54" textAnchor="middle" className="advanced-book-label">I</text>
          <text x="164" y="132" textAnchor="middle" className="advanced-book-label">R</text>
          <text x="310" y="188" textAnchor="middle" className="advanced-book-label">E</text>
          <text x="20" y="176" className="advanced-book-label">V</text>
          <text x="210" y="312" textAnchor="middle" className="advanced-book-equation">I=(V−E)/R</text>
        </g>

        <g transform="translate(454 62)" aria-label="电压比较与能量流">
          <text x="270" y="18" textAnchor="middle" className="advanced-book-heading">从电压差到能量方向</text>
          <line x1="52" y1="222" x2="52" y2="70" className="advanced-book-axis" markerEnd="url(#regen-black-arrow)" />
          <line x1="52" y1="222" x2="238" y2="222" className="advanced-book-axis" />
          <rect x="80" y={222 - (V / 360) * 132} width="44" height={(V / 360) * 132} className="advanced-book-bar" />
          <rect x="158" y={222 - (E / 360) * 132} width="44" height={(E / 360) * 132} className="advanced-book-bar advanced-book-bar--emf" />
          <text x="102" y="246" textAnchor="middle" className="advanced-book-label">V</text>
          <text x="180" y="246" textAnchor="middle" className="advanced-book-label">E</text>
          <text x="145" y="270" textAnchor="middle" className="advanced-book-small">{protectionOpen ? "E>V → 保护开路" : regen ? "E>V → I<0" : neutral ? "E=V → I=0" : "V>E → I>0"}</text>

          <g transform="translate(268 76)">
            <circle cx="38" cy="76" r="38" className="advanced-book-inertia" />
            <circle cx="150" cy="76" r="42" className="advanced-book-machine" />
            <line x1="76" y1="76" x2="108" y2="76" className="advanced-book-shaft" />
            <line x1="192" y1="76" x2="246" y2="76" className="advanced-book-wire" />
            <line x1="246" y1="52" x2="246" y2="100" className="advanced-book-wire" />
            <line x1="262" y1="62" x2="262" y2="90" className="advanced-book-wire" />
            <text x="38" y="82" textAnchor="middle" className="advanced-book-label">Jω²/2</text>
            <text x="150" y="82" textAnchor="middle" className="advanced-book-label">M/G</text>
            <text x="254" y="126" textAnchor="middle" className="advanced-book-small">可吸收电源</text>
            <path d={regenRequested ? "M 78 36 H 246" : "M 246 36 H 78"} className={protectionOpen ? "advanced-book-power is-blocked" : "advanced-book-power is-active"} markerEnd="url(#regen-black-arrow)" />
            {!protectionOpen ? <circle cx={regen ? 78 + energyProgress * 168 : 246 - energyProgress * 168} cy="36" r="5" className="advanced-book-energy-dot" /> : null}
            {protectionOpen ? <line x1="224" y1="20" x2="246" y2="48" className="advanced-book-block" /> : null}
          </g>
          <text x="405" y="256" textAnchor="middle" className="advanced-book-small">铜耗 I²R = {copperLoss.toFixed(0)} W</text>
        </g>

        <g transform="translate(98 420)" aria-label="再生制动因果链">
          {[
            "降低 V",
            "V<E",
            "I 反向",
            "T 反向",
            "机械能回馈"
          ].map((label, index) => (
            <g key={label} transform={`translate(${index * 174} 0)`}>
              <rect width="132" height="46" rx="5" className={index <= (regen ? 4 : protectionOpen ? 1 : 0) ? "advanced-book-stage is-active" : "advanced-book-stage"} />
              <text x="66" y="29" textAnchor="middle" className="advanced-book-stage-text">{label}</text>
              {index < 4 ? <line x1="136" y1="23" x2="166" y2="23" className="advanced-book-stage-arrow" markerEnd="url(#regen-black-arrow)" /> : null}
            </g>
          ))}
        </g>
      </svg>
    </DemoFrame>
  );
}
