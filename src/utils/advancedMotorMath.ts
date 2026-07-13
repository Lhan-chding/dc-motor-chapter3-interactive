const EPSILON = 1e-9;

function requirePositive(name: string, value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be positive`);
  }
}

export type FourQuadrantState = {
  quadrant: 1 | 2 | 3 | 4;
  label: "正转电动" | "正转发电" | "反转电动" | "反转发电";
  motoring: boolean;
  current: number;
  emf: number;
  voltage: number;
  convertedPower: number;
  terminalPower: number;
  copperLoss: number;
};

export function fourQuadrantOperatingPoint({
  omega,
  torque,
  motorConstant,
  resistance
}: {
  omega: number;
  torque: number;
  motorConstant: number;
  resistance: number;
}): FourQuadrantState {
  requirePositive("motorConstant", motorConstant);
  requirePositive("resistance", resistance);

  const current = torque / motorConstant;
  const emf = motorConstant * omega;
  const voltage = emf + resistance * current;
  const convertedPower = emf * current;
  const copperLoss = current * current * resistance;
  const terminalPower = voltage * current;
  const motoring = omega * torque >= 0;

  if (omega >= 0 && torque >= 0) {
    return { quadrant: 1, label: "正转电动", motoring, current, emf, voltage, convertedPower, terminalPower, copperLoss };
  }
  if (omega >= 0 && torque < 0) {
    return { quadrant: 2, label: "正转发电", motoring, current, emf, voltage, convertedPower, terminalPower, copperLoss };
  }
  if (omega < 0 && torque < 0) {
    return { quadrant: 3, label: "反转电动", motoring, current, emf, voltage, convertedPower, terminalPower, copperLoss };
  }
  return { quadrant: 4, label: "反转发电", motoring, current, emf, voltage, convertedPower, terminalPower, copperLoss };
}

export type DynamicBrakingState = {
  timeConstant: number;
  omega: number;
  emf: number;
  current: number;
  torque: number;
  brakingResistorPower: number;
  armatureCopperLoss: number;
};

export function dynamicBrakingResponse({
  initialOmega,
  time,
  motorConstant,
  armatureResistance,
  brakingResistance,
  inertia
}: {
  initialOmega: number;
  time: number;
  motorConstant: number;
  armatureResistance: number;
  brakingResistance: number;
  inertia: number;
}): DynamicBrakingState {
  requirePositive("motorConstant", motorConstant);
  requirePositive("armatureResistance", armatureResistance);
  requirePositive("brakingResistance", brakingResistance);
  requirePositive("inertia", inertia);
  if (!Number.isFinite(time) || time < 0) {
    throw new Error("time must be non-negative");
  }

  const totalResistance = armatureResistance + brakingResistance;
  const timeConstant = (inertia * totalResistance) / (motorConstant * motorConstant);
  const omega = initialOmega * Math.exp(-time / timeConstant);
  const emf = motorConstant * omega;
  const current = -emf / totalResistance;
  const torque = motorConstant * current;

  return {
    timeConstant,
    omega,
    emf,
    current,
    torque,
    brakingResistorPower: current * current * brakingResistance,
    armatureCopperLoss: current * current * armatureResistance
  };
}

function seriesFlux(current: number, fieldConstant: number, saturationFlux: number) {
  return saturationFlux * Math.tanh((fieldConstant * current) / saturationFlux);
}

export type SeriesMotorState = {
  current: number;
  flux: number;
  electromagneticTorque: number;
  emf: number;
  omega: number;
  saturated: boolean;
  noLoadRisk: boolean;
};

export function seriesMotorOperatingPoint({
  voltage,
  totalResistance,
  machineConstant,
  fieldConstant,
  saturationFlux,
  loadTorque
}: {
  voltage: number;
  totalResistance: number;
  machineConstant: number;
  fieldConstant: number;
  saturationFlux: number;
  loadTorque: number;
}): SeriesMotorState {
  requirePositive("voltage", voltage);
  requirePositive("totalResistance", totalResistance);
  requirePositive("machineConstant", machineConstant);
  requirePositive("fieldConstant", fieldConstant);
  requirePositive("saturationFlux", saturationFlux);
  if (!Number.isFinite(loadTorque) || loadTorque < 0) {
    throw new Error("loadTorque must be non-negative");
  }

  if (loadTorque <= EPSILON) {
    return {
      current: 0,
      flux: 0,
      electromagneticTorque: 0,
      emf: voltage,
      omega: Number.POSITIVE_INFINITY,
      saturated: false,
      noLoadRisk: true
    };
  }

  const torqueAt = (current: number) => machineConstant * seriesFlux(current, fieldConstant, saturationFlux) * current;
  let low = 0;
  let high = Math.max(1, loadTorque / Math.max(machineConstant * saturationFlux, EPSILON));
  while (torqueAt(high) < loadTorque && high < 1e6) {
    high *= 2;
  }
  for (let iteration = 0; iteration < 80; iteration += 1) {
    const middle = (low + high) / 2;
    if (torqueAt(middle) < loadTorque) {
      low = middle;
    } else {
      high = middle;
    }
  }

  const current = (low + high) / 2;
  const flux = seriesFlux(current, fieldConstant, saturationFlux);
  const emf = voltage - current * totalResistance;
  const omega = emf / Math.max(machineConstant * flux, EPSILON);
  const saturatedFluxBaseSpeed = voltage / (machineConstant * saturationFlux);

  return {
    current,
    flux,
    electromagneticTorque: torqueAt(current),
    emf,
    omega,
    saturated: flux >= saturationFlux * 0.9,
    noLoadRisk: omega > 2.5 * saturatedFluxBaseSpeed
  };
}

export function magnetizationVoltage({
  fieldCurrent,
  residualVoltage,
  saturationVoltage,
  kneeCurrent
}: {
  fieldCurrent: number;
  residualVoltage: number;
  saturationVoltage: number;
  kneeCurrent: number;
}) {
  requirePositive("saturationVoltage", saturationVoltage);
  requirePositive("kneeCurrent", kneeCurrent);
  if (!Number.isFinite(fieldCurrent) || fieldCurrent < 0) {
    throw new Error("fieldCurrent must be non-negative");
  }
  if (!Number.isFinite(residualVoltage) || residualVoltage < 0) {
    throw new Error("residualVoltage must be non-negative");
  }
  return residualVoltage + saturationVoltage * (1 - Math.exp(-fieldCurrent / kneeCurrent));
}

export type SelfExcitationState = {
  success: boolean;
  criticalResistance: number;
  fieldResistance: number;
  fieldCurrent: number;
  generatedVoltage: number;
  reason: "built" | "no-residual" | "resistance-too-high";
};

export function findSelfExcitationOperatingPoint({
  fieldResistance,
  residualVoltage,
  saturationVoltage,
  kneeCurrent
}: {
  fieldResistance: number;
  residualVoltage: number;
  saturationVoltage: number;
  kneeCurrent: number;
}): SelfExcitationState {
  requirePositive("fieldResistance", fieldResistance);
  requirePositive("saturationVoltage", saturationVoltage);
  requirePositive("kneeCurrent", kneeCurrent);
  const criticalResistance = saturationVoltage / kneeCurrent;

  if (residualVoltage <= EPSILON) {
    return { success: false, criticalResistance, fieldResistance, fieldCurrent: 0, generatedVoltage: 0, reason: "no-residual" };
  }
  const difference = (current: number) =>
    magnetizationVoltage({ fieldCurrent: current, residualVoltage, saturationVoltage, kneeCurrent }) - fieldResistance * current;
  let low = 0;
  let high = Math.max(2 * kneeCurrent, (residualVoltage + saturationVoltage) / fieldResistance * 1.5);
  while (difference(high) > 0 && high < 1e6) {
    high *= 2;
  }
  for (let iteration = 0; iteration < 100; iteration += 1) {
    const middle = (low + high) / 2;
    if (difference(middle) > 0) {
      low = middle;
    } else {
      high = middle;
    }
  }
  const fieldCurrent = (low + high) / 2;
  const generatedVoltage = fieldResistance * fieldCurrent;
  const success = fieldResistance < criticalResistance;
  return {
    success,
    criticalResistance,
    fieldResistance,
    fieldCurrent,
    generatedVoltage,
    reason: success ? "built" : "resistance-too-high"
  };
}
