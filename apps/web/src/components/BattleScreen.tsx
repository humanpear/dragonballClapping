import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { PlayerAction } from '@dragonball/shared';
import { useGameStore } from '../store/gameStore';

const actions: PlayerAction[] = ['ATTACK', 'BLOCK', 'CHARGE'];

function ActionBar() {
  const submit = useGameStore((s) => s.submitInput);
  const turnWindow = useGameStore((s) => s.turnWindow);
  const selectedInputs = useGameStore((s) => s.selectedInputs);
  const [nowTs, setNowTs] = useState(Date.now());

  useEffect(() => {
    const interval = globalThis.window.setInterval(() => setNowTs(Date.now()), 100);
    return () => globalThis.window.clearInterval(interval);
  }, []);

  const isInputClosed = turnWindow ? nowTs >= turnWindow.inputCloseTs : false;

  const canSubmitBeat = (beat: 1 | 2) => {
    if (!turnWindow || isInputClosed || selectedInputs.turnIndex !== turnWindow.turnIndex) return false;
    if (beat === 1) return !selectedInputs.beat1;
    return !selectedInputs.beat2;
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {actions.map((action) => (
        <motion.button
          key={action}
          whileTap={{ scale: 0.93 }}
          className="rounded-xl bg-slate-700 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => submit(1, action)}
          disabled={!canSubmitBeat(1)}
        >
          {action} (Beat1)
        </motion.button>
      ))}
      {actions.map((action) => (
        <motion.button
          key={`${action}-2`}
          whileTap={{ scale: 0.93 }}
          className="rounded-xl bg-slate-600 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => submit(2, action)}
          disabled={!canSubmitBeat(2)}
        >
          {action} (Beat2)
        </motion.button>
      ))}
    </div>
  );
}

function PlayerCard({ title, hp, ki }: { title: string; hp: number; ki: number }) {
  return (
    <div className="rounded-2xl bg-slate-800 p-3">
      <h3 className="font-semibold">{title}</h3>
      <p>HP: {hp}</p>
      <p>KI: {ki}</p>
    </div>
  );
}

function RoundScoreBoard() {
  const turnIndex = useGameStore((s) => s.turnIndex);
  const turnWindow = useGameStore((s) => s.turnWindow);
  const selectedInputs = useGameStore((s) => s.selectedInputs);
  const resolved = useGameStore((s) => s.lastResolved);
  const [nowTs, setNowTs] = useState(Date.now());

  useEffect(() => {
    const interval = globalThis.window.setInterval(() => setNowTs(Date.now()), 100);
    return () => globalThis.window.clearInterval(interval);
  }, []);

  const inputPhase = useMemo(() => {
    if (!turnWindow) return { label: '대기', ratio: 0 };
    if (nowTs <= turnWindow.turnStartTs) return { label: '시작 전', ratio: 0 };
    if (nowTs < turnWindow.inputCloseTs) {
      return {
        label: '입력 가능',
        ratio: (nowTs - turnWindow.turnStartTs) / Math.max(turnWindow.inputCloseTs - turnWindow.turnStartTs, 1)
      };
    }
    if (nowTs < turnWindow.lockInTs) return { label: '락인 대기', ratio: 1 };
    return { label: '판정 중', ratio: 1 };
  }, [nowTs, turnWindow]);

  const msLeft = turnWindow ? Math.max(turnWindow.inputCloseTs - nowTs, 0) : 0;

  return (
    <div className="rounded-2xl bg-slate-800 p-3 text-sm">
      <p>Turn: {turnIndex + 1}</p>
      <p>상태: {inputPhase.label}</p>
      <p>입력 마감까지: {(msLeft / 1000).toFixed(1)}s</p>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-700">
        <div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.max(0, Math.min(inputPhase.ratio, 1)) * 100}%` }} />
      </div>
      <p className="mt-2 text-slate-300">Beat1: {selectedInputs.beat1 ?? '미입력'} / Beat2: {selectedInputs.beat2 ?? '미입력'}</p>
      <p className="text-slate-300">최근 판정: {resolved?.summary ?? '대기중'}</p>
    </div>
  );
}

export function BattleScreen() {
  const player = useGameStore((s) => s.player);
  const cpu = useGameStore((s) => s.cpu);
  const submit = useGameStore((s) => s.submitInput);

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'a') submit(1, 'ATTACK');
      if (e.key === 's') submit(1, 'BLOCK');
      if (e.key === 'd') submit(1, 'CHARGE');
      if (e.key === 'j') submit(2, 'ATTACK');
      if (e.key === 'k') submit(2, 'BLOCK');
      if (e.key === 'l') submit(2, 'CHARGE');
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [submit]);

  return (
    <div className="min-h-screen p-4 text-white flex flex-col gap-3 max-w-md mx-auto">
      <PlayerCard title="You" hp={player.hp} ki={player.ki} />
      <PlayerCard title="CPU" hp={cpu.hp} ki={cpu.ki} />
      <RoundScoreBoard />
      <ActionBar />
    </div>
  );
}
