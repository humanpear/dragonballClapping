# Dragonball Clapping Monorepo

## 구조
- `apps/web`: Vite + React + TS + Tailwind + framer-motion + Zustand
- `apps/api`: NestJS + Socket.IO + Prisma(PostgreSQL)
- `packages/shared`: DTO/타입/Zod schema
- `packages/game-core`: 순수 함수 기반 게임 룰/타이밍/판정 로직

## 실행
```bash
pnpm install
pnpm dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:3000`

## DB
`apps/api/.env`에 `DATABASE_URL`을 넣고 Prisma를 사용합니다.

## OAuth 설정 (Web)
`apps/web/.env` 파일에 아래 값을 설정하면 실제 OAuth 로그인으로 동작합니다.

```bash
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_KAKAO_JS_KEY=your_kakao_javascript_key
```

값이 없으면 로그인 버튼 클릭 시 에러 메시지가 표시됩니다.
