import { useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { BattleScreen } from './components/BattleScreen';
import { ResultScreen } from './components/ResultScreen';
import { useGameStore } from './store/gameStore';

export function App() {
  const screen = useGameStore((s) => s.screen);
  const connect = useGameStore((s) => s.connect);

  useEffect(() => {
    connect();
  }, [connect]);

  if (screen === 'login') return <LoginScreen />;
  if (screen === 'lobby') return <LobbyScreen />;
  if (screen === 'battle') return <BattleScreen />;
  return <ResultScreen />;
}
