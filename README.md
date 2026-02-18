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
