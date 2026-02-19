import { useGameStore } from '../store/gameStore';

export function ResultScreen() {
  const winner = useGameStore((s) => s.winner);
  const roundWins = useGameStore((s) => s.roundWins);
  const rematch = useGameStore((s) => s.rematch);
  const back = useGameStore((s) => s.backToLobby);

  return (
    <div className="db-bg min-h-screen px-4 py-8">
      <div className="mx-auto flex min-h-[90vh] w-full max-w-md flex-col items-center justify-center gap-4 rounded-3xl bg-white/80 p-6 text-center">
        <h2 className="text-3xl font-black">결과</h2>
        <p className="text-lg font-semibold">승자: {winner === 'player' ? '플레이어' : winner === 'cpu' ? 'CPU' : '무승부'}</p>
        <p className="text-sm">라운드 스코어 {roundWins.p1} : {roundWins.p2}</p>
        <button className="start-btn w-full" onClick={rematch}>리매치</button>
        <button className="w-full rounded-xl border-2 border-slate-700 bg-white py-3 font-bold" onClick={back}>로비 복귀</button>
      </div>
    </div>
  );
}
