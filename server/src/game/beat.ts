import { TURN_TIMING_RULES, type BeatName } from "./domain.js";
import { getBeatDurationForTurn } from "../../../shared/timing.js";
export { getBeatDurationForTurn } from "../../../shared/timing.js";

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

export function createRoundStartBeatState(): BeatState {
  return {
    turn: 1,
    beatIndex: 1,
    beatName: "beat1",
    beatDurationMs: getBeatDurationForTurn(1)
  };
}

export function isInputOpenBeat(state: BeatState): boolean {
  return state.beatIndex <= TURN_TIMING_RULES.inputBeats;
}

export function shouldLockInputAtBeatEnd(state: BeatState): boolean {
  return state.beatIndex === TURN_TIMING_RULES.inputBeats;
}

export function isActionRevealBeat(state: BeatState): boolean {
  return state.beatIndex === TURN_TIMING_RULES.revealBeat;
}

export function isResultBeat(state: BeatState): boolean {
  return state.beatIndex === TURN_TIMING_RULES.resultBeat;
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
