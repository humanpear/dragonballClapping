import { ACTION_ENERGY_COST, ENERGY_RULES, type Action, isAction } from "./domain.js";

export interface ConfirmedActionInput {
  requestedAction: Action;
  appliedAction: Action;
  fallbackApplied: boolean;
  previousEnergy: number;
  nextEnergy: number;
  energyDelta: number;
}

export class InvalidActionError extends Error {
  readonly code = "MALFORMED_ACTION";
  readonly received: unknown;

  constructor(received: unknown) {
    super(`Malformed action input: ${String(received)}`);
    this.name = "InvalidActionError";
    this.received = received;
  }
}

function normalizeEnergy(value: number): number {
  if (!Number.isFinite(value)) {
    return ENERGY_RULES.min;
  }

  return Math.max(ENERGY_RULES.min, Math.trunc(value));
}

export function hasEnoughEnergy(energy: number, action: Action): boolean {
  const normalizedEnergy = normalizeEnergy(energy);
  return normalizedEnergy >= ACTION_ENERGY_COST[action];
}

export function applyActionEnergy(currentEnergy: number, action: Action): number {
  const normalizedEnergy = normalizeEnergy(currentEnergy);

  if (action === "ki") {
    return normalizedEnergy + ENERGY_RULES.gainOnKi;
  }

  return Math.max(ENERGY_RULES.min, normalizedEnergy - ACTION_ENERGY_COST[action]);
}

export function confirmActionInput(
  input: unknown,
  currentEnergy: number
): ConfirmedActionInput {
  if (!isAction(input)) {
    throw new InvalidActionError(input);
  }

  const requestedAction = input;
  const fallbackApplied = !hasEnoughEnergy(currentEnergy, requestedAction);
  const appliedAction: Action = fallbackApplied ? "ki" : requestedAction;
  const previousEnergy = normalizeEnergy(currentEnergy);
  const nextEnergy = applyActionEnergy(previousEnergy, appliedAction);

  return {
    requestedAction,
    appliedAction,
    fallbackApplied,
    previousEnergy,
    nextEnergy,
    energyDelta: nextEnergy - previousEnergy
  };
}
