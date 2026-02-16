interface HomeScreenProps {
  onStart: () => void;
}

export function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <div className="screen bg-desert">
      <h1 className="logo">드래곤볼 쎄쎄쎄</h1>
      <div className="scroll-card">
        <button className="social kakao">카카오 계정으로 로그인</button>
        <button className="social google">구글 계정으로 로그인</button>
      </div>
      <button className="start-btn" onClick={onStart}>
        게임 시작
      </button>
    </div>
  );
}
