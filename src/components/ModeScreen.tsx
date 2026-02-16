import type { BattleMode } from '../store/gameStore';

interface ModeScreenProps {
  onSelect: (mode: BattleMode) => void;
}

const modes: Array<{ mode: BattleMode; label: string; subtitle: string }> = [
  { mode: 'quick', label: '빠른 대전', subtitle: '1:1 대전' },
  { mode: 'rank', label: '등급전', subtitle: '추후 도입' },
  { mode: 'cpu', label: '연습 게임', subtitle: 'VS CPU' }
];

export function ModeScreen({ onSelect }: ModeScreenProps) {
  return (
    <div className="screen bg-desert">
      <h2 className="banner">모드 선택</h2>
      <div className="mode-grid">
        {modes.map((entry) => (
          <button key={entry.mode} className="mode-card" onClick={() => onSelect(entry.mode)}>
            <span>{entry.label}</span>
            <small>{entry.subtitle}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
