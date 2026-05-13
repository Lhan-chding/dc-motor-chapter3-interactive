export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) {
    return "--";
  }

  const abs = Math.abs(value);
  if (abs >= 1000) {
    return value.toFixed(0);
  }
  if (abs >= 100) {
    return value.toFixed(1);
  }
  return value.toFixed(digits);
}

export function signed(value: number, digits = 2): string {
  const text = formatNumber(value, digits);
  if (!Number.isFinite(value) || value === 0) {
    return text;
  }
  return value > 0 ? `+${text}` : text;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function percent(value: number): string {
  if (!Number.isFinite(value)) {
    return "--";
  }
  return `${formatNumber(value * 100, 1)}%`;
}
