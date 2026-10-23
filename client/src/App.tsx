import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IMAGE_ASSET_PATHS } from "./game/assetPaths";
import { advanceBattleClock, battleTurnKey, createTimedBattle, pauseBattleClock, resumeBattleClock, submitBattleAction, type TimedBattle } from "./game/battleClock";
import { TURN_TIMING_RULES } from "../../shared/timing.js";
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
  const [battle, setBattle] = useState(() => createTimedBattle(0));
  const battleRef = useRef(battle);
  const renderedTurnKey = battleTurnKey(battle);
  const publish = useCallback((next: TimedBattle) => { battleRef.current = next; setBattle(next); }, []);
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

      publish(submitBattleAction(battleRef.current, action, performance.now(), renderedTurnKey));
    },
    [screen, renderedTurnKey, publish]
  );

  useEffect(() => {
    if (screen !== "battle") return;
    const tick = () => {
      const next = advanceBattleClock(battleRef.current, performance.now());
      if (next !== battleRef.current) publish(next);
    };
    const timer = window.setInterval(tick, 16);
    const visibility = () => {
      const now = performance.now();
      publish(document.hidden ? pauseBattleClock(battleRef.current, now) : resumeBattleClock(battleRef.current, now));
    };
    document.addEventListener("visibilitychange", visibility);
    if (document.hidden) visibility();
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", visibility); };
  }, [screen, publish]);

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
      if (!event.repeat) trySelectAction(actionByKey);
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
      battle.pausedAt === null &&
      battle.beatIndex <= TURN_TIMING_RULES.inputBeats,
    [screen, battle]
  );

  const enabledActions = useMemo(
    () => getEnabledActionsByEnergy(battle.playerEnergy),
    [battle.playerEnergy]
  );

  const startVsCpuMatch = useCallback(async () => {
    await preloadBattleImages();
    publish(createTimedBattle(performance.now()));
    setScreen("battle");
  }, [publish]);

  const backToLobby = useCallback(() => {
    publish(createTimedBattle(performance.now()));
    setScreen("lobby");
  }, [publish]);

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
