# Dragonball Clapping - Implementation Tickets

Generated from `AGENTS.md` with `/plan-eng-review` mindset  
Mode: `SCOPE_REDUCED (CPU-first)`

## 0) Step 0 Scope Challenge Result

- Scope decision: **CPU-first**
- Phase 1 includes: `공통 룰엔진 + 배틀 UI + VS CPU + 시작화면/로비 동선`
- Phase 2 defers: `랜덤매칭/방코드/PvP 실시간 동기화 정책 전체`

### What Already Exists

- Functional spec exists in [AGENTS.md](C:/Users/pibma/Documents/GitHub/dragonball-clapping/AGENTS.md)
- No runtime code exists yet in this repository root

### NOT In Scope (Phase 1)

- 빠른 시작(PvP), 방 만들기/참가하기(PvP)
- Room code lifecycle / queue / reconnect / rematch handshake
- resultSeq ack/resync and ruleVersion handshake
- 결과 공유, 랭킹/전적, CPU 다중 난이도

## 1) Target Architecture (Phase 1)

```text
[Start Screen] --click game start--> [Lobby]
                                  \
                                   -> [VS CPU Battle]

[Battle UI]
   |
   v
[Turn/Beat Orchestrator] ---> [Rule Engine] ---> [Round/Match State]
         |                           |                    |
         |                           |                    v
         |                           +--> [Energy Validator/Applier]
         v
   [Input Lock (first input)]
         |
         v
   [CPU Decision Policy @ Beat3]
```

## 2) Ticket Dependency Graph

```text
T00 Bootstrap
  -> T01 Domain Model
  -> T02 Rule Engine
  -> T03 Energy/Validation
  -> T04 Beat Orchestrator
  -> T05 Input Lock + Timeout(auto 기)
  -> T06 CPU Policy
  -> T07 Battle UI (VS CPU)
  -> T08 Start->Lobby UX (game start transition)
  -> T09 Persisted Session/Nickname (guest only)
  -> T10 Test Suite (unit/integration/e2e smoke)
  -> T11 Instrumentation + Error Surfaces
```

## 3) Ordered Tickets

## T00 - Project Bootstrap

- Goal: 실행 가능한 기본 앱/서버 구조와 CI 테스트 러너 뼈대 구축
- Output:
  - frontend app shell
  - backend app shell (CPU-first에서도 서버 권위 룰 적용 준비)
  - lint/test scripts
- Acceptance:
  - `start` command로 앱 실행
  - `test` command가 최소 1개 샘플 테스트 통과
  - 실패 시 명확한 에러 로그 출력
- Tests:
  - smoke: app boot
  - smoke: test runner boot

## T01 - Domain Model and Constants

- Goal: 게임 핵심 타입/상수 단일화
- Output:
  - actions, beat config, round/match win condition, energy costs
  - phase/state enums
- Acceptance:
  - AGENTS 명세 값(4.0초, 0.05 감소, min 1.0, 3승 선취)과 100% 일치
- Tests:
  - constant contract test
  - invalid enum rejection test

## T02 - Rule Engine (Judgement + Symmetry)

- Goal: 행동 판정 로직을 순수 함수로 구현
- Output:
  - `resolveAction(playerAction, cpuAction)` 형태의 deterministic 함수
  - 대칭 규칙 적용(표 미기재 조합 좌우 반전)
- Acceptance:
  - 명세의 모든 케이스 + 반전 케이스 일관성 보장
- Tests:
  - table-driven tests for listed pairs
  - symmetry property test (A vs B result inversion consistency)

## T03 - Energy Engine and Validation

- Goal: 에너지 증감/무효입력 대체 규칙 구현
- Output:
  - action energy cost apply
  - `fallback_to_ki` policy for insufficient energy
  - malformed input reject
- Acceptance:
  - 에너지 부족 행동은 자동 `기` 대체
  - Beat3 확정 시점 원자 처리 시나리오 지원
- Tests:
  - insufficient energy fallback tests
  - malformed action reject tests
  - energy never below zero tests

## T04 - Beat Orchestrator (4beat Turn Loop)

- Goal: 턴 타이밍 엔진 구현
- Output:
  - Beat1/2/3 input window, Beat4 result phase
  - turn-to-turn beat duration 감소 및 라운드 시작 리셋
- Acceptance:
  - 턴마다 0.05 감소, 1.0 하한 유지
  - 라운드 시작 시 4.0 리셋
- Tests:
  - timing progression tests
  - min clamp test
  - round reset test

## T05 - Input Lock and Timeout Handling

- Goal: 최초 입력 고정 + 미입력 자동 `기` 처리
- Output:
  - first input lock until turn end
  - no-input fallback at Beat3 end
