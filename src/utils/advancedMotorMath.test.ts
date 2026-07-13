import { describe, expect, it } from "vitest";
import {
  dynamicBrakingResponse,
  findSelfExcitationOperatingPoint,
  fourQuadrantOperatingPoint,
  magnetizationVoltage,
  seriesMotorOperatingPoint
} from "./advancedMotorMath";

describe("advanced DC motor models", () => {
  it.each([
    [80, 30, 1, "正转电动"],
    [80, -30, 2, "正转发电"],
    [-80, -30, 3, "反转电动"],
    [-80, 30, 4, "反转发电"]
  ])("classifies omega=%s and torque=%s as quadrant %s", (omega, torque, quadrant, label) => {
    const state = fourQuadrantOperatingPoint({ omega, torque, motorConstant: 2, resistance: 0.5 });

    expect(state.quadrant).toBe(quadrant);
    expect(state.label).toBe(label);
    expect(state.motoring).toBe(omega * torque >= 0);
  });

  it("derives a regenerative point from one consistent set of equations", () => {
    const state = fourQuadrantOperatingPoint({ omega: 100, torque: -20, motorConstant: 2, resistance: 0.5 });

    expect(state.emf).toBe(200);
    expect(state.current).toBe(-10);
    expect(state.voltage).toBe(195);
    expect(state.convertedPower).toBe(-2000);
    expect(state.copperLoss).toBe(50);
  });

  it("solves dynamic braking as an exponential electromechanical decay", () => {
    const start = dynamicBrakingResponse({
      initialOmega: 120,
      time: 0,
      motorConstant: 1.5,
      armatureResistance: 1,
      brakingResistance: 5,
      inertia: 0.3
    });
    const oneTau = dynamicBrakingResponse({
      initialOmega: 120,
      time: start.timeConstant,
      motorConstant: 1.5,
      armatureResistance: 1,
      brakingResistance: 5,
      inertia: 0.3
    });

    expect(oneTau.omega).toBeCloseTo(120 / Math.E, 5);
    expect(start.current).toBeLessThan(0);
    expect(start.torque).toBeLessThan(0);
    expect(start.brakingResistorPower).toBeGreaterThan(0);
  });

  it("derives series-motor speed from load torque, current, flux, and back EMF", () => {
    const light = seriesMotorOperatingPoint({
      voltage: 220,
      totalResistance: 1.2,
      machineConstant: 1.4,
      fieldConstant: 0.09,
      saturationFlux: 0.8,
      loadTorque: 6
    });
    const heavy = seriesMotorOperatingPoint({
      voltage: 220,
      totalResistance: 1.2,
      machineConstant: 1.4,
      fieldConstant: 0.09,
      saturationFlux: 0.8,
      loadTorque: 30
    });

    expect(light.current).toBeLessThan(heavy.current);
    expect(light.flux).toBeLessThan(heavy.flux);
    expect(light.omega).toBeGreaterThan(heavy.omega);
    expect(heavy.electromagneticTorque).toBeCloseTo(30, 5);
  });

  it("finds the self-excitation intersection only below critical field resistance", () => {
    const success = findSelfExcitationOperatingPoint({
      fieldResistance: 80,
      residualVoltage: 8,
      saturationVoltage: 240,
      kneeCurrent: 1.2
    });
    const highResistance = findSelfExcitationOperatingPoint({
      fieldResistance: 240,
      residualVoltage: 8,
      saturationVoltage: 240,
      kneeCurrent: 1.2
    });
    const noResidual = findSelfExcitationOperatingPoint({
      fieldResistance: 80,
      residualVoltage: 0,
      saturationVoltage: 240,
      kneeCurrent: 1.2
    });

    expect(success.success).toBe(true);
    expect(success.generatedVoltage).toBeCloseTo(success.fieldResistance * success.fieldCurrent, 3);
    expect(highResistance.success).toBe(false);
    expect(highResistance.generatedVoltage).toBeCloseTo(
      magnetizationVoltage({
        fieldCurrent: highResistance.fieldCurrent,
        residualVoltage: 8,
        saturationVoltage: 240,
        kneeCurrent: 1.2
      }),
      3
    );
    expect(highResistance.generatedVoltage).toBeLessThan(success.generatedVoltage);
    expect(noResidual.success).toBe(false);
  });

  it("flags series-motor runaway risk from speed relative to saturated-flux base speed", () => {
    const nearNoLoad = seriesMotorOperatingPoint({
      voltage: 220,
      totalResistance: 1.2,
      machineConstant: 1.4,
      fieldConstant: 0.09,
      saturationFlux: 0.8,
      loadTorque: 0.1
    });
    const loaded = seriesMotorOperatingPoint({
      voltage: 220,
      totalResistance: 1.2,
      machineConstant: 1.4,
      fieldConstant: 0.09,
      saturationFlux: 0.8,
      loadTorque: 30
    });

    expect(nearNoLoad.noLoadRisk).toBe(true);
    expect(loaded.noLoadRisk).toBe(false);
  });
});
