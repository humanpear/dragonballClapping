import { create } from 'zustand';
import { ACTIONS, Action, actionCost, evaluateActions } from '../lib/gameRules';

export type Screen = 'home' | 'mode' | 'battle' | 'result';
export type BattleMode = 'quick' | 'rank' | 'cpu';

const BEAT_SLOTS = 4;
const WINS_TO_MATCH = 3;

interface FighterState {
  name: string;
  ki: number;
  roundWins: number;
  lastAction: Action;
}

interface GameState {
  screen: Screen;
  mode: BattleMode;
  player: FighterState;
  enemy: FighterState;
  beat: number;
  beatDurationMs: number;
  actionQueue: Action[];
  locked: boolean;
  message: string;
  turn: number;
  winnerName: string | null;
  startMode: (mode: BattleMode) => void;
  backToMode: () => void;
  enqueueAction: (action: Action) => void;
  nextBeat: () => void;
  resetMatch: () => void;
}

function pickCpuAction(ki: number): Action {
  const options: Action[] = ['charge', 'guard', 'attack', 'teleport'];
  if (ki >= 2) options.push('beam');
  return options[Math.floor(Math.random() * options.length)];
}

function applyKi(ki: number, action: Action): number {
  if (action === 'charge') return Math.min(ki + 1, 3);
  return Math.max(0, ki - actionCost(action));
}

function playableActions(ki: number): Action[] {
  return ACTIONS.filter((action) => actionCost(action) <= ki);
}

const initialFighter = (name: string): FighterState => ({
  name,
  ki: 1,
  roundWins: 0,
  lastAction: 'guard'
});

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'home',
  mode: 'quick',
  player: initialFighter('Player1'),
  enemy: initialFighter('Player2'),
  beat: 1,
  beatDurationMs: 1000,
  actionQueue: [],
  locked: false,
  message: 'Beat1 준비',
  turn: 1,
  winnerName: null,
  startMode: (mode) =>
    set({
      mode,
      screen: 'battle',
      player: initialFighter('Player1'),
      enemy: initialFighter(mode === 'cpu' ? 'CPU' : 'Player2'),
      beat: 1,
      beatDurationMs: 1000,
      actionQueue: [],
      locked: false,
      message: 'Beat1 준비',
      turn: 1,
      winnerName: null
    }),
  backToMode: () => set({ screen: 'mode' }),
  enqueueAction: (action) => {
    const state = get();
    if (state.locked || state.beat > 2 || state.actionQueue.length >= 2) return;
    const neededKi = actionCost(action);
    if (state.player.ki < neededKi) {
      set({ message: '기가 부족합니다!' });
      return;
    }
    const nextQueue = [...state.actionQueue];
    nextQueue[state.beat - 1] = action;
    set({ actionQueue: nextQueue, message: `Beat${state.beat} 입력 완료` });
  },
  nextBeat: () => {
    const state = get();
    if (state.screen !== 'battle') return;

    if (state.beat < 3) {
      set({ beat: state.beat + 1, message: `Beat${state.beat + 1} 진행 중` });
      return;
    }

    if (state.beat === 3) {
      const playerAction = state.actionQueue[1] ?? state.actionQueue[0] ?? 'guard';
      const enemyAction =
        state.mode === 'cpu'
          ? pickCpuAction(state.enemy.ki)
          : playableActions(state.enemy.ki)[Math.floor(Math.random() * playableActions(state.enemy.ki).length)];

      const outcome = evaluateActions(playerAction, enemyAction);
      const nextPlayerKi = applyKi(state.player.ki, playerAction);
      const nextEnemyKi = applyKi(state.enemy.ki, enemyAction);

      let playerWins = state.player.roundWins;
      let enemyWins = state.enemy.roundWins;
      let message = '무효';
      if (outcome === 'A_WIN') {
        playerWins += 1;
        message = '히트! 플레이어 승리';
      }
      if (outcome === 'B_WIN') {
        enemyWins += 1;
        message = '피격! 상대 승리';
      }
      if (outcome === 'NO_HIT') {
        message = '가드/회피 성공';
      }

      const turn = state.turn + 1;
      const beatDurationMs = Math.max(500, 1000 - (turn - 1) * 35);
      const winnerName =
        playerWins >= WINS_TO_MATCH ? state.player.name : enemyWins >= WINS_TO_MATCH ? state.enemy.name : null;

      set({
        player: { ...state.player, ki: nextPlayerKi, roundWins: playerWins, lastAction: playerAction },
        enemy: { ...state.enemy, ki: nextEnemyKi, roundWins: enemyWins, lastAction: enemyAction },
        beat: 4,
        locked: true,
        message,
        winnerName,
        turn,
        beatDurationMs
      });
      return;
    }

    if (state.winnerName) {
      set({ screen: 'result' });
      return;
    }

    set({
      beat: 1,
      actionQueue: [],
      locked: false,
      message: '다음 턴 준비'
    });
  },
  resetMatch: () => {
    const mode = get().mode;
    get().startMode(mode);
  }
}));
