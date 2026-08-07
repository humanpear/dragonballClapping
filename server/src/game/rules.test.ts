import { describe, expect, it } from "vitest";
import { ACTIONS, type Action } from "./domain.js";
import { invertOutcome, resolveAction, type DuelOutcome } from "./rules.js";

const SPEC_CASES: Array<{
  left: Action;
  right: Action;
  expected: DuelOutcome;
}> = [
  { left: "ki", right: "ki", expected: "draw" },
  { left: "ki", right: "attack", expected: "right" },
  { left: "ki", right: "kamehameha", expected: "right" },
  { left: "ki", right: "guard", expected: "draw" },
  { left: "ki", right: "teleport", expected: "draw" },

  { left: "attack", right: "attack", expected: "draw" },
  { left: "attack", right: "kamehameha", expected: "right" },
  { left: "attack", right: "guard", expected: "draw" },
  { left: "attack", right: "teleport", expected: "draw" },

  { left: "kamehameha", right: "kamehameha", expected: "draw" },
  { left: "kamehameha", right: "guard", expected: "left" },
  { left: "kamehameha", right: "teleport", expected: "draw" },

  { left: "guard", right: "guard", expected: "draw" },
  { left: "guard", right: "teleport", expected: "draw" },

  { left: "teleport", right: "teleport", expected: "draw" }
];

describe("resolveAction", () => {
  it("matches all judgement pairs from spec", () => {
    for (const testCase of SPEC_CASES) {
      const result = resolveAction(testCase.left, testCase.right);
      expect(result.outcome).toBe(testCase.expected);
    }
  });

  it("keeps symmetry consistency for all action pairs", () => {
    for (const left of ACTIONS) {
      for (const right of ACTIONS) {
        const forward = resolveAction(left, right).outcome;
        const reverse = resolveAction(right, left).outcome;
        expect(reverse).toBe(invertOutcome(forward));
      }
    }
  });
});
