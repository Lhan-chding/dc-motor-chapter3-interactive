const EPSILON = 1e-9;

function assertNonZero(name: string, value: number): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be finite`);
  }
  if (Math.abs(value) < EPSILON) {
    throw new Error(`${name} must not be zero`);
  }
}

function assertPositive(name: string, value: number): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be finite`);
  }
  if (value <= 0) {
    throw new Error(`${name} must be positive`);
  }
}

export type DcMotorTransientSample = {
  time: number;
  current: number;
  omega: number;
  loadTorque: number;
  electromagneticTorque: number;
};

export type DcMotorTransientParams = {
  voltage: number;
  resistance: number;
  motorConstant: number;
  inductance: number;
  inertia: number;
  initialCurrent: number;
  initialOmega: number;
  duration: number;
  dt?: number;
  sampleInterval?: number;
  loadTorque: (omega: number, time: number) => number;
};

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

export function solveDcMotorTransient(params: DcMotorTransientParams): DcMotorTransientSample[] {
  assertPositive("R", params.resistance);
  assertNonZero("k", params.motorConstant);
  assertPositive("L", params.inductance);
  assertPositive("J", params.inertia);
  if (!Number.isFinite(params.duration) || params.duration < 0) {
    throw new Error("duration must be non-negative");
  }

  const dt = params.dt ?? 0.01;
  const sampleInterval = params.sampleInterval ?? 0.08;
  assertPositive("dt", dt);
  assertPositive("sampleInterval", sampleInterval);

  const derivative = (state: { current: number; omega: number }, time: number) => {
    const loadTorque = params.loadTorque(state.omega, time);
    if (!Number.isFinite(loadTorque)) {
      throw new Error("loadTorque must return a finite value");
    }
    return {
      current: (params.voltage - params.resistance * state.current - params.motorConstant * state.omega) / params.inductance,
      omega: (params.motorConstant * state.current - loadTorque) / params.inertia
    };
  };

  const sample = (time: number, current: number, omega: number): DcMotorTransientSample => {
    const loadTorque = params.loadTorque(omega, time);
    return {
      time,
      current,
      omega,
      loadTorque,
      electromagneticTorque: params.motorConstant * current
    };
  };

  let time = 0;
  let state = {
    current: params.initialCurrent,
    omega: params.initialOmega
  };
  let nextSample = sampleInterval;
  const samples = [sample(time, state.current, state.omega)];
  if (params.duration <= EPSILON) {
    return samples;
  }

  while (time < params.duration - EPSILON) {
    const h = Math.min(dt, params.duration - time);
    const k1 = derivative(state, time);
    const k2State = {
      current: state.current + (h * k1.current) / 2,
      omega: state.omega + (h * k1.omega) / 2
    };
    const k2 = derivative(k2State, time + h / 2);
    const k3State = {
      current: state.current + (h * k2.current) / 2,
      omega: state.omega + (h * k2.omega) / 2
    };
    const k3 = derivative(k3State, time + h / 2);
    const k4State = {
      current: state.current + h * k3.current,
      omega: state.omega + h * k3.omega
    };
    const k4 = derivative(k4State, time + h);

    state = {
      current: state.current + (h / 6) * (k1.current + 2 * k2.current + 2 * k3.current + k4.current),
      omega: state.omega + (h / 6) * (k1.omega + 2 * k2.omega + 2 * k3.omega + k4.omega)
    };
    time += h;

    if (time + EPSILON >= nextSample || time + EPSILON >= params.duration) {
      samples.push(sample(time, state.current, state.omega));
      nextSample += sampleInterval;
    }
  }

  return samples;
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
