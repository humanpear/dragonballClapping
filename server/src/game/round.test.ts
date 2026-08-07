import { describe, expect, it } from "vitest";
import { createInitialRoundScore, resolveBeat4Transition } from "./round.js";

describe("resolveBeat4Transition", () => {
  it("moves to next turn immediately on draw", () => {
    const score = createInitialRoundScore();
    const transition = resolveBeat4Transition(score, "draw", 1);

    expect(transition.phase).toBe("next_turn");
    expect(transition.score).toEqual({ playerWins: 0, opponentWins: 0 });
    expect(transition.currentRound).toBe(1);
    expect(transition.nextRoundLabel).toBeNull();
  });

  it("applies round win and moves to next round on non-draw", () => {
    const score = createInitialRoundScore();
    const transition = resolveBeat4Transition(score, "left", 1);

    expect(transition.phase).toBe("next_round");
    expect(transition.score).toEqual({ playerWins: 1, opponentWins: 0 });
    expect(transition.currentRound).toBe(2);
    expect(transition.nextRoundLabel).toBe("ROUND2");
  });

  it("ends match when one side reaches 3 round wins", () => {
    const score = { playerWins: 2, opponentWins: 1 };
    const transition = resolveBeat4Transition(score, "left", 4);

    expect(transition.phase).toBe("match_end");
    expect(transition.score).toEqual({ playerWins: 3, opponentWins: 1 });
    expect(transition.currentRound).toBe(4);
    expect(transition.nextRoundLabel).toBeNull();
  });
});
