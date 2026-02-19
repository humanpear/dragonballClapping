import { useEffect, useMemo, useState } from 'react';
import type { PlayerAction } from '@dragonball/shared';
import { useGameStore } from '../store/gameStore';

const actionButtons: Array<{ action: PlayerAction; label: string; side: 'left' | 'right'; hint: string }> = [
  { action: 'CHARGE', label: '기', side: 'left', hint: 'KI +1' },
  { action: 'ATTACK', label: '공격', side: 'left', hint: '기본기' },
  { action: 'KAMEHAMEHA', label: '에네르기파', side: 'left', hint: 'KI -2' },
  { action: 'BLOCK', label: '막기', side: 'right', hint: '공격 무효화' },
  { action: 'TELEPORT', label: '순간이동', side: 'right', hint: 'KI -1' }
];

const keyMap: Record<string, { beat: 1 | 2; action: PlayerAction }> = {
  '1': { beat: 1, action: 'CHARGE' },
  '2': { beat: 1, action: 'ATTACK' },
  '3': { beat: 1, action: 'KAMEHAMEHA' },
  '4': { beat: 1, action: 'BLOCK' },
  '5': { beat: 1, action: 'TELEPORT' },
  q: { beat: 2, action: 'CHARGE' },
  w: { beat: 2, action: 'ATTACK' },
  e: { beat: 2, action: 'KAMEHAMEHA' },
  r: { beat: 2, action: 'BLOCK' },
  t: { beat: 2, action: 'TELEPORT' }
};

function ScoreDots({ wins }: { wins: number }) {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`h-4 w-4 rounded-full border-2 border-black ${i < wins ? 'bg-orange-400' : 'bg-white/60'}`} />
      ))}
    </div>
  );
}

function PlayerCard({ name, hp, ki, wins, align }: { name: string; hp: number; ki: number; wins: number; align: 'left' | 'right' }) {
  return (
    <div className={`rounded-2xl bg-white/80 p-3 shadow ${align === 'right' ? 'text-right' : ''}`}>
      <p className="text-sm font-semibold">{name}</p>
      <p className="text-xs">HP {hp}</p>
      <p className="text-xs">기 {ki}</p>
      <div className={`mt-2 flex ${align === 'right' ? 'justify-end' : ''}`}>
        <ScoreDots wins={wins} />
      </div>
    </div>
  );
}

export function BattleScreen() {
  const player = useGameStore((s) => s.player);
  const cpu = useGameStore((s) => s.cpu);
  const submit = useGameStore((s) => s.submitInput);
  const turnWindow = useGameStore((s) => s.turnWindow);
  const turnIndex = useGameStore((s) => s.turnIndex);
  const lastResolved = useGameStore((s) => s.lastResolved);
  const roundWins = useGameStore((s) => s.roundWins);
  const selectedInputs = useGameStore((s) => s.selectedInputs);
  const [nowTs, setNowTs] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNowTs(Date.now()), 100);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      const hotkey = keyMap[e.key.toLowerCase()];
      if (!hotkey) return;
      submit(hotkey.beat, hotkey.action);
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [submit]);

  const inputPhase = useMemo(() => {
    if (!turnWindow) return '대기';
    if (nowTs < turnWindow.inputCloseTs) return 'Beat1~2 입력 중';
    if (nowTs < turnWindow.lockInTs) return 'Beat3 잠금';
    return 'Beat4 판정';
  }, [nowTs, turnWindow]);

  const canBeat1 = !!turnWindow && nowTs < turnWindow.inputCloseTs && !selectedInputs.beat1;
  const canBeat2 = !!turnWindow && nowTs < turnWindow.inputCloseTs && !selectedInputs.beat2;

  return (
    <div className="battle-bg min-h-screen px-3 py-4 text-slate-900">
      <div className="mx-auto flex h-full w-full max-w-md flex-col gap-3">
        <div className="rounded-2xl bg-white/80 px-3 py-2 text-center">
          <p className="text-xs font-semibold">라운드 스코어</p>
          <div className="mt-1 flex items-center justify-center gap-4">
            <ScoreDots wins={roundWins.p1} />
            <span className="text-sm font-bold">VS</span>
            <ScoreDots wins={roundWins.p2} />
          </div>
          <p className="mt-1 text-xs">턴 {turnIndex + 1} · {inputPhase}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <PlayerCard name="Player" hp={player.hp} ki={player.ki} wins={roundWins.p1} align="left" />
          <PlayerCard name="CPU" hp={cpu.hp} ki={cpu.ki} wins={roundWins.p2} align="right" />
        </div>

        <div className="flex-1 rounded-2xl bg-black/20 p-3 text-center text-white">
          <p className="text-sm font-bold">판정 영역</p>
          <p className="mt-2 text-sm">{lastResolved?.summary ?? '행동을 입력하세요'}</p>
          <p className="mt-2 text-xs opacity-90">Beat1: {selectedInputs.beat1 ?? '대기'} / Beat2: {selectedInputs.beat2 ?? '대기'}</p>
        </div>

        <div className="rounded-2xl bg-white/85 p-3">
          <p className="mb-2 text-center text-xs font-semibold">키보드: Beat1(1~5), Beat2(Q~T)</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              {actionButtons
                .filter((b) => b.side === 'left')
                .map((button) => (
                  <button key={button.action} className="action-btn action-btn-left" onClick={() => submit(canBeat1 ? 1 : 2, button.action)} disabled={!canBeat1 && !canBeat2}>
                    <span>{button.label}</span>
                    <small>{button.hint}</small>
                  </button>
                ))}
            </div>
            <div className="flex flex-col gap-2">
              {actionButtons
                .filter((b) => b.side === 'right')
                .map((button) => (
                  <button key={button.action} className="action-btn action-btn-right" onClick={() => submit(canBeat1 ? 1 : 2, button.action)} disabled={!canBeat1 && !canBeat2}>
                    <span>{button.label}</span>
                    <small>{button.hint}</small>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
