import type { ResolvedEvent, TurnWindow } from '@dragonball/shared';
import { createCpuPolicyAction, createTurnWindow, resolveTurn, type FighterState } from '@dragonball/game-core';
import type { PlayerAction } from '@dragonball/shared';

type MatchStartedPayload = { matchId: string };
type MatchEndedPayload = { winner: string; roundWins?: { p1: number; p2: number } };

type SocketEventMap = {
  'match:started': MatchStartedPayload;
  'match:turn-window': TurnWindow;
  'match:resolved': ResolvedEvent;
  'match:ended': MatchEndedPayload;
};

type EventName = keyof SocketEventMap;
type Handler<T> = (payload: T) => void;

type SocketLike = {
  on: <T extends EventName>(event: T, handler: Handler<SocketEventMap[T]>) => void;
  off: <T extends EventName>(event: T) => void;
  emit: (event: string, payload?: unknown) => void;
};

type PendingEmit = { event: string; payload?: unknown };

type LocalMatchState = {
  matchId: string;
  turnIndex: number;
  p1: FighterState;
  p2: FighterState;
  roundWins: { p1: number; p2: number };
  p1Input: { beat1?: PlayerAction; beat2?: PlayerAction };
  window: TurnWindow;
  timerId?: number;
};

declare global {
  interface Window {
    io?: (url: string, options?: { autoConnect?: boolean }) => {
      on: (event: string, handler: (payload: unknown) => void) => void;
      emit: (event: string, payload?: unknown) => void;
    };
  }
}

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const SOCKET_IO_SCRIPT_URL = `${SOCKET_SERVER_URL}/socket.io/socket.io.js`;

const handlers: { [K in EventName]: Array<Handler<SocketEventMap[K]>> } = {
  'match:started': [],
  'match:turn-window': [],
  'match:resolved': [],
  'match:ended': []
};

let realSocket: ReturnType<NonNullable<Window['io']>> | null = null;
let useLocalFallback = false;
let localMatch: LocalMatchState | null = null;
let scriptLoadingPromise: Promise<void> | null = null;
const pendingEmits: PendingEmit[] = [];

function emitToHandlers<T extends EventName>(event: T, payload: SocketEventMap[T]) {
  handlers[event].forEach((handler) => {
    handler(payload);
  });
}

function clearLocalTimer() {
  if (localMatch?.timerId) {
    window.clearTimeout(localMatch.timerId);
  }
}

function runLocalTurn(match: LocalMatchState) {
  const turnWindow = createTurnWindow(match.turnIndex, Date.now());
  match.window = turnWindow;
  emitToHandlers('match:turn-window', { ...turnWindow, roundWins: match.roundWins });

  clearLocalTimer();
  match.timerId = window.setTimeout(() => {
    if (!localMatch || localMatch.matchId !== match.matchId) return;

    const p2Input = {
      beat1: createCpuPolicyAction(match.turnIndex),
      beat2: createCpuPolicyAction(match.turnIndex + 1)
    };

    const resolved = resolveTurn(
      match.turnIndex,
      { beat1: match.p1Input.beat1 ?? 'NONE', beat2: match.p1Input.beat2 ?? 'NONE' },
      p2Input,
      match.p1,
      match.p2,
      match.roundWins
    );

    match.p1 = resolved.p1After;
    match.p2 = resolved.p2After;
    match.roundWins = resolved.roundWins;
    emitToHandlers('match:resolved', resolved.event);

    if (match.roundWins.p1 >= 3 || match.roundWins.p2 >= 3 || match.turnIndex >= 11) {
      emitToHandlers('match:ended', {
        winner: match.roundWins.p1 === match.roundWins.p2 ? 'draw' : match.roundWins.p1 > match.roundWins.p2 ? 'player' : 'cpu',
        roundWins: match.roundWins
      });
      localMatch = null;
      return;
    }

    match.turnIndex += 1;
    match.p1Input = {};
    runLocalTurn(match);
  }, Math.max(0, turnWindow.lockInTs - Date.now()));
}

function handleLocalEmit(event: string, payload?: unknown) {
  if (event === 'match:start-vs-cpu') {
    const match: LocalMatchState = {
      matchId: `local-${Date.now()}`,
      turnIndex: 0,
      p1: { hp: 100, ki: 0 },
      p2: { hp: 100, ki: 0 },
      roundWins: { p1: 0, p2: 0 },
      p1Input: {},
      window: createTurnWindow(0, Date.now())
    };
    localMatch = match;
    emitToHandlers('match:started', { matchId: match.matchId });
    runLocalTurn(match);
    return;
  }

  if (event === 'match:submit-input' && localMatch && payload && typeof payload === 'object') {
    const input = payload as { matchId?: string; beat?: 1 | 2; action?: PlayerAction; turnIndex?: number };
    if (input.matchId !== localMatch.matchId || input.turnIndex !== localMatch.turnIndex) return;
    if (!input.beat || !input.action) return;
    if (Date.now() >= localMatch.window.inputCloseTs) return;

    if (input.beat === 1) localMatch.p1Input.beat1 = input.action;
    if (input.beat === 2) localMatch.p1Input.beat2 = input.action;
  }
}

function flushPendingEmits() {
  if (!realSocket || pendingEmits.length === 0) return;
  while (pendingEmits.length > 0) {
    const queued = pendingEmits.shift();
    if (!queued) continue;
    realSocket.emit(queued.event, queued.payload);
  }
}

function loadSocketIoScript(): Promise<void> {
  if (window.io) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SOCKET_IO_SCRIPT_URL}"]`);
    if (existing) {
      if (window.io) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Socket.IO client script.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = SOCKET_IO_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Socket.IO client script.'));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

function bindEventHandlers<T extends EventName>(event: T) {
  if (!realSocket) return;

  handlers[event].forEach((handler) => {
    realSocket!.on(event, (payload) => {
      handler(payload as SocketEventMap[T]);
    });
  });
}

function bindBufferedHandlers() {
  bindEventHandlers('match:started');
  bindEventHandlers('match:turn-window');
  bindEventHandlers('match:resolved');
  bindEventHandlers('match:ended');
}

async function initializeSocket() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  try {
    await loadSocketIoScript();

    if (!window.io) {
      throw new Error('Socket.IO global is unavailable after script load.');
    }

    realSocket = window.io(SOCKET_SERVER_URL, { autoConnect: true });
    realSocket.on('connect', () => {
      flushPendingEmits();
    });
    bindBufferedHandlers();
    flushPendingEmits();
  } catch (error) {
    console.warn('[socket] running in offline mode:', error);
    useLocalFallback = true;
  }
}

void initializeSocket();

export const socket: SocketLike = {
  on: (event, handler) => {
    handlers[event].push(handler);

    if (realSocket) {
      realSocket.on(event, (payload) => {
        handler(payload as SocketEventMap[typeof event]);
      });
    }
  },
  off: (event) => {
    handlers[event] = [];
  },
  emit: (event, payload) => {
    if (useLocalFallback) {
      handleLocalEmit(event, payload);
      return;
    }

    if (!realSocket) {
      pendingEmits.push({ event, payload });
      return;
    }

    realSocket.emit(event, payload);
  }
};
