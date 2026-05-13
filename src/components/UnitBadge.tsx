type UnitBadgeProps = {
  value: string | number;
  unit?: string;
  label?: string;
  tone?: "blue" | "red" | "green" | "amber" | "purple" | "neutral";
};

export function UnitBadge({ value, unit, label, tone = "neutral" }: UnitBadgeProps) {
  return (
    <span className={`unit-badge unit-badge--${tone}`}>
      {label ? <span className="unit-badge__label">{label}</span> : null}
      <span className="unit-badge__value">{value}</span>
      {unit ? <span className="unit-badge__unit">{unit}</span> : null}
    </span>
  );
}
