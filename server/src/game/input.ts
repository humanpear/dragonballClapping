import type { Action } from "./domain.js";
import type { BeatState } from "./beat.js";
import { isInputOpenBeat } from "./beat.js";

export interface TurnInputState {
  lockedAction: Action | null;
  lockedAtBeat: BeatState["beatIndex"] | null;
}

export interface InputAttemptResult {
  accepted: boolean;
  reason: "accepted" | "already_locked" | "input_closed";
  nextState: TurnInputState;
}

export interface FinalizedTurnInput {
  confirmedAction: Action;
  timedOutToKi: boolean;
}

export function createTurnInputState(): TurnInputState {
  return {
    lockedAction: null,
    lockedAtBeat: null
  };
}

export function tryLockTurnInput(
  currentState: TurnInputState,
  beatState: BeatState,
  action: Action
): InputAttemptResult {
  if (!isInputOpenBeat(beatState)) {
    return {
      accepted: false,
      reason: "input_closed",
      nextState: currentState
    };
  }

  if (currentState.lockedAction) {
    return {
      accepted: false,
      reason: "already_locked",
      nextState: currentState
    };
  }

  return {
    accepted: true,
    reason: "accepted",
    nextState: {
      lockedAction: action,
      lockedAtBeat: beatState.beatIndex
    }
  };
}

export function finalizeTurnInput(state: TurnInputState): FinalizedTurnInput {
  if (state.lockedAction) {
    return {
      confirmedAction: state.lockedAction,
      timedOutToKi: false
    };
  }

  return {
    confirmedAction: "ki",
    timedOutToKi: true
  };
}
