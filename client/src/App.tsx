import { useCallback, useEffect, useMemo, useState } from "react";
import { IMAGE_ASSET_PATHS } from "./game/assetPaths";
import {
  advanceBattleState,
  createInitialBattleState,
  ROUND_INTRO_DURATION_MS
} from "./game/battleState";
import { getEnabledActionsByEnergy, type Action } from "./game/core";
import { preloadBattleImages } from "./game/preloadBattleImages";
import { useIsMobile } from "./hooks/useIsMobile";
import { BattleScreen } from "./screens/BattleScreen";
import { LobbyScreen } from "./screens/LobbyScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { StartScreen } from "./screens/StartScreen";

type Screen = "start" | "lobby" | "battle" | "result";

function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [battle, setBattle] = useState(createInitialBattleState);
  const isMobile = useIsMobile(768);

  const sharedBackgroundImage = isMobile
    ? IMAGE_ASSET_PATHS.shared.startLobbyBackgroundMobile
    : IMAGE_ASSET_PATHS.shared.startLobbyBackgroundDesktop;

  const battleBackgroundImage = isMobile
    ? IMAGE_ASSET_PATHS.battle.backgroundMobile
    : IMAGE_ASSET_PATHS.battle.backgroundDesktop;

  const startButtonImage = isMobile
    ? IMAGE_ASSET_PATHS.start.startButtonMobile
    : IMAGE_ASSET_PATHS.start.startButtonDesktop;

  const lobbyButtons = isMobile
    ? IMAGE_ASSET_PATHS.lobby.buttonsMobile
    : IMAGE_ASSET_PATHS.lobby.buttonsDesktop;

  useEffect(() => {
    void preloadBattleImages();
  }, []);

  const trySelectAction = useCallback(
    (action: Action) => {
      if (screen !== "battle") {
        return;
      }

      setBattle((previousState) => {
        if (previousState.isRoundIntro || previousState.matchWinner) {
          return previousState;
        }

        if (previousState.beatIndex > 2) {
          return previousState;
        }

        if (previousState.lockedPlayerAction) {
          return previousState;
        }

        return { ...previousState, lockedPlayerAction: action };
      });
    },
    [screen]
  );

  useEffect(() => {
    if (screen !== "battle" || battle.matchWinner) {
      return;
    }

    const timeoutMs = battle.isRoundIntro
      ? ROUND_INTRO_DURATION_MS
      : battle.beatDurationMs;

    const timer = window.setTimeout(() => {
      setBattle((previousState) => advanceBattleState(previousState));
    }, timeoutMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [screen, battle]);

  useEffect(() => {
    if (screen !== "battle" || !battle.matchWinner) {
      return;
    }

    const timer = window.setTimeout(() => {
      setScreen("result");
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [screen, battle.matchWinner]);

  useEffect(() => {
    if (screen !== "battle") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const actionByKey: Action | null =
        key === "d"
          ? "ki"
          : key === "f"
            ? "attack"
            : event.code === "Space"
              ? "kamehameha"
              : key === "j"
                ? "guard"
                : key === "k"
                  ? "teleport"
                  : null;

      if (!actionByKey) {
        return;
      }

      event.preventDefault();
      trySelectAction(actionByKey);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [screen, trySelectAction]);

  const canInput = useMemo(
    () =>
      screen === "battle" &&
      !battle.isRoundIntro &&
      !battle.matchWinner &&
      battle.beatIndex <= 2,
    [screen, battle]
  );

  const enabledActions = useMemo(
    () => getEnabledActionsByEnergy(battle.playerEnergy),
    [battle.playerEnergy]
  );

  const startVsCpuMatch = useCallback(async () => {
    await preloadBattleImages();
    setBattle(createInitialBattleState());
    setScreen("battle");
  }, []);

  const backToLobby = useCallback(() => {
    setBattle(createInitialBattleState());
    setScreen("lobby");
  }, []);

  const openPendingMode = useCallback(() => {
    window.alert("준비 중인 모드입니다.");
  }, []);

  if (screen === "start") {
    return (
      <StartScreen
        backgroundImage={sharedBackgroundImage}
        startButtonImage={startButtonImage}
        onStart={() => setScreen("lobby")}
      />
    );
  }

  if (screen === "lobby") {
    return (
      <LobbyScreen
        backgroundImage={sharedBackgroundImage}
        buttonImages={lobbyButtons}
        onQuickMatch={openPendingMode}
        onVsCpu={startVsCpuMatch}
        onCreateRoom={openPendingMode}
        onJoinRoom={openPendingMode}
      />
    );
  }

  if (screen === "result") {
    return (
      <ResultScreen
        backgroundImage={sharedBackgroundImage}
        winner={battle.matchWinner}
        playerWins={battle.playerWins}
        cpuWins={battle.cpuWins}
        onRematch={startVsCpuMatch}
        onBackToLobby={backToLobby}
      />
    );
  }

  return (
    <BattleScreen
      backgroundImage={battleBackgroundImage}
      battle={battle}
      canInput={canInput}
      enabledActions={enabledActions}
      onSelectAction={trySelectAction}
    />
  );
}

export default App;
