import { describe, expect, it } from "vitest";
import { advanceBeat, createRoundStartBeatState } from "./beat.js";
import { createTurnInputState, finalizeTurnInput, tryLockTurnInput } from "./input.js";

describe("turn input lock", () => {
  it("locks first input and ignores later inputs in same turn", () => {
    const beat1 = createRoundStartBeatState();
    const initial = createTurnInputState();

    const firstAttempt = tryLockTurnInput(initial, beat1, "attack");
    expect(firstAttempt.accepted).toBe(true);
    expect(firstAttempt.reason).toBe("accepted");
    expect(firstAttempt.nextState.lockedAction).toBe("attack");
    expect(firstAttempt.nextState.lockedAtBeat).toBe(1);

    const beat2 = advanceBeat(beat1);
    const secondAttempt = tryLockTurnInput(firstAttempt.nextState, beat2, "kamehameha");
    expect(secondAttempt.accepted).toBe(false);
    expect(secondAttempt.reason).toBe("already_locked");
    expect(secondAttempt.nextState.lockedAction).toBe("attack");
    expect(secondAttempt.nextState.lockedAtBeat).toBe(1);
  });

  it("accepts input only in beat1~beat2", () => {
    const beat1 = createRoundStartBeatState();
    const beat2 = advanceBeat(beat1);
    const beat3 = advanceBeat(beat2);
    const beat4 = advanceBeat(beat3);

    expect(tryLockTurnInput(createTurnInputState(), beat1, "ki").accepted).toBe(true);
    expect(tryLockTurnInput(createTurnInputState(), beat2, "ki").accepted).toBe(true);
    expect(tryLockTurnInput(createTurnInputState(), beat3, "ki").accepted).toBe(false);

    const closed = tryLockTurnInput(createTurnInputState(), beat4, "ki");
    expect(closed.accepted).toBe(false);
    expect(closed.reason).toBe("input_closed");
  });
});

describe("turn input finalize", () => {
  it("uses locked action when present", () => {
    const beat1 = createRoundStartBeatState();
    const locked = tryLockTurnInput(createTurnInputState(), beat1, "guard").nextState;

    const finalized = finalizeTurnInput(locked);
    expect(finalized.confirmedAction).toBe("guard");
    expect(finalized.timedOutToKi).toBe(false);
  });

  it("falls back to ki when no action was entered by beat2 end", () => {
    const finalized = finalizeTurnInput(createTurnInputState());
    expect(finalized.confirmedAction).toBe("ki");
    expect(finalized.timedOutToKi).toBe(true);
  });
});