- Acceptance:
  - 같은 턴에서 두 번째 입력 무시
  - Beat3 종료 시 미입력은 `기` 확정
- Tests:
  - duplicate input ignored test
  - no input timeout fallback test

## T06 - VS CPU Decision Policy

- Goal: 상태 기반 랜덤 + 균등 확률 정책 구현
- Output:
  - spec의 7개 조건 우선순위 정책
  - 후보 행동 균등 랜덤 선택
- Acceptance:
  - 동일 상태에서 후보군 밖 행동이 나오지 않음
  - CPU 결정 시점은 Beat3
- Tests:
  - condition priority tests
  - allowed set tests per state
  - distribution sanity test (long-run approximate uniformity)

## T07 - Battle Screen Integration (VS CPU)

- Goal: 룰엔진/비트엔진/CPU엔진을 실제 배틀 UI와 연결
- Output:
  - score/energy/action icon/timer/result text UI
  - 5개 액션 버튼 + PC keymap + 모바일 터치 디바운스
- Acceptance:
  - 한 판 전체 루프(턴 반복 -> 라운드 -> 3승 매치) 동작
  - PC 키맵 및 버튼 입력 모두 동일 규칙 적용
- Tests:
  - integration: full match flow vs CPU
  - control parity test (mouse vs keyboard)

## T08 - Start -> Lobby UX (Guest-Only)

- Goal: 시작화면/로비 전환 UX 구현
- Output:
  - 시작화면 단일 `게임시작` 버튼
  - 전환 연출
  - 시작/로비 공통 배경
- Acceptance:
  - 버튼 클릭 후 연출 뒤 로비 진입
  - 게스트 전용 동선에서 막힘 없음
- Tests:
  - e2e smoke: start -> lobby -> vs cpu entry

## T09 - Guest Session Identity

- Goal: 게스트 닉네임/세션 식별 최소 구현
- Output:
  - session-local guest identity
  - 배틀 화면 닉네임 표시용 상태
- Acceptance:
  - 페이지 새로고침/재진입 시 정책에 맞는 guest identity 유지/재생성 동작
- Tests:
  - session lifecycle tests

## T10 - Test Coverage Pass

- Goal: Phase 1 코드경로 100%에 가까운 테스트 확보
- Output:
  - unit: 룰/에너지/CPU/비트
  - integration: 턴/라운드/매치 상태 전이
  - e2e smoke: 시작->로비->VS CPU->결과->리매치/로비복귀
- Acceptance:
  - critical path 전부 테스트 존재
  - regression test seeds for known failure modes

## T11 - Error Surfaces and Debug Signals

- Goal: silent failure 제거
- Output:
  - 사용자 에러 메시지(입력 무시/네트워크 이상 등)
  - 개발용 debug flag 기반 CPU/턴 상태 표시
- Acceptance:
  - 치명 흐름에서 무음 실패 없음
  - debug flag off 시 사용자 화면 노이즈 없음
- Tests:
  - error UI rendering tests
  - debug flag gating tests

## 4) Phase 2 Ticket Backlog (Deferred)

- P01: PvP authoritative match service baseline
- P02: random queue lifecycle (`3.12`)
- P03: room code lifecycle + collision handling (`3.9`)
- P04: reconnect grace and session collision (`3.6`, `3.10`)
- P05: rematch handshake (`3.8`)
- P06: resultSeq ack/resync (`3.14`)
- P07: ruleVersion compatibility gate (`3.11`)

## 5) Failure Modes (Phase 1) and Coverage Intent

- FM-01: Beat clock drift causing wrong lock timing
  - Mitigation: T04 deterministic scheduler tests
- FM-02: duplicate input overriding first choice
  - Mitigation: T05 lock tests + T10 regression
- FM-03: insufficient energy causing invalid state
  - Mitigation: T03 fallback_to_ki tests
- FM-04: CPU choosing out-of-policy action
  - Mitigation: T06 allowed-set tests
- FM-05: round never terminates due to state bug
  - Mitigation: T07 integration full-match tests
- FM-06: start-lobby-battle transition dead-end
  - Mitigation: T08 e2e smoke

## 6) Suggested Execution Cadence

- Milestone M1 (Playable Core): `T00` ~ `T07`
- Milestone M2 (UX + Stability): `T08` ~ `T11`
- Milestone M3 (Online PvP): Phase 2 backlog `P01` ~ `P07`

## 7) Open Decisions That May Bite Later

- Tech stack lock (frontend/backend/test framework) is not specified yet.
- Mobile orientation lock behavior(가로 회전 시 처리) is not specified.
- Guest nickname collision policy(동명이인 허용 여부) is not specified.
