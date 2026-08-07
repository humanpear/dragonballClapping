# Image Asset Spec (Updated)

아래 경로는 현재 코드(`client/src/game/assetPaths.ts`)와 1:1로 맞춘 최종 경로다.

## 1) 시작 화면

1. 배경(시작/로비 공용)
- `public/images/shared/start-lobby-bg-desktop.png`
- `public/images/shared/start-lobby-bg-mobile.png`

2. 타이틀
- `public/images/start/title-dragonball-clapping.png`

3. 시작 버튼
- `public/images/start/start-button-desktop.png`
- `public/images/start/start-button-mobile.png`

## 2) 로비 화면

1. 타이틀("모드 선택")
- `public/images/lobby/title-mode-select.png`

2. PC 버튼
- `public/images/lobby/buttons/desktop-quick-match.png`
- `public/images/lobby/buttons/desktop-vs-cpu.png`
- `public/images/lobby/buttons/desktop-create-room.png`
- `public/images/lobby/buttons/desktop-join-room.png`

3. 모바일 버튼
- `public/images/lobby/buttons/mobile-quick-match.png`
- `public/images/lobby/buttons/mobile-vs-cpu.png`
- `public/images/lobby/buttons/mobile-create-room.png`
- `public/images/lobby/buttons/mobile-join-room.png`

## 3) 배틀 화면

### 3-1. 배경/라운드 진입

1. 배경
- `public/images/battle/background-desktop.png`
- `public/images/battle/background-mobile.png`

2. 라운드 진입 플레이트
- `public/images/battle/round-intro-plate.png`

### 3-2. 상단 HUD (승패 + beat)

1. 승패 슬롯
- `public/images/battle/top/result-slot-empty.png`
- `public/images/battle/top/result-slot-win.png`
- `public/images/battle/top/result-slot-lose.png`

2. beat 표시
- `public/images/battle/top/beat-3.png`
- `public/images/battle/top/beat-2.png`
- `public/images/battle/top/beat-1.png`
- `public/images/battle/top/beat-vs.png`

### 3-3. 행동 이미지

1. 적 행동
- `public/images/battle/opponent-actions/enemy-default.png`
- `public/images/battle/opponent-actions/enemy-ki.png`
- `public/images/battle/opponent-actions/enemy-attack.png`
- `public/images/battle/opponent-actions/enemy-guard.png`
- `public/images/battle/opponent-actions/enemy-kamehameha.png`
- `public/images/battle/opponent-actions/enemy-teleport.png`

2. 내 행동
- `public/images/battle/player-actions/player-ki.png`
- `public/images/battle/player-actions/player-attack.png`
- `public/images/battle/player-actions/player-guard.png`
- `public/images/battle/player-actions/player-kamehameha.png`
- `public/images/battle/player-actions/player-teleport.png`

3. 좌/우 액션바 아이콘(공용)
- `public/images/battle/icons/ki.png`
- `public/images/battle/icons/attack.png`
- `public/images/battle/icons/guard.png`
- `public/images/battle/icons/kamehameha.png`
- `public/images/battle/icons/teleport.png`

## 4) Beat1/Beat2 전용 동작 이미지

1. 적 캐릭터 본체
- `public/images/battle/opponent-actions/enemy-beat1.png`
- `public/images/battle/opponent-actions/enemy-beat2.png`

2. Beat2 적 캐릭터 오른팔 오버레이
- `public/images/battle/opponent-actions/enemy-beat2-right-arm.png`

3. 플레이어 캐릭터
- `public/images/battle/player-actions/player-beat1.png`
- `public/images/battle/player-actions/player-beat2.png`

Beat1은 적 캐릭터 단일 이미지를 사용한다. Beat2의 적 오른팔 오버레이는
적 캐릭터 본체와 **동일한 이미지 크기와 동일한 투명 캔버스 여백**으로
제작한다. 오른팔 이외의 영역은 투명해야 한다. Beat2 화면에서는
`적 본체 → 플레이어 → 적 오른팔` 순서로 겹쳐 표시된다.

## 5) 비트/판정 규칙 변경 메모

1. 입력은 Beat1~Beat2까지만 허용
2. Beat2 종료 시 입력 확정/잠금
3. Beat1과 Beat2는 상단 숫자 카운트 대신 각 Beat 전용 캐릭터 이미지 표시
4. Beat3은 양측 행동 이미지 표시
5. Beat4는 상호 판정 결과 표시
6. Beat4 결과가 무승부면 다음 턴 진행
7. Beat4 결과에 승패가 나면 상단 승리 반영 후 다음 라운드로 진행
