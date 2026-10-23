export { TURN_TIMING_RULES } from "../../../shared/timing.js";

export const ACTIONS = ["ki", "attack", "guard", "kamehameha", "teleport"] as const;
export type Action = (typeof ACTIONS)[number];

export const GAME_PHASES = [
  "input_open",
  "input_locked",
  "result_display",
  "round_end",
  "match_end"
] as const;
export type GamePhase = (typeof GAME_PHASES)[number];

export const BEAT_NAMES = ["beat1", "beat2", "beat3", "beat4"] as const;
export type BeatName = (typeof BEAT_NAMES)[number];

export const MATCH_RULES = {
  roundsToWin: 3,
  drawsAllowed: false
} as const;

export const ENERGY_RULES = {
  initial: 0,
  min: 0,
  max: Number.POSITIVE_INFINITY,
  gainOnKi: 1
} as const;

export const INVALID_ACTION_POLICY = {
  insufficientEnergy: "fallback_to_ki",
  malformedInput: "reject"
} as const;

export const ACTION_ENERGY_COST: Record<Action, number> = {
  ki: 0,
  attack: 1,
  guard: 0,
  kamehameha: 2,
  teleport: 1
};

const ACTION_SET = new Set<Action>(ACTIONS);
const GAME_PHASE_SET = new Set<GamePhase>(GAME_PHASES);
const BEAT_SET = new Set<BeatName>(BEAT_NAMES);

export function isAction(value: unknown): value is Action {
  return typeof value === "string" && ACTION_SET.has(value as Action);
}

export function isGamePhase(value: unknown): value is GamePhase {
  return typeof value === "string" && GAME_PHASE_SET.has(value as GamePhase);
}

export function isBeatName(value: unknown): value is BeatName {
  return typeof value === "string" && BEAT_SET.has(value as BeatName);
}

export function assertAction(value: unknown): asserts value is Action {
  if (!isAction(value)) {
    throw new Error(`Invalid action: ${String(value)}`);
  }
}

export function getClientEnabledActions(energy: number): Action[] {
  if (energy >= 2) {
    return [...ACTIONS];
  }

  if (energy >= 1) {
    return ["ki", "attack", "guard", "teleport"];
  }

  return ["ki", "guard"];
}
