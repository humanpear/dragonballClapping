import { createGoogleAuthUrl, createKakaoAuthUrl, redirectToOAuthLogin } from '../lib/auth';

interface HomeScreenProps {
  onStart: () => void;
}

export function HomeScreen({ onStart }: HomeScreenProps) {
  const handleKakaoLogin = () => {
    redirectToOAuthLogin({
      createUrl: () =>
        createKakaoAuthUrl({
          clientId: import.meta.env.VITE_KAKAO_CLIENT_ID ?? '',
          redirectUri: import.meta.env.VITE_KAKAO_REDIRECT_URI ?? ''
        }),
      fallbackMessage:
        '카카오 로그인을 사용하려면 VITE_KAKAO_CLIENT_ID, VITE_KAKAO_REDIRECT_URI를 설정해주세요.'
    });
  };

  const handleGoogleLogin = () => {
    redirectToOAuthLogin({
      createUrl: () =>
        createGoogleAuthUrl({
          clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
          redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI ?? ''
        }),
      fallbackMessage:
        '구글 로그인을 사용하려면 VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_REDIRECT_URI를 설정해주세요.'
    });
  };

  return (
    <div className="screen bg-desert">
      <h1 className="logo">드래곤볼 쎄쎄쎄</h1>
      <div className="scroll-card">
        <button className="social kakao" onClick={handleKakaoLogin}>
          카카오 계정으로 로그인
        </button>
        <button className="social google" onClick={handleGoogleLogin}>
          구글 계정으로 로그인
        </button>
      </div>
      <button className="start-btn" onClick={onStart}>
        게임 시작
      </button>
    </div>
  );
}
