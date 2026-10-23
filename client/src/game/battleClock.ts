import { TURN_TIMING_RULES } from "../../../shared/timing.js";
import { advanceBattleState, createInitialBattleState, ROUND_INTRO_DURATION_MS, type BattleState } from "./battleState";
import type { Action } from "./core";

export interface TimedBattle extends BattleState {
  phaseStartedAt: number;
  nextAt: number;
  pausedAt: number | null;
}

function assertTime(now: number) {
  if (!Number.isFinite(now)) throw new RangeError("Clock must be finite.");
}

export function createTimedBattle(now: number): TimedBattle {
  assertTime(now);
  return { ...createInitialBattleState(), phaseStartedAt: now, nextAt: now + ROUND_INTRO_DURATION_MS, pausedAt: null };
}

/** Advance scheduled boundaries, never restart a beat from an input/render time. */
export function advanceBattleClock(state: TimedBattle, now: number): TimedBattle {
  assertTime(now);
  if (state.pausedAt !== null) return state;
  let current = state;
  while (!current.matchWinner && now >= current.nextAt) {
    const at = current.nextAt;
    const next = advanceBattleState(current);
    current = {
      ...next, pausedAt: null, phaseStartedAt: at,
      nextAt: next.matchWinner ? Infinity : at + (next.isRoundIntro ? ROUND_INTRO_DURATION_MS : next.beatDurationMs)
    };
  }
  return current;
}

export function battleTurnKey(state: BattleState): string {
  return `${state.roundNumber}:${state.turnNumber}`;
}

export function submitBattleAction(state: TimedBattle, action: Action, now: number, expectedTurn = battleTurnKey(state)): TimedBattle {
  const current = advanceBattleClock(state, now);
  if (current.pausedAt !== null || current.isRoundIntro || current.matchWinner ||
      battleTurnKey(current) !== expectedTurn || now < current.phaseStartedAt ||
      current.beatIndex > TURN_TIMING_RULES.inputBeats || current.lockedPlayerAction) return current;
  return { ...current, lockedPlayerAction: action };
}

export function pauseBattleClock(state: TimedBattle, now: number): TimedBattle {
  const current = advanceBattleClock(state, now);
  if (current.pausedAt !== null || current.matchWinner) return current;
  return { ...current, pausedAt: Math.max(now, current.phaseStartedAt) };
}

export function resumeBattleClock(state: TimedBattle, now: number): TimedBattle {
  assertTime(now);
  if (state.pausedAt === null) return state;
  const elapsed = Math.max(0, now - state.pausedAt);
  return { ...state, pausedAt: null, phaseStartedAt: state.phaseStartedAt + elapsed, nextAt: state.nextAt + elapsed };
}
