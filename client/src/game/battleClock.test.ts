import { afterEach, describe, expect, it, vi } from "vitest";
import { advanceBattleClock, createTimedBattle, pauseBattleClock, resumeBattleClock, submitBattleAction } from "./battleClock";
import { getBeatDurationForTurn as clientDuration } from "./core";
import { advanceBeat, createRoundStartBeatState, getBeatDurationForTurn as serverDuration, isInputOpenBeat } from "../../../server/src/game/beat";

afterEach(() => vi.restoreAllMocks());

describe("shared timing contract", () => {
  it.each([[1, 2000], [2, 1950], [20, 1050], [21, 1000], [22, 1000], [500, 1000]])("client and server use turn %i = %ims", (turn, ms) => {
    expect(clientDuration(turn)).toBe(ms);
    expect(serverDuration(turn)).toBe(ms);
  });

  it.each([0, -1, 1.5, NaN, Infinity])("rejects invalid turn %s on both sides", turn => {
    expect(() => clientDuration(turn)).toThrow(RangeError);
    expect(() => serverDuration(turn)).toThrow(RangeError);
  });

  it("preserves the same duration and input/reveal boundaries for 30 turns", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    let client = advanceBattleClock(createTimedBattle(0), 1200);
    let server = createRoundStartBeatState();
    for (let i = 0; i < 120; i++) {
      expect(client.turnNumber).toBe(server.turn);
      expect(client.beatIndex).toBe(server.beatIndex);
      expect(client.beatDurationMs).toBe(server.beatDurationMs);
      expect(client.playerDisplayAction !== null).toBe(!isInputOpenBeat(server));
      expect(client.turnOutcome !== null).toBe(server.beatIndex === 4);
      client = advanceBattleClock(client, client.nextAt);
      server = advanceBeat(server);
    }
  });
});

describe("absolute CPU clock", () => {
  it("does not restart Beat1 or Beat2 when selecting or duplicating input", () => {
    for (const time of [3199, 5199]) {
      const initial = advanceBattleClock(createTimedBattle(0), time);
      const selected = submitBattleAction(initial, "guard", time);
      expect(selected.nextAt).toBe(initial.nextAt);
      expect(selected.phaseStartedAt).toBe(initial.phaseStartedAt);
      expect(submitBattleAction(selected, "ki", time).lockedPlayerAction).toBe("guard");
      expect(advanceBattleClock(selected, 5200)).toMatchObject({ beatIndex: 3, playerDisplayAction: "guard", playerEnergy: 0 });
    }
  });

  it("accepts deadline - 1ms, rejects the deadline and late input even before the timer callback", () => {
    const stale = advanceBattleClock(createTimedBattle(0), 1200);
    expect(submitBattleAction(stale, "guard", 5199).lockedPlayerAction).toBe("guard");
    for (const now of [5200, 5201]) {
      expect(submitBattleAction(stale, "guard", now)).toMatchObject({ beatIndex: 3, playerDisplayAction: "ki", playerEnergy: 1 });
    }
  });

  it("rejects input originating from a previous turn", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const stale = advanceBattleClock(createTimedBattle(0), 1200);
    expect(submitBattleAction(stale, "guard", 9300)).toMatchObject({ turnNumber: 2, lockedPlayerAction: null, phaseStartedAt: 9200 });
  });

  it("catches delayed callbacks up without stretching time or resolving twice", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    let timely = createTimedBattle(0);
    for (const now of [1200, 3200, 5200, 7200, 9200, 11150, 11600]) timely = advanceBattleClock(timely, now);
    const delayed = advanceBattleClock(createTimedBattle(0), 11600);
    expect(delayed).toEqual(timely);
    expect(delayed).toMatchObject({ beatIndex: 2, turnNumber: 2, playerEnergy: 1, nextAt: 13100 });
    expect(advanceBattleClock(delayed, 11600)).toBe(delayed);
  });

  it("holds hidden-tab time and preserves the remaining input window", () => {
    let state = pauseBattleClock(createTimedBattle(0), 3000);
    expect(advanceBattleClock(state, 60000)).toBe(state);
    expect(submitBattleAction(state, "guard", 5000)).toBe(state);
    state = resumeBattleClock(state, 13000);
    expect(state).toMatchObject({ beatIndex: 1, phaseStartedAt: 11200, nextAt: 13200 });
    expect(submitBattleAction(state, "guard", 15199).lockedPlayerAction).toBe("guard");
    expect(submitBattleAction(state, "guard", 15200).playerDisplayAction).toBe("ki");
  });

  it("resets the next round to 2000ms after a win", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    let state = advanceBattleClock(createTimedBattle(0), 9200);
    state = submitBattleAction(state, "attack", 9300);
    state = advanceBattleClock(state, 17000);
    expect(state).toMatchObject({ isRoundIntro: true, roundNumber: 2, turnNumber: 1, beatDurationMs: 2000, playerWins: 1, playerEnergy: 0 });
    expect(advanceBattleClock(state, 18200)).toMatchObject({ beatIndex: 1, nextAt: 20200 });
  });
});
