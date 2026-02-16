import { BattleScreen } from './components/BattleScreen';
import { HomeScreen } from './components/HomeScreen';
import { ModeScreen } from './components/ModeScreen';
import { ResultScreen } from './components/ResultScreen';
import { useGameStore } from './store/gameStore';

function App() {
  const { screen, startMode, backToMode, resetMatch, winnerName } = useGameStore();

  if (screen === 'home') {
    return <HomeScreen onStart={backToMode} />;
  }

  if (screen === 'mode') {
    return <ModeScreen onSelect={startMode} />;
  }

  if (screen === 'result' && winnerName) {
    return <ResultScreen winner={winnerName} onRematch={resetMatch} onLobby={backToMode} />;
  }

  return <BattleScreen />;
}

export default App;
