import { describe, expect, it } from "vitest";
import {
  ACTION_ENERGY_COST,
  ACTIONS,
  ENERGY_RULES,
  MATCH_RULES,
  TURN_TIMING_RULES,
  assertAction,
  getClientEnabledActions,
  isAction,
  isBeatName,
  isGamePhase
} from "./domain.js";

describe("domain constants", () => {
  it("matches the MVP timing contract", () => {
    expect(TURN_TIMING_RULES.beatsPerTurn).toBe(4);
    expect(TURN_TIMING_RULES.initialBeatDurationMs).toBe(2000);
    expect(TURN_TIMING_RULES.beatDurationDecayPerTurnMs).toBe(50);
    expect(TURN_TIMING_RULES.minBeatDurationMs).toBe(1000);
    expect(TURN_TIMING_RULES.roundResetBeatDurationMs).toBe(2000);
    expect(MATCH_RULES.roundsToWin).toBe(3);
    expect(MATCH_RULES.drawsAllowed).toBe(false);
  });

  it("matches action and energy definitions", () => {
    expect(ACTIONS).toEqual(["ki", "attack", "guard", "kamehameha", "teleport"]);
    expect(ACTION_ENERGY_COST).toEqual({
      ki: 0,
      attack: 1,
      guard: 0,
      kamehameha: 2,
      teleport: 1
    });
    expect(ENERGY_RULES.initial).toBe(0);
    expect(ENERGY_RULES.min).toBe(0);
    expect(ENERGY_RULES.max).toBe(Number.POSITIVE_INFINITY);
    expect(ENERGY_RULES.gainOnKi).toBe(1);
  });

  it("matches client-side action availability rules", () => {
    expect(getClientEnabledActions(0)).toEqual(["ki", "guard"]);
    expect(getClientEnabledActions(1)).toEqual(["ki", "attack", "guard", "teleport"]);
    expect(getClientEnabledActions(2)).toEqual([
      "ki",
      "attack",
      "guard",
      "kamehameha",
      "teleport"
    ]);
  });
});

describe("domain enum guards", () => {
  it("accepts known values and rejects unknown values", () => {
    expect(isAction("ki")).toBe(true);
    expect(isAction("boom")).toBe(false);
    expect(isBeatName("beat3")).toBe(true);
    expect(isBeatName("beat5")).toBe(false);
    expect(isGamePhase("input_open")).toBe(true);
    expect(isGamePhase("paused")).toBe(false);
  });

  it("throws on invalid action asserts", () => {
    expect(() => assertAction("invalid_action")).toThrow("Invalid action");
  });
});
