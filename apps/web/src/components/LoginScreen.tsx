import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export function LoginScreen() {
  const loginMock = useGameStore((s) => s.loginMock);
  return (
    <div className="p-4 text-white min-h-screen flex flex-col justify-center gap-4">
      <h1 className="text-3xl font-bold">Dragonball Clapping</h1>
      <p className="text-sm text-slate-300">OAuth 구조를 유지하면서 mock 모드 로그인 제공</p>
      <motion.button whileTap={{ scale: 0.95 }} className="rounded-xl bg-red-500 px-4 py-3" onClick={() => loginMock('google')}>
        Google Mock Login
      </motion.button>
      <motion.button whileTap={{ scale: 0.95 }} className="rounded-xl bg-yellow-500 px-4 py-3 text-black" onClick={() => loginMock('kakao')}>
        Kakao Mock Login
      </motion.button>
    </div>
  );
}
