import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { PlayerAction } from '@dragonball/shared';
import { useGameStore } from '../store/gameStore';

const actions: PlayerAction[] = ['ATTACK', 'BLOCK', 'CHARGE'];

function ActionBar() {
  const submit = useGameStore((s) => s.submitInput);
  return (
    <div className="grid grid-cols-3 gap-2">
      {actions.map((action) => (
        <motion.button key={action} whileTap={{ scale: 0.93 }} className="rounded-xl bg-slate-700 py-3 text-sm" onClick={() => submit(1, action)}>
          {action} (Beat1)
        </motion.button>
      ))}
      {actions.map((action) => (
        <motion.button key={`${action}-2`} whileTap={{ scale: 0.93 }} className="rounded-xl bg-slate-600 py-3 text-sm" onClick={() => submit(2, action)}>
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
  const window = useGameStore((s) => s.turnWindow);
  const resolved = useGameStore((s) => s.lastResolved);
  return (
    <div className="rounded-2xl bg-slate-800 p-3 text-sm">
      <p>Turn: {turnIndex + 1}</p>
      <p>InputClose: {window?.inputCloseTs ?? '-'} </p>
      <p>LockIn: {window?.lockInTs ?? '-'} </p>
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
