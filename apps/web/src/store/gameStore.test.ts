import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from './gameStore';
import { socket } from '../lib/socket';

const baseTurnWindow = {
  turnIndex: 0,
  turnStartTs: Date.now() - 100,
  inputCloseTs: Date.now() + 5_000,
  lockInTs: Date.now() + 7_000,
  beatDurationMs: 1000
} as const;

describe('gameStore submitInput guards', () => {
  beforeEach(() => {
    useGameStore.setState({
      screen: 'battle',
      authMode: 'mock',
      turnIndex: 0,
      selectedInputs: { turnIndex: 0 },
      player: { hp: 100, ki: 0 },
      cpu: { hp: 100, ki: 0 },
      matchId: 'm1',
      turnWindow: { ...baseTurnWindow, inputCloseTs: Date.now() + 5_000 }
    });
    vi.restoreAllMocks();
  });

  it('emits and stores selected beat on first valid input', () => {
    const emitSpy = vi.spyOn(socket, 'emit').mockImplementation(() => {});

    useGameStore.getState().submitInput(1, 'ATTACK');

    expect(emitSpy).toHaveBeenCalledWith('match:submit-input', {
      matchId: 'm1',
      beat: 1,
      action: 'ATTACK',
      turnIndex: 0
    });
    expect(useGameStore.getState().selectedInputs).toEqual({ turnIndex: 0, beat1: 'ATTACK', beat2: undefined });
  });

  it('does not emit duplicated beat input in same turn', () => {
    const emitSpy = vi.spyOn(socket, 'emit').mockImplementation(() => {});

    useGameStore.getState().submitInput(1, 'ATTACK');
    useGameStore.getState().submitInput(1, 'BLOCK');

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(useGameStore.getState().selectedInputs.beat1).toBe('ATTACK');
  });

  it('does not emit when input window is closed', () => {
    useGameStore.setState({
      turnWindow: { ...baseTurnWindow, inputCloseTs: Date.now() - 1 }
    });
    const emitSpy = vi.spyOn(socket, 'emit').mockImplementation(() => {});

    useGameStore.getState().submitInput(2, 'CHARGE');

    expect(emitSpy).not.toHaveBeenCalled();
    expect(useGameStore.getState().selectedInputs.beat2).toBeUndefined();
  });
});

describe('gameStore startVsCpu', () => {
  beforeEach(() => {
    useGameStore.setState({
      screen: 'lobby',
      authMode: 'mock',
      turnIndex: 3,
      selectedInputs: { turnIndex: 3, beat1: 'ATTACK' },
      player: { hp: 42, ki: 5 },
      cpu: { hp: 10, ki: 9 },
      winner: 'cpu',
      lastResolved: undefined,
      turnWindow: undefined
    });
    vi.restoreAllMocks();
  });

  it('moves to battle immediately and requests cpu match start', () => {
    const emitSpy = vi.spyOn(socket, 'emit').mockImplementation(() => {});

    useGameStore.getState().startVsCpu();

    expect(useGameStore.getState().screen).toBe('battle');
    expect(useGameStore.getState().player).toEqual({ hp: 100, ki: 0 });
    expect(useGameStore.getState().cpu).toEqual({ hp: 100, ki: 0 });
    expect(useGameStore.getState().selectedInputs).toEqual({ turnIndex: 0 });
    expect(emitSpy).toHaveBeenCalledWith('match:start-vs-cpu');
  });
});
