import type { PlayerAction, ResolvedEvent, TurnWindow } from '@dragonball/shared';
import { gameConfig, getBeatDuration } from './config/gameConfig';
import { judgementMatrix } from './config/judgementMatrix';

export type FighterState = { hp: number; ki: number };
export type TurnInput = { beat1: PlayerAction; beat2: PlayerAction };

const normalizeAction = (action: PlayerAction, state: FighterState): PlayerAction => {
  if (action === 'KAMEHAMEHA' && state.ki < 2) return 'NONE';
  if (action === 'TELEPORT' && state.ki < 1) return 'NONE';
  return action;
};

export const createTurnWindow = (turnIndex: number, startTs: number): TurnWindow => {
  const beatDurationMs = getBeatDuration(turnIndex);
  return {
    turnIndex,
    turnStartTs: startTs,
    inputCloseTs: startTs + beatDurationMs * 2,
    lockInTs: startTs + beatDurationMs * 3,
    beatDurationMs
  };
};

export const resolveTurn = (
  turnIndex: number,
  p1Input: TurnInput,
  p2Input: TurnInput,
  p1State: FighterState,
  p2State: FighterState,
  roundWins: { p1: number; p2: number }
): { event: ResolvedEvent; p1After: FighterState; p2After: FighterState; roundWins: { p1: number; p2: number } } => {
  const p1b1 = normalizeAction(p1Input.beat1, p1State);
  const p1b2 = normalizeAction(p1Input.beat2, p1State);
  const p2b1 = normalizeAction(p2Input.beat1, p2State);
  const p2b2 = normalizeAction(p2Input.beat2, p2State);

  const o1 = judgementMatrix[p1b1][p2b1];
  const o2 = judgementMatrix[p1b2][p2b2];
  const r1 = judgementMatrix[p2b1][p1b1];
  const r2 = judgementMatrix[p2b2][p1b2];

  const p1Hp = Math.max(0, p1State.hp + o1.deltaHp + o2.deltaHp);
  const p2Hp = Math.max(0, p2State.hp + r1.deltaHp + r2.deltaHp);
  const p1Ki = Math.max(0, p1State.ki + o1.deltaKiSelf + o2.deltaKiSelf);
  const p2Ki = Math.max(0, p2State.ki + r1.deltaKiSelf + r2.deltaKiSelf);

  const p1Damage = p1State.hp - p1Hp;
  const p2Damage = p2State.hp - p2Hp;
  const roundWinner: 'p1' | 'p2' | 'draw' = p1Damage === p2Damage ? 'draw' : p1Damage < p2Damage ? 'p1' : 'p2';
  const nextRoundWins = { ...roundWins };
  if (roundWinner === 'p1') nextRoundWins.p1 += 1;
  if (roundWinner === 'p2') nextRoundWins.p2 += 1;

  return {
    event: {
      turnIndex,
      vfxKey: `${o1.vfxKey}+${o2.vfxKey}`,
      sfxKey: `${o1.sfxKey}+${o2.sfxKey}`,
      delta: { p1: p1Damage, p2: p2Damage },
      kiAfter: { p1: p1Ki, p2: p2Ki },
      hpAfter: { p1: p1Hp, p2: p2Hp },
      summary: `${o1.summary} / ${o2.summary}`,
      roundWinner,
      roundWins: nextRoundWins
    },
    p1After: { hp: p1Hp, ki: p1Ki },
    p2After: { hp: p2Hp, ki: p2Ki },
    roundWins: nextRoundWins
  };
};

export const createCpuPolicyAction = (turnIndex: number): PlayerAction => {
  const cycle: PlayerAction[] = ['NONE', 'CHARGE', 'BLOCK', 'ATTACK', 'TELEPORT', 'KAMEHAMEHA'];
  return cycle[turnIndex % cycle.length];
};

export { gameConfig };
