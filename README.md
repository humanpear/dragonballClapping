# dragonballClapping

드래곤볼 쎄쎄쎄 웹게임 MVP입니다.

## 실행

```bash
npm install
npm run dev
```

## SNS 로그인 환경변수 설정

SNS 로그인을 사용하려면 프로젝트 루트에 `.env` 파일을 만들고 아래 값을 설정해주세요.

```bash
cp .env.example .env
```

```env
VITE_KAKAO_CLIENT_ID=
VITE_KAKAO_REDIRECT_URI=
VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_REDIRECT_URI=
```

## 구현 범위

- 홈(카카오/구글 로그인 버튼, 시작 버튼)
- 모드 선택(빠른 대전/등급전/VS CPU)
- 배틀 화면(승수, 기, 5개 액션 버튼, beat 진행)
- 행동 판정 매트릭스 기반 라운드 승패 처리
- 3승 매치 종료 후 결과 화면

## 기술

- Vite + React + TypeScript
- Zustand
- TailwindCSS + 커스텀 CSS
- Framer Motion
- Vitest
