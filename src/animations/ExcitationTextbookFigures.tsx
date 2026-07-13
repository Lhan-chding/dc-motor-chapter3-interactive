type OperatingPoint = {
  speedRatio: number;
  torqueRatio: number;
  pulse?: number;
};

type FigureProps = {
  x?: number;
  y?: number;
  scale?: number;
  point?: OperatingPoint;
  showCaption?: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function PointMarker({ x, y, pulse = 0, label = "运行点" }: { x: number; y: number; pulse?: number; label?: string }) {
  return (
    <g aria-label={`${label}，横坐标转速，纵坐标转矩`}>
      <line x1={x} y1={y} x2={x} y2="270" className="excitation-live-guide" />
      <line x1="310" y1={y} x2={x} y2={y} className="excitation-live-guide" />
      <circle cx={x} cy={y} r={5.5 + pulse} className="excitation-live-point" />
      <text x={x + 8} y={y - 8} className="excitation-small">{label}</text>
    </g>
  );
}

export function ShuntFigure314({ x = 0, y = 0, scale = 1, point, showCaption = true }: FigureProps) {
  const loadFraction = point ? clamp(point.torqueRatio, 0, 1) : 0;
  const pointY = 270 - loadFraction * 178;
  const fullFluxX = 352 - loadFraction * 9;
  const weakFluxX = 405 - loadFraction * 22;
  const weakeningFraction = point ? clamp((point.speedRatio - 1) / 1.2, 0, 1) : 0;
  const pointX = fullFluxX + (weakFluxX - fullFluxX) * weakeningFraction;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} aria-label="教材图3.14并励直流电机等效电路和转矩转速曲线">
      <g aria-label="并励直流电机等效电路">
        <circle cx="24" cy="72" r="4" className="excitation-terminal" />
        <circle cx="24" cy="270" r="4" className="excitation-terminal" />
        <line x1="28" y1="72" x2="244" y2="72" className="excitation-line" />
        <line x1="28" y1="270" x2="244" y2="270" className="excitation-line" />

        <line x1="82" y1="72" x2="82" y2="100" className="excitation-line" />
        <rect x="72" y="100" width="20" height="46" className="excitation-resistor" />
        <path d="M82 146 v12 c-20 8 -20 24 0 32 c20 8 20 24 0 32 c-20 8 -20 24 0 32 v16" className="excitation-line" />
        <text x="61" y="126" textAnchor="end" className="excitation-symbol">R<tspan baselineShift="sub" fontSize="10">f</tspan></text>
        <text x="53" y="206" className="excitation-small">励磁</text>
        <text x="53" y="222" className="excitation-small">回路</text>

        <line x1="118" y1="72" x2="118" y2="58" className="excitation-line" />
        <line x1="118" y1="58" x2="148" y2="58" className="excitation-line" />
        <line x1="154" y1="55" x2="190" y2="37" className="excitation-line" />
        <circle cx="151" cy="56" r="2.5" className="excitation-terminal" />
        <circle cx="194" cy="34" r="2.5" className="excitation-terminal" />
        <line x1="194" y1="34" x2="224" y2="34" className="excitation-line" />
        <line x1="224" y1="34" x2="224" y2="72" className="excitation-line" />
        <text x="162" y="47" className="excitation-symbol">S</text>

        <rect x="118" y="62" width="76" height="20" className="excitation-resistor" />
        <text x="156" y="98" textAnchor="middle" className="excitation-symbol">R<tspan baselineShift="sub" fontSize="10">s</tspan></text>

        <line x1="224" y1="72" x2="224" y2="94" className="excitation-line" />
        <rect x="214" y="94" width="20" height="42" className="excitation-resistor" />
        <line x1="224" y1="136" x2="224" y2="151" className="excitation-line" />
        <circle cx="224" cy="188" r="37" className="excitation-machine" />
        <line x1="224" y1="225" x2="224" y2="270" className="excitation-line" />
        <rect x="219" y="143" width="10" height="8" className="excitation-brush" />
        <rect x="219" y="225" width="10" height="8" className="excitation-brush" />
        <text x="242" y="116" className="excitation-symbol">R<tspan baselineShift="sub" fontSize="10">a</tspan></text>
        <text x="134" y="300" textAnchor="middle" className="excitation-subfigure">a)</text>
      </g>

      <g aria-label="并励电机转矩转速连续运行区域">
        <line x1="310" y1="270" x2="500" y2="270" className="excitation-axis" />
        <line x1="310" y1="270" x2="310" y2="62" className="excitation-axis" />
        <text x="300" y="58" className="excitation-axis-label">转矩</text>
        <text x="474" y="292" className="excitation-axis-label">转速</text>
        <text x="302" y="288" className="excitation-small">0</text>
        <path d="M352 270 L405 270 L383 136 L343 92 Z" className="excitation-region" />
        <path d="M352 270 L343 92 L337 60" className="excitation-curve" />
        <line x1="343" y1="92" x2="310" y2="92" className="excitation-guide" />
        <text x="317" y="84" className="excitation-small">额定转矩</text>
        <text x="352" y="78" className="excitation-point-letter">b</text>
        <text x="345" y="286" className="excitation-point-letter">a</text>
        <path d="M343 92 C365 105 395 124 438 144 C456 153 473 159 486 163" className="excitation-limit-curve" />
        <line x1="383" y1="136" x2="405" y2="270" className="excitation-curve" />
        <text x="389" y="132" className="excitation-point-letter">d</text>
        <text x="400" y="286" className="excitation-point-letter">c</text>
        <path d="M356 73 L344 91" className="excitation-callout" markerEnd="url(#excitation-arrow)" />
        <text x="360" y="70" className="excitation-small">基速</text>
        <path d="M460 121 L439 145" className="excitation-callout" markerEnd="url(#excitation-arrow)" />
        <text x="442" y="113" className="excitation-small">最大转速</text>
        {point ? <PointMarker x={pointX} y={pointY} pulse={point.pulse} /> : null}
        <text x="404" y="300" textAnchor="middle" className="excitation-subfigure">b)</text>
      </g>
      {showCaption ? <text x="260" y="330" textAnchor="middle" className="excitation-caption">图 3.14　并励直流电机及其稳态转矩-转速曲线</text> : null}
    </g>
  );
}

