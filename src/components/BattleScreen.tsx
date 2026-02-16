import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ACTIONS, Action, actionCost } from '../lib/gameRules';
import { useGameStore } from '../store/gameStore';

const actionLabel: Record<Action, string> = {
  charge: '기모으기',
  guard: '막기',
  attack: '공격',
  beam: '에네르기파',
  teleport: '순간이동'
};

function WinDots({ wins }: { wins: number }) {
  return (
    <div className="wins">
      {[0, 1, 2].map((idx) => (
        <span key={idx} className={idx < wins ? 'dot win' : 'dot'} />
      ))}
    </div>
  );
}

export function BattleScreen() {
  const {
    player,
    enemy,
    beat,
    beatDurationMs,
    message,
    enqueueAction,
    nextBeat,
    actionQueue,
    locked
  } = useGameStore();

  useEffect(() => {
    const timer = window.setTimeout(() => nextBeat(), beatDurationMs);
    return () => window.clearTimeout(timer);
  }, [beat, beatDurationMs, nextBeat]);

  return (
    <div className="screen battle-bg">
      <header className="score-panel">
        <div>
          <strong>{player.name}</strong>
          <p>기: {'●'.repeat(player.ki)}{'○'.repeat(3 - player.ki)}</p>
        </div>
        <WinDots wins={player.roundWins} />
        <WinDots wins={enemy.roundWins} />
        <div>
          <strong>{enemy.name}</strong>
          <p>기: {'●'.repeat(enemy.ki)}{'○'.repeat(3 - enemy.ki)}</p>
        </div>
      </header>

      <motion.section
        className="judge-box"
        key={`${beat}-${message}`}
        initial={{ scale: 0.85, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h3>Beat {beat}</h3>
        <p>{message}</p>
        <small>
          최근 행동: {actionLabel[player.lastAction]} / {actionLabel[enemy.lastAction]}
        </small>
      </motion.section>

      <section className="action-bar" aria-label="action bar">
        {ACTIONS.map((action) => {
          const disabled = locked || beat > 2 || actionCost(action) > player.ki;
          const selected = actionQueue.includes(action);
          return (
            <button
              key={action}
              onClick={() => enqueueAction(action)}
              disabled={disabled}
              className={selected ? 'selected' : ''}
            >
              {actionLabel[action]}
              <small>{actionCost(action) > 0 ? `기-${actionCost(action)}` : '기+1'}</small>
            </button>
          );
        })}
      </section>
    </div>
  );
}
