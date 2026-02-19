import type { PlayerAction } from '@dragonball/shared';

type Outcome = {
  deltaHp: number;
  deltaKiSelf: number;
  vfxKey: string;
  sfxKey: string;
  summary: string;
};

const NEUTRAL: Outcome = { deltaHp: 0, deltaKiSelf: 0, vfxKey: 'neutral', sfxKey: 'none', summary: '대치' };
const HIT_BY_ATTACK: Outcome = { deltaHp: -16, deltaKiSelf: 0, vfxKey: 'hit', sfxKey: 'impact', summary: '공격에 무방비 피격' };
const HIT_BY_BEAM: Outcome = { deltaHp: -16, deltaKiSelf: 0, vfxKey: 'beam-hit', sfxKey: 'beam', summary: '에네르기파에 피격' };
const ATTACK_NULLIFIED: Outcome = { deltaHp: 0, deltaKiSelf: 0, vfxKey: 'guard', sfxKey: 'guard', summary: '공격 무효' };

export const judgementMatrix: Record<PlayerAction, Record<PlayerAction, Outcome>> = {
  NONE: {
    NONE: { ...NEUTRAL, summary: '서로 아무 행동 없음' },
    CHARGE: { ...NEUTRAL, summary: '상대가 기를 모음' },
    BLOCK: { ...NEUTRAL, summary: '상대가 방어 자세' },
    ATTACK: HIT_BY_ATTACK,
    KAMEHAMEHA: HIT_BY_BEAM,
    TELEPORT: { ...NEUTRAL, summary: '상대가 순간이동' }
  },
  CHARGE: {
    NONE: { ...NEUTRAL, deltaKiSelf: 1, vfxKey: 'charge', sfxKey: 'charge', summary: '기를 모음' },
    CHARGE: { ...NEUTRAL, deltaKiSelf: 1, vfxKey: 'charge', sfxKey: 'charge', summary: '기를 모음' },
    BLOCK: { ...NEUTRAL, deltaKiSelf: 1, vfxKey: 'charge', sfxKey: 'charge', summary: '기를 모음' },
    ATTACK: HIT_BY_ATTACK,
    KAMEHAMEHA: HIT_BY_BEAM,
    TELEPORT: { ...NEUTRAL, deltaKiSelf: 1, vfxKey: 'charge', sfxKey: 'charge', summary: '기를 모음' }
  },
  BLOCK: {
    NONE: { ...NEUTRAL, summary: '방어 유지' },
    CHARGE: { ...NEUTRAL, summary: '상대가 기를 모음' },
    BLOCK: { ...NEUTRAL, summary: '서로 대치' },
    ATTACK: ATTACK_NULLIFIED,
    KAMEHAMEHA: HIT_BY_BEAM,
    TELEPORT: { ...NEUTRAL, summary: '상대가 순간이동' }
  },
  ATTACK: {
    NONE: { ...NEUTRAL, vfxKey: 'hit', sfxKey: 'impact', summary: '공격 적중' },
    CHARGE: { ...NEUTRAL, vfxKey: 'hit', sfxKey: 'impact', summary: '차징 중인 상대를 타격' },
    BLOCK: ATTACK_NULLIFIED,
    ATTACK: ATTACK_NULLIFIED,
    KAMEHAMEHA: HIT_BY_BEAM,
    TELEPORT: ATTACK_NULLIFIED
  },
  KAMEHAMEHA: {
    NONE: { deltaHp: 0, deltaKiSelf: -2, vfxKey: 'beam', sfxKey: 'beam', summary: '에네르기파 적중' },
    CHARGE: { deltaHp: 0, deltaKiSelf: -2, vfxKey: 'beam', sfxKey: 'beam', summary: '에네르기파 적중' },
    BLOCK: { deltaHp: 0, deltaKiSelf: -2, vfxKey: 'beam-break', sfxKey: 'beam', summary: '막기를 관통' },
    ATTACK: { deltaHp: 0, deltaKiSelf: -2, vfxKey: 'beam-counter', sfxKey: 'beam', summary: '공격을 제압' },
    KAMEHAMEHA: { deltaHp: 0, deltaKiSelf: -2, vfxKey: 'beam-clash', sfxKey: 'beam', summary: '에네르기파 충돌' },
    TELEPORT: { deltaHp: 0, deltaKiSelf: -2, vfxKey: 'beam-miss', sfxKey: 'beam', summary: '순간이동으로 회피됨' }
  },
  TELEPORT: {
    NONE: { ...NEUTRAL, deltaKiSelf: -1, vfxKey: 'teleport', sfxKey: 'teleport', summary: '순간이동' },
    CHARGE: { ...NEUTRAL, deltaKiSelf: -1, vfxKey: 'teleport', sfxKey: 'teleport', summary: '순간이동' },
    BLOCK: { ...NEUTRAL, deltaKiSelf: -1, vfxKey: 'teleport', sfxKey: 'teleport', summary: '순간이동' },
    ATTACK: { ...NEUTRAL, deltaKiSelf: -1, vfxKey: 'teleport-dodge', sfxKey: 'teleport', summary: '공격 회피' },
    KAMEHAMEHA: { ...NEUTRAL, deltaKiSelf: -1, vfxKey: 'teleport-dodge', sfxKey: 'teleport', summary: '에네르기파 회피' },
    TELEPORT: { ...NEUTRAL, deltaKiSelf: -1, vfxKey: 'teleport', sfxKey: 'teleport', summary: '서로 순간이동' }
  }
};