export function SeriesFigure315({ x = 0, y = 0, scale = 1, point, showCaption = true }: FigureProps) {
  const loadFraction = point ? clamp(point.torqueRatio, 0.03, 1) : 1;
  const curveProgress = (1 - Math.sqrt(loadFraction)) / (1 - Math.sqrt(0.03));
  const pointX = 354 + curveProgress * 142;
  const pointY = 102 + ((1 - loadFraction) / 0.97) * 105;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} aria-label="教材图3.15串励直流电机等效电路和转矩转速曲线">
      <g aria-label="串励直流电机等效电路">
        <circle cx="24" cy="72" r="4" className="excitation-terminal" />
        <circle cx="24" cy="270" r="4" className="excitation-terminal" />
        <line x1="28" y1="72" x2="62" y2="72" className="excitation-line" />
        <rect x="62" y="62" width="64" height="20" className="excitation-resistor" />
        <path d="M126 72 h12 c8 -20 24 -20 32 0 c8 20 24 20 32 0 c8 -20 24 -20 32 0 h10" className="excitation-line" />
        <line x1="244" y1="72" x2="244" y2="96" className="excitation-line" />
        <rect x="234" y="96" width="20" height="42" className="excitation-resistor" />
        <line x1="244" y1="138" x2="244" y2="153" className="excitation-line" />
        <circle cx="244" cy="190" r="37" className="excitation-machine" />
        <line x1="244" y1="227" x2="244" y2="270" className="excitation-line" />
        <line x1="244" y1="270" x2="28" y2="270" className="excitation-line" />
        <rect x="239" y="145" width="10" height="8" className="excitation-brush" />
        <rect x="239" y="227" width="10" height="8" className="excitation-brush" />
        <text x="150" y="44" textAnchor="middle" className="excitation-small">励磁回路</text>
        <text x="94" y="101" textAnchor="middle" className="excitation-symbol">R<tspan baselineShift="sub" fontSize="10">f</tspan></text>
        <text x="188" y="101" textAnchor="middle" className="excitation-symbol">L<tspan baselineShift="sub" fontSize="10">f</tspan></text>
        <text x="262" y="118" className="excitation-symbol">R<tspan baselineShift="sub" fontSize="10">a</tspan></text>
        <text x="134" y="300" textAnchor="middle" className="excitation-subfigure">a)</text>
      </g>

      <g aria-label="串励电机转矩转速曲线">
        <line x1="310" y1="270" x2="500" y2="270" className="excitation-axis" />
        <line x1="310" y1="270" x2="310" y2="62" className="excitation-axis" />
        <text x="300" y="58" className="excitation-axis-label">转矩</text>
        <text x="474" y="292" className="excitation-axis-label">转速</text>
        <text x="302" y="288" className="excitation-small">0</text>
        <path d="M354 45 C355 68 360 88 369 105 C387 139 414 169 450 190 C468 200 484 205 496 207" className="excitation-curve" />
        <path d="M354 45 V78" className="excitation-curve excitation-curve--dashed" />
        <line x1="310" y1="102" x2="367" y2="102" className="excitation-guide" />
        <path d="M337 126 L337 105" className="excitation-callout" markerEnd="url(#excitation-arrow)" />
        <text x="321" y="143" className="excitation-small">最大电流</text>
        {point ? <PointMarker x={pointX} y={pointY} pulse={point.pulse} /> : null}
        <text x="404" y="300" textAnchor="middle" className="excitation-subfigure">b)</text>
      </g>
      {showCaption ? <text x="260" y="330" textAnchor="middle" className="excitation-caption">图 3.15　串励直流电机等效电路及其稳态转矩-转速曲线</text> : null}
    </g>
  );
}
