import { create } from 'zustand';
import type { PlayerAction, ResolvedEvent, TurnWindow, AuthMode, AuthProvider } from '@dragonball/shared';
import { socket } from '../lib/socket';

type Screen = 'login' | 'lobby' | 'battle' | 'result';

type AuthSession = {
  provider: AuthProvider;
  accessToken: string;
  issuedAt: number;
};

type Store = {
  screen: Screen;
  authMode: AuthMode;
  provider?: AuthProvider;
  authSession?: AuthSession;
  matchId?: string;
  turnWindow?: TurnWindow;
  turnIndex: number;
  player: { hp: number; ki: number };
  cpu: { hp: number; ki: number };
  lastResolved?: ResolvedEvent;
  winner?: string;
  connect: () => void;
  loginMock: (provider: AuthProvider) => void;
  loginOauthSuccess: (provider: AuthProvider, accessToken: string) => void;
  logout: () => void;
  startVsCpu: () => void;
  submitInput: (beat: 1 | 2, action: PlayerAction) => void;
  rematch: () => void;
  backToLobby: () => void;
};

export const useGameStore = create<Store>((set, get) => ({
  screen: 'login',
  authMode: 'mock',
  turnIndex: 0,
  player: { hp: 100, ki: 0 },
  cpu: { hp: 100, ki: 0 },
  connect: () => {
    socket.on('match:started', ({ matchId }) => set({ matchId, screen: 'battle', turnIndex: 0, player: { hp: 100, ki: 0 }, cpu: { hp: 100, ki: 0 } }));
    socket.on('match:turn-window', (window: TurnWindow) => set({ turnWindow: window, turnIndex: window.turnIndex }));
    socket.on('match:resolved', (event: ResolvedEvent) => set({ lastResolved: event, player: { hp: event.hpAfter.p1, ki: event.kiAfter.p1 }, cpu: { hp: event.hpAfter.p2, ki: event.kiAfter.p2 } }));
    socket.on('match:ended', ({ winner }) => set({ winner, screen: 'result' }));
  },
  loginMock: (provider) => set({ provider, authMode: 'mock', screen: 'lobby' }),
  loginOauthSuccess: (provider, accessToken) =>
    set({
      provider,
      authMode: 'oauth',
      authSession: { provider, accessToken, issuedAt: Date.now() },
      screen: 'lobby'
    }),
  logout: () => set({ provider: undefined, authSession: undefined, authMode: 'mock', screen: 'login' }),
  startVsCpu: () => socket.emit('match:start-vs-cpu'),
  submitInput: (beat, action) => {
    const { matchId, turnIndex } = get();
    if (!matchId) return;
    socket.emit('match:submit-input', { matchId, beat, action, turnIndex });
  },
  rematch: () => {
    set({ winner: undefined, screen: 'lobby' });
    socket.emit('match:start-vs-cpu');
  },
  backToLobby: () => set({ screen: 'lobby', winner: undefined })
}));
