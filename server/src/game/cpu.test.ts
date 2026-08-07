import { describe, expect, it } from "vitest";
import { advanceBeat, createRoundStartBeatState } from "./beat.js";
import {
  decideCpuAction,
  getCpuCandidateActions,
  pickUniformCandidate,
  shouldCpuDecideAtBeat
} from "./cpu.js";

describe("cpu decision timing", () => {
  it("decides only at beat3", () => {
    const beat1 = createRoundStartBeatState();
    const beat2 = advanceBeat(beat1);
    const beat3 = advanceBeat(beat2);
    const beat4 = advanceBeat(beat3);

    expect(shouldCpuDecideAtBeat(beat1)).toBe(false);
    expect(shouldCpuDecideAtBeat(beat2)).toBe(false);
    expect(shouldCpuDecideAtBeat(beat3)).toBe(true);
    expect(shouldCpuDecideAtBeat(beat4)).toBe(false);
  });
});

describe("cpu candidate policy", () => {
  it("uses spec-defined candidate sets by energy state", () => {
    expect(getCpuCandidateActions({ cpuEnergy: 2, playerEnergy: 2 })).toEqual([
      "ki",
      "guard",
      "attack",
      "kamehameha",
      "teleport"
    ]);
    expect(getCpuCandidateActions({ cpuEnergy: 2, playerEnergy: 1 })).toEqual([
      "ki",
      "guard",
      "attack",
      "kamehameha"
    ]);
    expect(getCpuCandidateActions({ cpuEnergy: 2, playerEnergy: 0 })).toEqual([
      "ki",
      "attack"
    ]);
    expect(getCpuCandidateActions({ cpuEnergy: 1, playerEnergy: 1 })).toEqual([
      "ki",
      "guard",
      "attack"
    ]);
    expect(getCpuCandidateActions({ cpuEnergy: 1, playerEnergy: 0 })).toEqual([
      "ki",
      "attack"
    ]);
    expect(getCpuCandidateActions({ cpuEnergy: 0, playerEnergy: 1 })).toEqual([
      "ki",
      "guard"
    ]);
    expect(getCpuCandidateActions({ cpuEnergy: 0, playerEnergy: 0 })).toEqual(["ki"]);
  });
});

describe("cpu random selection", () => {
  it("samples uniformly from candidate slots by random value", () => {
    const candidates = ["ki", "guard", "attack", "kamehameha", "teleport"] as const;

    expect(pickUniformCandidate([...candidates], 0.0)).toBe("ki");
    expect(pickUniformCandidate([...candidates], 0.2)).toBe("guard");
    expect(pickUniformCandidate([...candidates], 0.4)).toBe("attack");
    expect(pickUniformCandidate([...candidates], 0.6)).toBe("kamehameha");
    expect(pickUniformCandidate([...candidates], 0.8)).toBe("teleport");
  });

  it("never returns action outside allowed set", () => {
    const context = { cpuEnergy: 2, playerEnergy: 1 };
    const allowed = getCpuCandidateActions(context);

    const draws = [0.0, 0.1, 0.3, 0.51, 0.99];
    for (const draw of draws) {
      const decision = decideCpuAction(context, () => draw);
      expect(allowed).toContain(decision.action);
      expect(decision.candidates).toEqual(allowed);
    }
  });
});
