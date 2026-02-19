import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { loginWithGoogle, loginWithKakao } from '../lib/oauth';

export function LoginScreen() {
  const loginMock = useGameStore((s) => s.loginMock);
  const loginOauthSuccess = useGameStore((s) => s.loginOauthSuccess);
  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const hasKakaoJsKey = Boolean(import.meta.env.VITE_KAKAO_JS_KEY);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'kakao' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    if (!hasGoogleClientId) {
      loginMock('google');
      return;
    }
    setLoadingProvider('google');
    try {
      const result = await loginWithGoogle();
      loginOauthSuccess(result.provider, result.accessToken);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Google 로그인 실패');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleKakaoLogin = async () => {
    setErrorMessage(null);
    if (!hasKakaoJsKey) {
      loginMock('kakao');
      return;
    }
    setLoadingProvider('kakao');
    try {
      const result = await loginWithKakao();
      loginOauthSuccess(result.provider, result.accessToken);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Kakao 로그인 실패');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="db-bg min-h-screen px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[90vh] w-full max-w-md flex-col items-center justify-between">
        <div className="text-center text-white">
          <h1 className="db-title mt-4 text-5xl font-black">드래곤볼</h1>
          <p className="mt-2 text-sm font-semibold">쎄쎄쎄</p>
        </div>

        <div className="db-scroll w-full rounded-3xl p-5 shadow-xl">
          <h2 className="mb-4 text-center text-2xl font-extrabold">로그인</h2>
          <button className="oauth-kakao" onClick={handleKakaoLogin} disabled={loadingProvider !== null}>
            {loadingProvider === 'kakao' ? '카카오 로그인 중...' : '카카오 계정으로 로그인'}
          </button>
          <button className="oauth-google mt-3" onClick={handleGoogleLogin} disabled={loadingProvider !== null}>
            {loadingProvider === 'google' ? '구글 로그인 중...' : '구글 계정으로 로그인'}
          </button>

          <motion.button whileTap={{ scale: 0.97 }} className="start-btn mt-6" onClick={() => loginMock('google')}>
            게임 시작
          </motion.button>

          <p className="mt-3 text-center text-xs text-slate-600">OAuth 키가 없으면 게임 시작 버튼으로 Mock 로그인됩니다.</p>
          {errorMessage && <p className="mt-2 text-center text-xs text-red-600">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
}
