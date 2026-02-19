import { useGameStore } from '../store/gameStore';

const modeCards = [
  { title: '빠른 대전', subtitle: '1:1 매칭 (준비중)', disabled: true },
  { title: '랭크 게임', subtitle: '추후 도입', disabled: true },
  { title: 'VS CPU', subtitle: '연습게임', disabled: false },
  { title: '튜토리얼', subtitle: '조작 설명 (준비중)', disabled: true }
];

export function LobbyScreen() {
  const startVsCpu = useGameStore((s) => s.startVsCpu);

  return (
    <div className="db-bg min-h-screen px-4 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-lg">
        <div className="db-scroll mb-6 px-5 py-4 text-center">
          <h2 className="text-3xl font-black">모드 선택</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {modeCards.map((card) => (
            <button
              key={card.title}
              onClick={!card.disabled ? startVsCpu : undefined}
              disabled={card.disabled}
              className="mode-card disabled:cursor-not-allowed disabled:opacity-70"
            >
              <h3 className="text-xl font-extrabold">{card.title}</h3>
              <p className="mt-2 text-xs text-slate-600">{card.subtitle}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
