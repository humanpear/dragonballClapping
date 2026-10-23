export const TIMING_RULE_VERSION: string;
export const TURN_TIMING_RULES: Readonly<{
  beatsPerTurn: number;
  inputBeats: number;
  revealBeat: number;
  resultBeat: number;
  initialBeatDurationMs: number;
  beatDurationDecayPerTurnMs: number;
  minBeatDurationMs: number;
  roundResetBeatDurationMs: number;
}>;
export function getBeatDurationForTurn(turn: number): number;
