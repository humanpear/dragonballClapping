import { MATCH_RULES } from "./domain.js";
import type { DuelOutcome } from "./rules.js";

export interface RoundScore {
  playerWins: number;
  opponentWins: number;
}

export interface Beat4Transition {
  phase: "next_turn" | "next_round" | "match_end";
  score: RoundScore;
  currentRound: number;
  nextRoundLabel: string | null;
}

export function createInitialRoundScore(): RoundScore {
  return {
    playerWins: 0,
    opponentWins: 0
  };
}

function normalizeRound(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.trunc(value));
}

export function resolveBeat4Transition(
  score: RoundScore,
  result: DuelOutcome,
  currentRound: number
): Beat4Transition {
  const safeRound = normalizeRound(currentRound);

  if (result === "draw") {
    return {
      phase: "next_turn",
      score,
      currentRound: safeRound,
      nextRoundLabel: null
    };
  }

  const nextScore =
    result === "left"
      ? { ...score, playerWins: score.playerWins + 1 }
      : { ...score, opponentWins: score.opponentWins + 1 };

  const isMatchEnd =
    nextScore.playerWins >= MATCH_RULES.roundsToWin ||
    nextScore.opponentWins >= MATCH_RULES.roundsToWin;

  if (isMatchEnd) {
    return {
      phase: "match_end",
      score: nextScore,
      currentRound: safeRound,
      nextRoundLabel: null
    };
  }

  const nextRound = safeRound + 1;
  return {
    phase: "next_round",
    score: nextScore,
    currentRound: nextRound,
    nextRoundLabel: `ROUND${nextRound}`
  };
}
