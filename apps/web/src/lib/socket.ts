import type { ResolvedEvent, TurnWindow } from '@dragonball/shared';

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
let scriptLoadingPromise: Promise<void> | null = null;
const pendingEmits: PendingEmit[] = [];

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
    if (!realSocket) {
      pendingEmits.push({ event, payload });
      return;
    }

    realSocket.emit(event, payload);
  }
};
