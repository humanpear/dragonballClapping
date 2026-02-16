import { describe, expect, it } from 'vitest';
import { evaluateActions } from './gameRules';

describe('action matrix', () => {
  it('beam beats attack', () => {
    expect(evaluateActions('beam', 'attack')).toBe('A_WIN');
  });

  it('guard neutralizes attack', () => {
    expect(evaluateActions('guard', 'attack')).toBe('NO_HIT');
  });

  it('charge loses to beam', () => {
    expect(evaluateActions('charge', 'beam')).toBe('B_WIN');
  });
});
