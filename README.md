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
`apps/web/.env.example`을 복사해서 `apps/web/.env.local`(또는 `.env`) 파일을 만든 뒤 값을 채우면 실제 OAuth 로그인으로 동작합니다.

```bash
cp apps/web/.env.example apps/web/.env.local
```

```bash
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_KAKAO_JS_KEY=your_kakao_javascript_key
```

환경변수를 추가/수정했다면 Vite dev server를 재시작해야 반영됩니다.
값이 없으면 OAuth 버튼이 비활성화되고, 개발용 Mock 로그인만 사용할 수 있습니다.
