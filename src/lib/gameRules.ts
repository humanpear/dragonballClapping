export const ACTIONS = ['charge', 'guard', 'attack', 'beam', 'teleport'] as const;

export type Action = (typeof ACTIONS)[number];
export type Outcome = 'A_WIN' | 'B_WIN' | 'DRAW' | 'NO_HIT';

const outcomeMatrix: Record<Action, Record<Action, Outcome>> = {
  charge: {
    charge: 'DRAW',
    guard: 'DRAW',
    attack: 'B_WIN',
    beam: 'B_WIN',
    teleport: 'DRAW'
  },
  guard: {
    charge: 'DRAW',
    guard: 'DRAW',
    attack: 'NO_HIT',
    beam: 'B_WIN',
    teleport: 'DRAW'
  },
  attack: {
    charge: 'A_WIN',
    guard: 'NO_HIT',
    attack: 'NO_HIT',
    beam: 'B_WIN',
    teleport: 'NO_HIT'
  },
  beam: {
    charge: 'A_WIN',
    guard: 'A_WIN',
    attack: 'A_WIN',
    beam: 'NO_HIT',
    teleport: 'NO_HIT'
  },
  teleport: {
    charge: 'DRAW',
    guard: 'DRAW',
    attack: 'DRAW',
    beam: 'NO_HIT',
    teleport: 'DRAW'
  }
};

export function evaluateActions(playerAction: Action, enemyAction: Action): Outcome {
  return outcomeMatrix[playerAction][enemyAction];
}

export function actionCost(action: Action): number {
  if (action === 'beam') return 2;
  if (action === 'attack' || action === 'teleport') return 1;
  return 0;
}
