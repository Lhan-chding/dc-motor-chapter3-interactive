import { formatNumber } from "../utils/format";

type ParameterSliderProps = {
  label: string;
  symbol: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
};

export function ParameterSlider({
  label,
  symbol,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange
}: ParameterSliderProps) {
  return (
    <label className="parameter-slider">
      <span className="parameter-slider__top">
        <span>
          <strong>{symbol}</strong>
          {label}
        </span>
        <code>
          {formatNumber(value)}
          {unit}
        </code>
      </span>
      <input
        aria-label={`${label} ${symbol}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="parameter-slider__range">
        <small>
          {min}
          {unit}
        </small>
        <small>
          {max}
          {unit}
        </small>
      </span>
    </label>
  );
}
