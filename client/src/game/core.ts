export const ACTIONS = ["ki", "attack", "guard", "kamehameha", "teleport"] as const;
export type Action = (typeof ACTIONS)[number];

export type TurnOutcome = "player" | "cpu" | "draw";

export const ACTION_COST: Record<Action, number> = {
  ki: 0,
  attack: 1,
  guard: 0,
  kamehameha: 2,
  teleport: 1
};

const TURN_BASE_RULES: Record<string, "left" | "right" | "draw"> = {
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

function invert(result: "left" | "right" | "draw"): "left" | "right" | "draw" {
  if (result === "draw") {
    return "draw";
  }

  return result === "left" ? "right" : "left";
}

function normalizeEnergy(energy: number): number {
  if (!Number.isFinite(energy)) {
    return 0;
  }

  return Math.max(0, Math.trunc(energy));
}

export function canAffordAction(energy: number, action: Action): boolean {
  return normalizeEnergy(energy) >= ACTION_COST[action];
}

export function confirmActionByEnergy(requestedAction: Action, energy: number): Action {
  if (!canAffordAction(energy, requestedAction)) {
    return "ki";
  }

  return requestedAction;
}

export function applyActionEnergy(action: Action, energy: number): number {
  const normalizedEnergy = normalizeEnergy(energy);
  if (action === "ki") {
    return normalizedEnergy + 1;
  }

  return Math.max(0, normalizedEnergy - ACTION_COST[action]);
}

export function resolveTurnOutcome(playerAction: Action, cpuAction: Action): TurnOutcome {
  const directKey = `${playerAction}|${cpuAction}`;
  const direct = TURN_BASE_RULES[directKey];
  const result = direct ?? invert(TURN_BASE_RULES[`${cpuAction}|${playerAction}`] ?? "draw");

  if (result === "draw") {
    return "draw";
  }

  return result === "left" ? "player" : "cpu";
}

export function getCpuCandidateActions(cpuEnergy: number, playerEnergy: number): Action[] {
  const normalizedCpuEnergy = normalizeEnergy(cpuEnergy);
  const normalizedPlayerEnergy = normalizeEnergy(playerEnergy);

  if (normalizedCpuEnergy >= 2 && normalizedPlayerEnergy >= 2) {
    return ["ki", "guard", "attack", "kamehameha", "teleport"];
  }

  if (normalizedCpuEnergy >= 2 && normalizedPlayerEnergy >= 1) {
    return ["ki", "guard", "attack", "kamehameha"];
  }

  if (normalizedCpuEnergy >= 2 && normalizedPlayerEnergy === 0) {
    return ["ki", "attack"];
  }

  if (normalizedCpuEnergy >= 1 && normalizedPlayerEnergy >= 1) {
    return ["ki", "guard", "attack"];
  }

  if (normalizedCpuEnergy >= 1 && normalizedPlayerEnergy === 0) {
    return ["ki", "attack"];
  }

  if (normalizedCpuEnergy === 0 && normalizedPlayerEnergy >= 1) {
    return ["ki", "guard"];
  }

  return ["ki"];
}

export function decideCpuAction(cpuEnergy: number, playerEnergy: number): Action {
  const candidates = getCpuCandidateActions(cpuEnergy, playerEnergy);
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] ?? candidates[0];
}

export function getBeatDurationForTurn(turn: number): number {
  const normalizedTurn = Math.max(1, Math.trunc(turn));
  const duration = 1000 - (normalizedTurn - 1) * 50;
  return Math.max(300, duration);
}

export function getEnabledActionsByEnergy(energy: number): Action[] {
  const normalizedEnergy = normalizeEnergy(energy);
  if (normalizedEnergy >= 2) {
    return [...ACTIONS];
  }

  if (normalizedEnergy >= 1) {
    return ["ki", "attack", "guard", "teleport"];
  }

  return ["ki", "guard"];
}
