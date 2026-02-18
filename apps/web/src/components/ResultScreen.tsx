import { useGameStore } from '../store/gameStore';

export function ResultScreen() {
  const winner = useGameStore((s) => s.winner);
  const rematch = useGameStore((s) => s.rematch);
  const back = useGameStore((s) => s.backToLobby);
  return (
    <div className="min-h-screen p-4 text-white flex flex-col justify-center gap-3">
      <h2 className="text-2xl font-bold">결과</h2>
      <p>Winner: {winner}</p>
      <button className="rounded-xl bg-green-500 py-3" onClick={rematch}>리매치</button>
      <button className="rounded-xl bg-slate-700 py-3" onClick={back}>로비 복귀</button>
    </div>
  );
}
