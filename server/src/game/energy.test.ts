import { describe, expect, it } from "vitest";
import { INVALID_ACTION_POLICY } from "./domain.js";
import {
  InvalidActionError,
  applyActionEnergy,
  confirmActionInput,
  hasEnoughEnergy
} from "./energy.js";

describe("energy policies", () => {
  it("keeps the agreed invalid action policies", () => {
    expect(INVALID_ACTION_POLICY.insufficientEnergy).toBe("fallback_to_ki");
    expect(INVALID_ACTION_POLICY.malformedInput).toBe("reject");
  });
});

describe("confirmActionInput", () => {
  it("falls back to ki when energy is insufficient", () => {
    const fromZero = confirmActionInput("attack", 0);
    expect(fromZero.appliedAction).toBe("ki");
    expect(fromZero.fallbackApplied).toBe(true);
    expect(fromZero.nextEnergy).toBe(1);

    const fromOne = confirmActionInput("kamehameha", 1);
    expect(fromOne.appliedAction).toBe("ki");
    expect(fromOne.fallbackApplied).toBe(true);
    expect(fromOne.nextEnergy).toBe(2);
  });

  it("accepts action when energy is sufficient", () => {
    const attack = confirmActionInput("attack", 1);
    expect(attack.appliedAction).toBe("attack");
    expect(attack.fallbackApplied).toBe(false);
    expect(attack.nextEnergy).toBe(0);

    const kamehameha = confirmActionInput("kamehameha", 2);
    expect(kamehameha.appliedAction).toBe("kamehameha");
    expect(kamehameha.fallbackApplied).toBe(false);
    expect(kamehameha.nextEnergy).toBe(0);
  });

  it("rejects malformed action input", () => {
    expect(() => confirmActionInput("invalid", 2)).toThrowError(InvalidActionError);
    expect(() => confirmActionInput(123, 2)).toThrowError("Malformed action input");
  });
});

describe("applyActionEnergy", () => {
  it("never drops below zero", () => {
    expect(applyActionEnergy(0, "attack")).toBe(0);
    expect(applyActionEnergy(-10, "guard")).toBe(0);
    expect(confirmActionInput("attack", -10).nextEnergy).toBe(1);
  });

  it("applies per-action energy deltas", () => {
    expect(applyActionEnergy(1, "ki")).toBe(2);
    expect(applyActionEnergy(2, "kamehameha")).toBe(0);
    expect(applyActionEnergy(1, "teleport")).toBe(0);
    expect(applyActionEnergy(1, "guard")).toBe(1);
  });

  it("checks energy sufficiency by action cost", () => {
    expect(hasEnoughEnergy(0, "guard")).toBe(true);
    expect(hasEnoughEnergy(0, "attack")).toBe(false);
    expect(hasEnoughEnergy(1, "teleport")).toBe(true);
    expect(hasEnoughEnergy(1, "kamehameha")).toBe(false);
  });
});
