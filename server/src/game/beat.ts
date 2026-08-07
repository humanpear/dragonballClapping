import { TURN_TIMING_RULES, type BeatName } from "./domain.js";

export type BeatIndex = 1 | 2 | 3 | 4;

export interface BeatState {
  turn: number;
  beatIndex: BeatIndex;
  beatName: BeatName;
  beatDurationMs: number;
}

const BEAT_NAME_BY_INDEX: Record<BeatIndex, BeatName> = {
  1: "beat1",
  2: "beat2",
  3: "beat3",
  4: "beat4"
};

export function getBeatDurationForTurn(turn: number): number {
  const safeTurn = Math.max(1, Math.trunc(turn));
  const decrease = (safeTurn - 1) * TURN_TIMING_RULES.beatDurationDecayPerTurnMs;
  const duration = TURN_TIMING_RULES.initialBeatDurationMs - decrease;
  return Math.max(TURN_TIMING_RULES.minBeatDurationMs, duration);
}

export function createRoundStartBeatState(): BeatState {
  return {
    turn: 1,
    beatIndex: 1,
    beatName: "beat1",
    beatDurationMs: TURN_TIMING_RULES.roundResetBeatDurationMs
  };
}

export function isInputOpenBeat(state: BeatState): boolean {
  return state.beatIndex <= 2;
}

export function shouldLockInputAtBeatEnd(state: BeatState): boolean {
  return state.beatIndex === 2;
}

export function isActionRevealBeat(state: BeatState): boolean {
  return state.beatIndex === 3;
}

export function isResultBeat(state: BeatState): boolean {
  return state.beatIndex === 4;
}

export function advanceBeat(state: BeatState): BeatState {
  if (state.beatIndex < 4) {
    const nextBeatIndex = (state.beatIndex + 1) as BeatIndex;
    return {
      turn: state.turn,
      beatIndex: nextBeatIndex,
      beatName: BEAT_NAME_BY_INDEX[nextBeatIndex],
      beatDurationMs: state.beatDurationMs
    };
  }

  const nextTurn = state.turn + 1;
  return {
    turn: nextTurn,
    beatIndex: 1,
    beatName: "beat1",
    beatDurationMs: getBeatDurationForTurn(nextTurn)
  };
}
