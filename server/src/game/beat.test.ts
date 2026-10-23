import { describe, expect, it } from "vitest";
import {
  advanceBeat,
  createRoundStartBeatState,
  getBeatDurationForTurn,
  isActionRevealBeat,
  isInputOpenBeat,
  isResultBeat,
  shouldLockInputAtBeatEnd,
  type BeatState
} from "./beat.js";

function moveByBeats(state: BeatState, steps: number): BeatState {
  let cursor = state;
  for (let i = 0; i < steps; i += 1) {
    cursor = advanceBeat(cursor);
  }
  return cursor;
}

describe("beat orchestrator", () => {
  it("starts round at beat1 with 2.0s", () => {
    const state = createRoundStartBeatState();
    expect(state.turn).toBe(1);
    expect(state.beatIndex).toBe(1);
    expect(state.beatName).toBe("beat1");
    expect(state.beatDurationMs).toBe(2000);
  });

  it("keeps beat duration within a turn and decreases each new turn", () => {
    const start = createRoundStartBeatState();

    const afterOneBeat = advanceBeat(start);
    expect(afterOneBeat.turn).toBe(1);
    expect(afterOneBeat.beatIndex).toBe(2);
    expect(afterOneBeat.beatDurationMs).toBe(2000);

    const afterOneTurn = moveByBeats(start, 4);
    expect(afterOneTurn.turn).toBe(2);
    expect(afterOneTurn.beatIndex).toBe(1);
    expect(afterOneTurn.beatDurationMs).toBe(1950);

    const afterTwoTurns = moveByBeats(start, 8);
    expect(afterTwoTurns.turn).toBe(3);
    expect(afterTwoTurns.beatDurationMs).toBe(1900);
  });

  it("clamps beat duration at minimum 1.0s", () => {
    expect(getBeatDurationForTurn(21)).toBe(1000);
    expect(getBeatDurationForTurn(200)).toBe(1000);
  });

  it("supports round reset back to initial beat timing", () => {
    const start = createRoundStartBeatState();
    const deepState = moveByBeats(start, 20); // turn 6 beat 1
    expect(deepState.turn).toBe(6);
    expect(deepState.beatDurationMs).toBe(1750);

    const reset = createRoundStartBeatState();
    expect(reset.turn).toBe(1);
    expect(reset.beatIndex).toBe(1);
    expect(reset.beatDurationMs).toBe(2000);
  });

  it("marks input window, action reveal, and lock boundary by beat", () => {
    const beat1 = createRoundStartBeatState();
    const beat2 = advanceBeat(beat1);
    const beat3 = advanceBeat(beat2);
    const beat4 = advanceBeat(beat3);

    expect(isInputOpenBeat(beat1)).toBe(true);
    expect(isInputOpenBeat(beat2)).toBe(true);
    expect(isInputOpenBeat(beat3)).toBe(false);
    expect(isInputOpenBeat(beat4)).toBe(false);

    expect(shouldLockInputAtBeatEnd(beat1)).toBe(false);
    expect(shouldLockInputAtBeatEnd(beat2)).toBe(true);
    expect(shouldLockInputAtBeatEnd(beat3)).toBe(false);
    expect(shouldLockInputAtBeatEnd(beat4)).toBe(false);

    expect(isActionRevealBeat(beat3)).toBe(true);
    expect(isResultBeat(beat4)).toBe(true);
  });
});
