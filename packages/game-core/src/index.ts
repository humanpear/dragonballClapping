import type { PlayerAction, ResolvedEvent, TurnWindow } from '@dragonball/shared';
import { gameConfig, getBeatDuration } from './config/gameConfig';
import { judgementMatrix } from './config/judgementMatrix';

export type FighterState = { hp: number; ki: number };
export type TurnInput = { beat1: PlayerAction; beat2: PlayerAction };

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
  p2State: FighterState
): { event: ResolvedEvent; p1After: FighterState; p2After: FighterState } => {
  const o1 = judgementMatrix[p1Input.beat1][p2Input.beat1];
  const o2 = judgementMatrix[p1Input.beat2][p2Input.beat2];

  const p1Hp = Math.max(0, p1State.hp + o1.deltaHp + o2.deltaHp);
  const p2Hp = Math.max(0, p2State.hp + judgementMatrix[p2Input.beat1][p1Input.beat1].deltaHp + judgementMatrix[p2Input.beat2][p1Input.beat2].deltaHp);
  const p1Ki = Math.max(0, p1State.ki + o1.deltaKiSelf + o2.deltaKiSelf);
  const p2Ki = Math.max(
    0,
    p2State.ki + judgementMatrix[p2Input.beat1][p1Input.beat1].deltaKiSelf + judgementMatrix[p2Input.beat2][p1Input.beat2].deltaKiSelf
  );

  return {
    event: {
      turnIndex,
      vfxKey: `${o1.vfxKey}+${o2.vfxKey}`,
      sfxKey: `${o1.sfxKey}+${o2.sfxKey}`,
      delta: { p1: p1State.hp - p1Hp, p2: p2State.hp - p2Hp },
      kiAfter: { p1: p1Ki, p2: p2Ki },
      hpAfter: { p1: p1Hp, p2: p2Hp },
      summary: `${o1.summary} / ${o2.summary}`
    },
    p1After: { hp: p1Hp, ki: p1Ki },
    p2After: { hp: p2Hp, ki: p2Ki }
  };
};

export const createCpuPolicyAction = (turnIndex: number): PlayerAction => {
  const cycle: PlayerAction[] = ['CHARGE', 'BLOCK', 'ATTACK'];
  return cycle[turnIndex % cycle.length];
};

export { gameConfig };
