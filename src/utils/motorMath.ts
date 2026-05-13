const EPSILON = 1e-9;

function assertNonZero(name: string, value: number): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be finite`);
  }
  if (Math.abs(value) < EPSILON) {
    throw new Error(`${name} must not be zero`);
  }
}

export function rpmToRadPerSec(nRpm: number): number {
  return (nRpm * 2 * Math.PI) / 60;
}

export function radPerSecToRpm(omega: number): number {
  return (omega * 60) / (2 * Math.PI);
}

export function torque(k: number, current: number): number {
  assertNonZero("k", k);
  return k * current;
}

export function backEmf(k: number, omega: number): number {
  assertNonZero("k", k);
  return k * omega;
}

export function steadyCurrent(V: number, E: number, R: number): number {
  assertNonZero("R", R);
  return (V - E) / R;
}

export function steadySpeed(V: number, k: number, R: number, loadTorque: number): number {
  assertNonZero("k", k);
  assertNonZero("R", R);
  return V / k - (R * loadTorque) / (k * k);
}

export function copperLoss(I: number, R: number): number {
  assertNonZero("R", R);
  return I * I * R;
}

export function convertedPower(E: number, I: number): number {
  return E * I;
}

export function mechanicalPower(T: number, omega: number): number {
  return T * omega;
}

export function maxTheoreticalPower(V: number, R: number): number {
  assertNonZero("R", R);
  return (V * V) / (4 * R);
}

export function electromechanicalTimeConstant(R: number, J: number, k: number): number {
  assertNonZero("R", R);
  assertNonZero("k", k);
  return (R * J) / (k * k);
}

export function armatureTimeConstant(L: number, R: number): number {
  assertNonZero("R", R);
  return L / R;
}

export function limitFlux(phi: number, minAbs = 0.03): number {
  if (!Number.isFinite(phi)) {
    throw new Error("Phi must be finite");
  }
  if (Math.abs(phi) < minAbs) {
    return phi < 0 ? -minAbs : minAbs;
  }
  return phi;
}
