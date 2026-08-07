export const IMAGE_ASSET_PATHS = {
  shared: {
    startLobbyBackgroundDesktop: "/images/shared/start-lobby-bg-desktop.png",
    startLobbyBackgroundMobile: "/images/shared/start-lobby-bg-mobile.png"
  },
  start: {
    title: "/images/start/title-dragonball-clapping.png",
    startButtonDesktop: "/images/start/start-button-desktop.png",
    startButtonMobile: "/images/start/start-button-mobile.png"
  },
  lobby: {
    titleModeSelect: "/images/lobby/title-mode-select.png",
    buttonsDesktop: {
      quickMatch: "/images/lobby/buttons/desktop-quick-match.png",
      vsCpu: "/images/lobby/buttons/desktop-vs-cpu.png",
      createRoom: "/images/lobby/buttons/desktop-create-room.png",
      joinRoom: "/images/lobby/buttons/desktop-join-room.png"
    },
    buttonsMobile: {
      quickMatch: "/images/lobby/buttons/mobile-quick-match.png",
      vsCpu: "/images/lobby/buttons/mobile-vs-cpu.png",
      createRoom: "/images/lobby/buttons/mobile-create-room.png",
      joinRoom: "/images/lobby/buttons/mobile-join-room.png"
    }
  },
  battle: {
    backgroundDesktop: "/images/battle/background-desktop.png",
    backgroundMobile: "/images/battle/background-mobile.png",
    roundIntroPlate: "/images/battle/round-intro-plate.png",
    topHud: {
      resultSlotEmpty: "/images/battle/top/result-slot-empty.png",
      resultSlotWin: "/images/battle/top/result-slot-win.png",
      resultSlotLose: "/images/battle/top/result-slot-lose.png",
      beat3: "/images/battle/top/beat-3.png",
      beat2: "/images/battle/top/beat-2.png",
      beat1: "/images/battle/top/beat-1.png",
      beatVs: "/images/battle/top/beat-vs.png"
    },
    opponentActions: {
      default: "/images/battle/opponent-actions/enemy-default.png",
      ki: "/images/battle/opponent-actions/enemy-ki.png",
      attack: "/images/battle/opponent-actions/enemy-attack.png",
      guard: "/images/battle/opponent-actions/enemy-guard.png",
      kamehameha: "/images/battle/opponent-actions/enemy-kamehameha.png",
      teleport: "/images/battle/opponent-actions/enemy-teleport.png"
    },
    playerActions: {
      ki: "/images/battle/player-actions/player-ki.png",
      attack: "/images/battle/player-actions/player-attack.png",
      guard: "/images/battle/player-actions/player-guard.png",
      kamehameha: "/images/battle/player-actions/player-kamehameha.png",
      teleport: "/images/battle/player-actions/player-teleport.png"
    },
    actionIcons: {
      ki: "/images/battle/icons/ki.png",
      attack: "/images/battle/icons/attack.png",
      guard: "/images/battle/icons/guard.png",
      kamehameha: "/images/battle/icons/kamehameha.png",
      teleport: "/images/battle/icons/teleport.png"
    },
    mobileIconsGroup: "/images/battle/icons/mobile-icons-group.png",
    beatPoses: {
      enemyBeat1: "/images/battle/opponent-actions/enemy-beat1.png",
      enemyBeat2: "/images/battle/opponent-actions/enemy-beat2.png",
      enemyBeat2RightArm:
        "/images/battle/opponent-actions/enemy-beat2-right-arm.png",
      playerBeat1: "/images/battle/player-actions/player-beat1.png",
      playerBeat2: "/images/battle/player-actions/player-beat2.png"
    }
  }
} as const;

export const BATTLE_PRELOAD_IMAGE_PATHS = [
  IMAGE_ASSET_PATHS.battle.backgroundDesktop,
  IMAGE_ASSET_PATHS.battle.backgroundMobile,
  IMAGE_ASSET_PATHS.battle.roundIntroPlate,
  ...Object.values(IMAGE_ASSET_PATHS.battle.topHud),
  ...Object.values(IMAGE_ASSET_PATHS.battle.opponentActions),
  ...Object.values(IMAGE_ASSET_PATHS.battle.playerActions),
  ...Object.values(IMAGE_ASSET_PATHS.battle.actionIcons),
  IMAGE_ASSET_PATHS.battle.mobileIconsGroup,
  ...Object.values(IMAGE_ASSET_PATHS.battle.beatPoses)
] as const;
