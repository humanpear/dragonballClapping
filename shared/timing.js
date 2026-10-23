// Pure ESM: consumed by both the browser bundle and the Node server.
export const TIMING_RULE_VERSION = "clapping-timing-2s-1s-v1";
const initialBeatDurationMs = 2000;
export const TURN_TIMING_RULES = Object.freeze({
  beatsPerTurn: 4,
  inputBeats: 2,
  revealBeat: 3,
  resultBeat: 4,
  initialBeatDurationMs,
  beatDurationDecayPerTurnMs: 50,
  minBeatDurationMs: 1000,
  roundResetBeatDurationMs: initialBeatDurationMs
});

export function getBeatDurationForTurn(turn) {
  if (!Number.isInteger(turn) || turn < 1) {
    throw new RangeError("Turn must be a positive integer.");
  }
  return Math.max(
    TURN_TIMING_RULES.minBeatDurationMs,
    TURN_TIMING_RULES.initialBeatDurationMs - (turn - 1) * TURN_TIMING_RULES.beatDurationDecayPerTurnMs
  );
}
