export const gameConfig = {
  beatsPerTurn: 4,
  inputBeats: [1, 2],
  lockInBeat: 3,
  minBeatDurationMs: 420,
  beatDurationByTurn: [1100, 1050, 1000, 940, 880, 820, 760, 700, 640, 580, 520]
} as const;

export const getBeatDuration = (turnIndex: number) => {
  const value = gameConfig.beatDurationByTurn[Math.min(turnIndex, gameConfig.beatDurationByTurn.length - 1)];
  return Math.max(value, gameConfig.minBeatDurationMs);
};
