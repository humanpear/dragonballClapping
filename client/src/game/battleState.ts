import {
  applyActionEnergy,
  confirmActionByEnergy,
  decideCpuAction,
  getBeatDurationForTurn,
  resolveTurnOutcome,
  type Action,
  type TurnOutcome
} from "./core";

export type BeatIndex = 1 | 2 | 3 | 4;
export type SlotState = "empty" | "win" | "lose";
export type MatchWinner = "player" | "cpu" | null;

export interface BattleState {
  roundNumber: number;
  turnNumber: number;
  beatIndex: BeatIndex;
  beatDurationMs: number;
  playerEnergy: number;
  cpuEnergy: number;
  lockedPlayerAction: Action | null;
  lockedCpuAction: Action | null;
  playerDisplayAction: Action | null;
  cpuDisplayAction: Action | null;
  turnOutcome: TurnOutcome | null;
  playerWins: number;
  cpuWins: number;
  playerSlots: SlotState[];
  cpuSlots: SlotState[];
  isRoundIntro: boolean;
  roundIntroLabel: string;
  matchWinner: MatchWinner;
}

export const ROUND_INTRO_DURATION_MS = 1200;
export const MATCH_WINS_TO_END = 3;

export function createInitialBattleState(): BattleState {
  return {
    roundNumber: 1,
    turnNumber: 1,
    beatIndex: 1,
    beatDurationMs: getBeatDurationForTurn(1),
    playerEnergy: 0,
    cpuEnergy: 0,
    lockedPlayerAction: null,
    lockedCpuAction: null,
    playerDisplayAction: null,
    cpuDisplayAction: null,
    turnOutcome: null,
    playerWins: 0,
    cpuWins: 0,
    playerSlots: ["empty", "empty", "empty"],
    cpuSlots: ["empty", "empty", "empty"],
    isRoundIntro: true,
    roundIntroLabel: "ROUND1",
    matchWinner: null
  };
}

function updateRoundSlots(
  playerSlots: SlotState[],
  cpuSlots: SlotState[],
  result: Exclude<TurnOutcome, "draw">,
  playerWins: number,
  cpuWins: number
): { playerSlots: SlotState[]; cpuSlots: SlotState[] } {
  const nextPlayerSlots = [...playerSlots];
  const nextCpuSlots = [...cpuSlots];

  if (result === "player") {
    const slotIndex = Math.min(2, playerWins - 1);
    nextPlayerSlots[slotIndex] = "win";
    nextCpuSlots[slotIndex] = "lose";
    return { playerSlots: nextPlayerSlots, cpuSlots: nextCpuSlots };
  }

  const slotIndex = Math.min(2, cpuWins - 1);
  nextPlayerSlots[slotIndex] = "lose";
  nextCpuSlots[slotIndex] = "win";
  return { playerSlots: nextPlayerSlots, cpuSlots: nextCpuSlots };
}

export function advanceBattleState(state: BattleState): BattleState {
  if (state.isRoundIntro) {
    return {
      ...state,
      isRoundIntro: false,
      beatIndex: 1,
      turnOutcome: null,
      lockedPlayerAction: null,
      lockedCpuAction: null,
      playerDisplayAction: null,
      cpuDisplayAction: null
    };
  }

  if (state.beatIndex === 1) {
    return { ...state, beatIndex: 2 };
  }

  if (state.beatIndex === 2) {
    const requestedPlayerAction = state.lockedPlayerAction ?? "ki";
    const confirmedPlayerAction = confirmActionByEnergy(
      requestedPlayerAction,
      state.playerEnergy
    );

    const requestedCpuAction = decideCpuAction(state.cpuEnergy, state.playerEnergy);
    const confirmedCpuAction = confirmActionByEnergy(requestedCpuAction, state.cpuEnergy);

    return {
      ...state,
      beatIndex: 3,
      lockedPlayerAction: confirmedPlayerAction,
      lockedCpuAction: confirmedCpuAction,
      playerDisplayAction: confirmedPlayerAction,
      cpuDisplayAction: confirmedCpuAction,
      playerEnergy: applyActionEnergy(confirmedPlayerAction, state.playerEnergy),
      cpuEnergy: applyActionEnergy(confirmedCpuAction, state.cpuEnergy)
    };
  }

  if (state.beatIndex === 3) {
    const playerAction = state.playerDisplayAction ?? "ki";
    const cpuAction = state.cpuDisplayAction ?? "ki";

    return {
      ...state,
      beatIndex: 4,
      turnOutcome: resolveTurnOutcome(playerAction, cpuAction)
    };
  }

  if (state.turnOutcome === "draw" || state.turnOutcome === null) {
    const nextTurn = state.turnNumber + 1;
    return {
      ...state,
      turnNumber: nextTurn,
      beatIndex: 1,
      beatDurationMs: getBeatDurationForTurn(nextTurn),
      lockedPlayerAction: null,
      lockedCpuAction: null,
      playerDisplayAction: null,
      cpuDisplayAction: null,
      turnOutcome: null
    };
  }

  const nextPlayerWins =
    state.turnOutcome === "player" ? state.playerWins + 1 : state.playerWins;
  const nextCpuWins = state.turnOutcome === "cpu" ? state.cpuWins + 1 : state.cpuWins;

  const nextSlots = updateRoundSlots(
    state.playerSlots,
    state.cpuSlots,
    state.turnOutcome,
    nextPlayerWins,
    nextCpuWins
  );

  const matchWinner: MatchWinner =
    nextPlayerWins >= MATCH_WINS_TO_END
      ? "player"
      : nextCpuWins >= MATCH_WINS_TO_END
        ? "cpu"
        : null;

  if (matchWinner) {
    return {
      ...state,
      playerWins: nextPlayerWins,
      cpuWins: nextCpuWins,
      playerSlots: nextSlots.playerSlots,
      cpuSlots: nextSlots.cpuSlots,
      matchWinner
    };
  }

  const nextRound = state.roundNumber + 1;
  return {
    ...state,
    roundNumber: nextRound,
    turnNumber: 1,
    beatIndex: 1,
    beatDurationMs: getBeatDurationForTurn(1),
    playerEnergy: 0,
    cpuEnergy: 0,
    lockedPlayerAction: null,
    lockedCpuAction: null,
    playerDisplayAction: null,
    cpuDisplayAction: null,
    turnOutcome: null,
    playerWins: nextPlayerWins,
    cpuWins: nextCpuWins,
    playerSlots: nextSlots.playerSlots,
    cpuSlots: nextSlots.cpuSlots,
    isRoundIntro: true,
    roundIntroLabel: `ROUND${nextRound}`
  };
}
