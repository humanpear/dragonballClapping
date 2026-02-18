import type { PlayerAction } from '@dragonball/shared';

type Outcome = {
  deltaHp: number;
  deltaKiSelf: number;
  deltaKiOpponent: number;
  vfxKey: string;
  sfxKey: string;
  summary: string;
};

export const judgementMatrix: Record<PlayerAction, Record<PlayerAction, Outcome>> = {
  ATTACK: {
    ATTACK: { deltaHp: -8, deltaKiSelf: -1, deltaKiOpponent: -1, vfxKey: 'clash', sfxKey: 'impact', summary: '양측 충돌' },
    BLOCK: { deltaHp: -2, deltaKiSelf: -1, deltaKiOpponent: 1, vfxKey: 'guard', sfxKey: 'guard', summary: '공격이 막힘' },
    CHARGE: { deltaHp: -12, deltaKiSelf: 0, deltaKiOpponent: -2, vfxKey: 'hit', sfxKey: 'hit-heavy', summary: '차징 중 피격' }
  },
  BLOCK: {
    ATTACK: { deltaHp: 0, deltaKiSelf: 1, deltaKiOpponent: -1, vfxKey: 'parry', sfxKey: 'guard', summary: '방어 성공' },
    BLOCK: { deltaHp: 0, deltaKiSelf: 1, deltaKiOpponent: 1, vfxKey: 'idle', sfxKey: 'none', summary: '서로 대치' },
    CHARGE: { deltaHp: 0, deltaKiSelf: 0, deltaKiOpponent: 2, vfxKey: 'read', sfxKey: 'charge', summary: '상대가 기를 모음' }
  },
  CHARGE: {
    ATTACK: { deltaHp: -14, deltaKiSelf: -2, deltaKiOpponent: 0, vfxKey: 'punished', sfxKey: 'hit-heavy', summary: '차징이 끊김' },
    BLOCK: { deltaHp: 0, deltaKiSelf: 2, deltaKiOpponent: 0, vfxKey: 'charge', sfxKey: 'charge', summary: '안전하게 차징' },
    CHARGE: { deltaHp: 0, deltaKiSelf: 3, deltaKiOpponent: 3, vfxKey: 'dual-charge', sfxKey: 'charge', summary: '서로 차징' }
  }
};
