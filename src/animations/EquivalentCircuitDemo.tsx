import { useState } from "react";
import { steadyCurrent } from "../utils/motorMath";
import { DemoFrame, Readout, useDemoClock } from "./shared";

function BookEquivalentCircuit({ current, emf }: { current: number; emf: number }) {
  const reverseCurrent = current < 0;
  const reverseEmf = emf < 0;

  return (
    <svg className="equivalent-book-svg" viewBox="0 0 720 360" role="img" aria-label="直流电机等效电路图 3.6">
      <defs>
        <marker id="book-circuit-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="book-circuit-arrow-head" />
        </marker>
      </defs>

      <g className="book-circuit" aria-label="电枢回路">
        <circle cx="58" cy="86" r="6" className="book-circuit-terminal" />
        <circle cx="58" cy="254" r="6" className="book-circuit-terminal" />
        <text x="28" y="90" className="book-circuit-label">A1</text>
        <text x="28" y="258" className="book-circuit-label">A2</text>

        <path d="M 58 86 H 116" className="book-circuit-wire" />
        <rect x="116" y="72" width="58" height="28" className="book-circuit-resistor" />
        <path d="M 174 86 H 206" className="book-circuit-wire" />
        <path d="M 206 86 c 0 -18 24 -18 24 0 c 0 -18 24 -18 24 0 c 0 -18 24 -18 24 0" className="book-circuit-wire" />
        <path d="M 278 86 H 330 V 254 H 58" className="book-circuit-wire" />

        <circle cx="330" cy="170" r="50" className="book-circuit-source" />
        <path d={reverseEmf ? "M 330 142 V 198" : "M 330 198 V 142"} className="book-circuit-source-arrow" markerEnd="url(#book-circuit-arrow)" />

        <path d={reverseCurrent ? "M 288 42 H 170" : "M 170 42 H 288"} className="book-circuit-current-arrow" markerEnd="url(#book-circuit-arrow)" />
        <path d="M 58 240 V 112" className="book-circuit-voltage-arrow" markerEnd="url(#book-circuit-arrow)" />

        <text x="145" y="122" textAnchor="middle" className="book-circuit-symbol">R</text>
        <text x="242" y="122" textAnchor="middle" className="book-circuit-symbol">L</text>
        <text x="350" y="176" className="book-circuit-symbol">E</text>
        <text x="46" y="176" textAnchor="middle" className="book-circuit-symbol">V</text>
        <text x="230" y="32" textAnchor="middle" className="book-circuit-symbol">I</text>
      </g>

      <g className="book-circuit" aria-label="励磁回路">
        <circle cx="628" cy="86" r="6" className="book-circuit-terminal" />
        <circle cx="628" cy="254" r="6" className="book-circuit-terminal" />
        <text x="640" y="90" className="book-circuit-label">E1</text>
        <text x="640" y="258" className="book-circuit-label">E2</text>

        <path d="M 628 86 H 548 V 110" className="book-circuit-wire" />
        <rect x="534" y="110" width="28" height="58" className="book-circuit-resistor" />
        <path d="M 548 168 V 190" className="book-circuit-wire" />
        <path d="M 548 190 c -18 0 -18 20 0 20 c -18 0 -18 20 0 20 c -18 0 -18 20 0 20" className="book-circuit-wire" />
        <path d="M 548 250 V 254 H 628" className="book-circuit-wire" />

        <path d="M 610 42 H 502" className="book-circuit-current-arrow" markerEnd="url(#book-circuit-arrow)" />
        <path d="M 628 240 V 112" className="book-circuit-voltage-arrow" markerEnd="url(#book-circuit-arrow)" />

        <text x="514" y="146" textAnchor="middle" className="book-circuit-symbol">R<tspan baselineShift="sub" fontSize="14">f</tspan></text>
        <text x="514" y="230" textAnchor="middle" className="book-circuit-symbol">L<tspan baselineShift="sub" fontSize="14">f</tspan></text>
        <text x="632" y="178" className="book-circuit-symbol">V<tspan baselineShift="sub" fontSize="14">f</tspan></text>
        <text x="556" y="32" textAnchor="middle" className="book-circuit-symbol">I<tspan baselineShift="sub" fontSize="14">f</tspan></text>
      </g>

      <text x="360" y="326" textAnchor="middle" className="book-circuit-caption">图 3.6  直流电机的等效电路</text>
    </svg>
  );
}

export default function EquivalentCircuitDemo() {
  const [playing, setPlaying] = useState(true);
  const [V, setV] = useState(240);
  const [E, setE] = useState(180);
  const [R, setR] = useState(4);
  const [L, setL] = useState(0.2);
  const { reset } = useDemoClock(playing, 1);
  const I = steadyCurrent(V, E, R);
  const state = Math.abs(V - E) < 1 ? "理想空载" : V > E ? "电动运行" : "发电/再生";

  return (
    <DemoFrame
      status={`${state}：电流由 V-E 的符号决定`}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={reset}
      sliders={[
        { label: "电枢电压", symbol: "V", value: V, min: -500, max: 500, step: 10, unit: "V", onChange: setV },
        { label: "反电动势", symbol: "E", value: E, min: -500, max: 500, step: 10, unit: "V", onChange: setE },
        { label: "电枢电阻", symbol: "R", value: R, min: 0.1, max: 20, step: 0.1, unit: "Ω", onChange: setR },
        { label: "电枢电感", symbol: "L", value: L, min: 0, max: 1, step: 0.05, unit: "H", onChange: setL }
      ]}
      readouts={
        <>
          <Readout label="I" value={I} unit="A" tone={I >= 0 ? "red" : "purple"} />
          <Readout label="状态" value={state} tone={state === "发电/再生" ? "purple" : "green"} />
          <Readout label="功率流" value={I >= 0 ? "电源→电机" : "电机→电源"} tone={I >= 0 ? "green" : "purple"} />
        </>
      }
    >
      <BookEquivalentCircuit current={I} emf={E} />
    </DemoFrame>
  );
}
