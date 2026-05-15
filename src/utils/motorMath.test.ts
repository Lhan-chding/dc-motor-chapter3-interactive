import { describe, expect, it } from "vitest";
import {
  armatureTimeConstant,
  backEmf,
  copperLoss,
  electromechanicalTimeConstant,
  limitFlux,
  maxTheoreticalPower,
  rpmToRadPerSec,
  solveDcMotorTransient,
  steadyCurrent,
  steadySpeed,
  torque
} from "./motorMath";

describe("motorMath", () => {
  it("converts rpm to rad/s", () => {
    expect(rpmToRadPerSec(60)).toBeCloseTo(2 * Math.PI);
  });

  it("preserves direction in torque and back EMF", () => {
    expect(torque(2, -3)).toBe(-6);
    expect(backEmf(0.5, -20)).toBe(-10);
  });

  it("computes steady current from voltage difference", () => {
    expect(steadyCurrent(240, 220, 2)).toBe(10);
    expect(steadyCurrent(180, 220, 2)).toBe(-20);
  });

  it("computes speed droop under load", () => {
    expect(steadySpeed(240, 2, 1, 20)).toBeCloseTo(115);
  });

  it("computes losses, maximum power, and time constants", () => {
    expect(copperLoss(10, 2)).toBe(200);
    expect(maxTheoreticalPower(100, 4)).toBe(625);
    expect(electromechanicalTimeConstant(2, 0.5, 1)).toBe(1);
    expect(armatureTimeConstant(0.2, 2)).toBe(0.1);
  });

  it("throws on invalid divisors and limits tiny flux", () => {
    expect(() => steadyCurrent(1, 0, 0)).toThrow(/R/);
    expect(() => torque(0, 1)).toThrow(/k/);
    expect(() =>
      solveDcMotorTransient({
        voltage: 1,
        resistance: 1,
        motorConstant: 1,
        inductance: 1,
        inertia: 1,
        initialCurrent: 0,
        initialOmega: 0,
        duration: -1,
        loadTorque: () => 0
      })
    ).toThrow(/duration/);
    expect(limitFlux(0)).toBe(0.03);
    expect(limitFlux(-0.001)).toBe(-0.03);
  });

  it("solves coupled DC motor transient equations toward equilibrium", () => {
    const samples = solveDcMotorTransient({
      voltage: 2,
      resistance: 1,
      motorConstant: 1,
      inductance: 0.08,
      inertia: 0.25,
      initialCurrent: 0,
      initialOmega: 0,
      duration: 2,
      dt: 0.002,
      sampleInterval: 0.1,
      loadTorque: () => 0.5
    });
    const final = samples[samples.length - 1];

    expect(samples.length).toBeGreaterThan(5);
    expect(final.electromagneticTorque).toBeCloseTo(0.5, 1);
    expect(final.omega).toBeCloseTo(1.5, 1);
  });
});
