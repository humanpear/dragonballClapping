import { useGameStore } from '../store/gameStore';

export function LobbyScreen() {
  const startVsCpu = useGameStore((s) => s.startVsCpu);
  const provider = useGameStore((s) => s.provider);
  return (
    <div className="min-h-screen p-4 text-white flex flex-col gap-4">
      <h2 className="text-2xl font-bold">로비</h2>
      <p className="text-sm text-slate-300">로그인: {provider}</p>
      <button className="rounded-xl bg-blue-500 py-3" onClick={startVsCpu}>
        VS CPU 시작
      </button>
    </div>
  );
}
