interface ResultScreenProps {
  winner: string;
  onRematch: () => void;
  onLobby: () => void;
}

export function ResultScreen({ winner, onRematch, onLobby }: ResultScreenProps) {
  return (
    <div className="screen bg-desert">
      <h2 className="banner">결과</h2>
      <p className="winner">🏆 {winner} 승리!</p>
      <div className="result-actions">
        <button onClick={onRematch}>리매치</button>
        <button onClick={onLobby}>로비 복귀</button>
      </div>
    </div>
  );
}
