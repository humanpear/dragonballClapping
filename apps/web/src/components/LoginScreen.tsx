import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { loginWithGoogle, loginWithKakao } from '../lib/oauth';

export function LoginScreen() {
  const loginMock = useGameStore((s) => s.loginMock);
  const loginOauthSuccess = useGameStore((s) => s.loginOauthSuccess);
  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const hasKakaoJsKey = Boolean(import.meta.env.VITE_KAKAO_JS_KEY);
  const hasOauthConfig = hasGoogleClientId && hasKakaoJsKey;
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'kakao' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setLoadingProvider('google');
    try {
      const result = await loginWithGoogle();
      loginOauthSuccess(result.provider, result.accessToken);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Google 로그인에 실패했습니다.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleKakaoLogin = async () => {
    setErrorMessage(null);
    setLoadingProvider('kakao');
    try {
      const result = await loginWithKakao();
      loginOauthSuccess(result.provider, result.accessToken);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Kakao 로그인에 실패했습니다.');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="p-4 text-white min-h-screen flex flex-col justify-center gap-4">
      <h1 className="text-3xl font-bold">Dragonball Clapping</h1>
      <p className="text-sm text-slate-300">실제 OAuth SDK를 사용하여 Google/Kakao 로그인을 지원합니다.</p>

      <motion.button
        whileTap={{ scale: 0.95 }}
        className="rounded-xl bg-red-500 px-4 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={handleGoogleLogin}
        disabled={loadingProvider !== null || !hasGoogleClientId}
      >
        {!hasGoogleClientId
          ? 'Google Login (환경변수 필요)'
          : loadingProvider === 'google'
            ? 'Google 로그인 중...'
            : 'Google Login'}
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        className="rounded-xl bg-yellow-500 px-4 py-3 text-black disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={handleKakaoLogin}
        disabled={loadingProvider !== null || !hasKakaoJsKey}
      >
        {!hasKakaoJsKey
          ? 'Kakao Login (환경변수 필요)'
          : loadingProvider === 'kakao'
            ? 'Kakao 로그인 중...'
            : 'Kakao Login'}
      </motion.button>

      <div className="mt-3 border-t border-slate-700 pt-3">
        <button className="text-xs text-slate-400 underline" onClick={() => loginMock('google')}>
          개발용 Mock 로그인(google)
        </button>
      </div>

      {!hasOauthConfig && (
        <p className="text-xs text-amber-300">
          OAuth 환경변수가 없어서 실제 Google/Kakao 로그인은 비활성화되었습니다.{' '}
          <code>apps/web/.env</code> 또는 <code>apps/web/.env.local</code> 파일에 키를 설정하세요.
        </p>
      )}

      {errorMessage && <p className="text-sm text-red-300">{errorMessage}</p>}
      <p className="text-xs text-slate-400">환경변수: VITE_GOOGLE_CLIENT_ID, VITE_KAKAO_JS_KEY</p>
    </div>
  );
}
