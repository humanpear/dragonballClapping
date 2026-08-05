import type { Action } from "./domain.js";
import type { BeatState } from "./beat.js";

export interface CpuContext {
  cpuEnergy: number;
  playerEnergy: number;
}

export interface CpuDecision {
  action: Action;
  candidates: Action[];
}

function normalizeEnergy(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value));
}

export function shouldCpuDecideAtBeat(beatState: BeatState): boolean {
  return beatState.beatIndex === 3;
}

export function getCpuCandidateActions(context: CpuContext): Action[] {
  const cpuEnergy = normalizeEnergy(context.cpuEnergy);
  const playerEnergy = normalizeEnergy(context.playerEnergy);

  if (cpuEnergy >= 2 && playerEnergy >= 2) {
    return ["ki", "guard", "attack", "kamehameha", "teleport"];
  }

  if (cpuEnergy >= 2 && playerEnergy >= 1) {
    return ["ki", "guard", "attack", "kamehameha"];
  }

  if (cpuEnergy >= 2 && playerEnergy === 0) {
    return ["ki", "attack"];
  }

  if (cpuEnergy >= 1 && playerEnergy >= 1) {
    return ["ki", "guard", "attack"];
  }

  if (cpuEnergy >= 1 && playerEnergy === 0) {
    return ["ki", "attack"];
  }

  if (cpuEnergy === 0 && playerEnergy >= 1) {
    return ["ki", "guard"];
  }

  return ["ki"];
}

export function pickUniformCandidate(
  candidates: Action[],
  randomValue: number
): Action {
  const safeRandom = Math.min(Math.max(randomValue, 0), 0.999999999);
  const index = Math.floor(safeRandom * candidates.length);
  return candidates[index] ?? candidates[candidates.length - 1];
}

export function decideCpuAction(
  context: CpuContext,
  randomFn: () => number = Math.random
): CpuDecision {
  const candidates = getCpuCandidateActions(context);
  const action = pickUniformCandidate(candidates, randomFn());
  return { action, candidates };
}
