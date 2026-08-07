import type { Action } from "./domain.js";

export type DuelOutcome = "left" | "right" | "draw";

export interface ActionResolution {
  leftAction: Action;
  rightAction: Action;
  outcome: DuelOutcome;
}

const BASE_RULES: Readonly<Record<string, DuelOutcome>> = {
  "ki|ki": "draw",
  "ki|attack": "right",
  "ki|kamehameha": "right",
  "ki|guard": "draw",
  "ki|teleport": "draw",

  "attack|attack": "draw",
  "attack|kamehameha": "right",
  "attack|guard": "draw",
  "attack|teleport": "draw",

  "kamehameha|kamehameha": "draw",
  "kamehameha|guard": "left",
  "kamehameha|teleport": "draw",

  "guard|guard": "draw",
  "guard|teleport": "draw",

  "teleport|teleport": "draw"
};

export function invertOutcome(outcome: DuelOutcome): DuelOutcome {
  if (outcome === "draw") {
    return "draw";
  }

  return outcome === "left" ? "right" : "left";
}

export function resolveAction(leftAction: Action, rightAction: Action): ActionResolution {
  const directKey = `${leftAction}|${rightAction}`;
  const directOutcome = BASE_RULES[directKey];
  if (directOutcome) {
    return { leftAction, rightAction, outcome: directOutcome };
  }

  const reverseKey = `${rightAction}|${leftAction}`;
  const reverseOutcome = BASE_RULES[reverseKey];
  if (reverseOutcome) {
    return {
      leftAction,
      rightAction,
      outcome: invertOutcome(reverseOutcome)
    };
  }

  throw new Error(`Missing action rule for pair: ${leftAction} vs ${rightAction}`);
}
