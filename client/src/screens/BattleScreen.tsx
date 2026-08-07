import { BattleFrame } from "../components/battle/BattleFrame";
import { IMAGE_ASSET_PATHS } from "../game/assetPaths";
import {
  type BattleState,
  type BeatIndex,
  type SlotState
} from "../game/battleState";
import { type Action } from "../game/core";

const LEFT_ACTIONS: Action[] = ["ki", "attack", "kamehameha"];
const RIGHT_ACTIONS: Action[] = ["guard", "teleport"];
const MOBILE_TOP_ROW_ACTIONS: Action[] = ["ki", "attack", "kamehameha"];
const MOBILE_BOTTOM_ROW_ACTIONS: Action[] = ["guard", "teleport"];

const ACTION_LABELS: Record<Action, string> = {
  ki: "기",
  attack: "공격",
  guard: "막기",
  kamehameha: "에네르기파",
  teleport: "순간이동"
};

function slotToImage(slot: SlotState): string {
  if (slot === "win") {
    return IMAGE_ASSET_PATHS.battle.topHud.resultSlotWin;
  }

  if (slot === "lose") {
    return IMAGE_ASSET_PATHS.battle.topHud.resultSlotLose;
  }

  return IMAGE_ASSET_PATHS.battle.topHud.resultSlotEmpty;
}

function beatToImage(beatIndex: BeatIndex): string | null {
  if (beatIndex === 3) {
    return IMAGE_ASSET_PATHS.battle.topHud.beat1;
  }

  if (beatIndex === 4) {
    return IMAGE_ASSET_PATHS.battle.topHud.beatVs;
  }

  return null;
}

function getTurnResultText(battle: BattleState): string {
  if (battle.beatIndex === 3) {
    return "행동 공개";
  }

  if (battle.beatIndex !== 4) {
    return "";
  }

  if (battle.turnOutcome === "player") {
    return "승";
  }

  if (battle.turnOutcome === "cpu") {
    return "패";
  }

  if (battle.turnOutcome === "draw") {
    return "무승부";
  }

  return "";
}

interface BattleScreenProps {
  backgroundImage: string;
  battle: BattleState;
  canInput: boolean;
  enabledActions: Action[];
  onSelectAction: (action: Action) => void;
}

export function BattleScreen({
  backgroundImage,
  battle,
  canInput,
  enabledActions,
  onSelectAction
}: BattleScreenProps) {
  const beatImage = beatToImage(battle.beatIndex);
  const isBeatPose = battle.beatIndex === 1 || battle.beatIndex === 2;
  const opponentImage = battle.beatIndex === 1
    ? IMAGE_ASSET_PATHS.battle.beatPoses.enemyBeat1
    : battle.beatIndex === 2
      ? IMAGE_ASSET_PATHS.battle.beatPoses.enemyBeat2
      : battle.cpuDisplayAction
        ? IMAGE_ASSET_PATHS.battle.opponentActions[battle.cpuDisplayAction]
        : IMAGE_ASSET_PATHS.battle.opponentActions.default;
  const opponentRightArmImage = battle.beatIndex === 2
    ? IMAGE_ASSET_PATHS.battle.beatPoses.enemyBeat2RightArm
    : null;
  const playerImage = battle.beatIndex === 1
    ? IMAGE_ASSET_PATHS.battle.beatPoses.playerBeat1
    : battle.beatIndex === 2
      ? IMAGE_ASSET_PATHS.battle.beatPoses.playerBeat2
      : battle.playerDisplayAction
        ? IMAGE_ASSET_PATHS.battle.playerActions[battle.playerDisplayAction]
        : IMAGE_ASSET_PATHS.battle.playerActions.ki;

  const turnResultText = getTurnResultText(battle);

  const isActionDisabled = (action: Action): boolean =>
    !canInput || Boolean(battle.lockedPlayerAction) || !enabledActions.includes(action);

  return (
    <BattleFrame backgroundImage={backgroundImage}>
      <BattleFrame.Top>
        <BattleFrame.ScoreSlots>
          {battle.playerSlots.map((slot, index) => (
            <img
              key={`player-slot-${index}`}
              src={slotToImage(slot)}
              alt=""
              className="h-auto w-[5vw]"
            />
          ))}
        </BattleFrame.ScoreSlots>
        {beatImage ? <BattleFrame.BeatImage src={beatImage} alt="" /> : <span />}
        <BattleFrame.ScoreSlots>
          {battle.cpuSlots.map((slot, index) => (
            <img
              key={`cpu-slot-${index}`}
              src={slotToImage(slot)}
              alt=""
              className="h-auto w-[5vw]"
            />
          ))}
        </BattleFrame.ScoreSlots>
      </BattleFrame.Top>

      <BattleFrame.Middle className="pointer-events-none z-0">
        <img
          key={opponentImage}
          src={opponentImage}
          alt="적 캐릭터"
          className="h-auto w-[65vw] md:w-[50vh]"
          onError={isBeatPose ? ({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = IMAGE_ASSET_PATHS.battle.opponentActions.default;
          } : undefined}
        />
      </BattleFrame.Middle>

      <BattleFrame.Bottom className="pointer-events-none z-[1] bottom-[34%] md:bottom-0">
        <img
          key={playerImage}
          src={playerImage}
          alt="플레이어 캐릭터"
          className="h-auto w-400 md:w-[55vw]"
          onError={isBeatPose ? ({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = IMAGE_ASSET_PATHS.battle.playerActions.ki;
          } : undefined}
        />
      </BattleFrame.Bottom>

      {opponentRightArmImage ? (
        <BattleFrame.Middle className="pointer-events-none z-[2]" aria-hidden="true">
          <img
            key={opponentRightArmImage}
            src={opponentRightArmImage}
            alt=""
            className="h-auto w-[65vw] md:w-[50vh]"
            onError={({ currentTarget }) => {
              currentTarget.hidden = true;
            }}
          />
        </BattleFrame.Middle>
      ) : null}

      {turnResultText ? (
        <p className="pointer-events-none absolute inset-x-0 bottom-[34%] z-[3] m-0 text-center text-[clamp(1.7rem,5vw,3rem)] font-extrabold tracking-[0.06em] [text-shadow:0_3px_8px_rgba(0,0,0,0.65)] md:bottom-0">
          {turnResultText}
        </p>
      ) : null}

      <BattleFrame.ActionBar side="left" className="hidden md:grid md:ml-[15vw]">
        {LEFT_ACTIONS.map((action) => (
          <BattleFrame.ActionButton
            key={action}
            iconSrc={IMAGE_ASSET_PATHS.battle.actionIcons[action]}
            aria-label={ACTION_LABELS[action]}
            disabled={isActionDisabled(action)}
            selected={battle.lockedPlayerAction === action}
            onClick={() => onSelectAction(action)}
          />
        ))}
      </BattleFrame.ActionBar>

      <BattleFrame.ActionBar side="right" className="hidden md:grid md:mr-[15vw] mb-[9vh]">
        {RIGHT_ACTIONS.map((action) => (
          <BattleFrame.ActionButton
            key={action}
            iconSrc={IMAGE_ASSET_PATHS.battle.actionIcons[action]}
            aria-label={ACTION_LABELS[action]}
            disabled={isActionDisabled(action)}
            selected={battle.lockedPlayerAction === action}
            onClick={() => onSelectAction(action)}
          />
        ))}
      </BattleFrame.ActionBar>

      <section className="pointer-events-none absolute inset-x-0 bottom-9 z-20 h-[30svh] md:hidden">
        <img
          src={IMAGE_ASSET_PATHS.battle.mobileIconsGroup}
          alt=""
          className="absolute bottom-0 left-1/2 h-auto w-full max-w-[99vw] -translate-x-1/2"
        />
        <div className="pointer-events-auto absolute inset-x-0 bottom-[20%] mx-auto flex w-[88%] max-w-[70vw] flex-col items-center gap-2">
          <div className="grid w-full grid-cols-3 place-items-center">
            {MOBILE_TOP_ROW_ACTIONS.map((action) => (
              <BattleFrame.ActionButton
                key={`mobile-top-${action}`}
                iconSrc={IMAGE_ASSET_PATHS.battle.actionIcons[action]}
                aria-label={ACTION_LABELS[action]}
                disabled={isActionDisabled(action)}
                selected={battle.lockedPlayerAction === action}
                onClick={() => onSelectAction(action)}
              />
            ))}
          </div>
          <div className="grid w-[70%] grid-cols-2 place-items-center">
            {MOBILE_BOTTOM_ROW_ACTIONS.map((action) => (
              <BattleFrame.ActionButton
                key={`mobile-bottom-${action}`}
                iconSrc={IMAGE_ASSET_PATHS.battle.actionIcons[action]}
                aria-label={ACTION_LABELS[action]}
                disabled={isActionDisabled(action)}
                selected={battle.lockedPlayerAction === action}
                onClick={() => onSelectAction(action)}
              />
            ))}
          </div>
        </div>
      </section>

      <BattleFrame.InfoCard className="hidden md:block">
        <p className="m-0 mb-1">ROUND {battle.roundNumber}</p>
        <p className="m-0 mb-1">TURN {battle.turnNumber}</p>
        <p className="m-0 mb-1">
          내 기 {battle.playerEnergy} / CPU 기 {battle.cpuEnergy}
        </p>
        <p className="m-0">
          입력 상태: {battle.lockedPlayerAction ? ACTION_LABELS[battle.lockedPlayerAction] : "대기"}
        </p>
      </BattleFrame.InfoCard>

      {battle.isRoundIntro ? (
        <BattleFrame.RoundIntroOverlay
          plateSrc={IMAGE_ASSET_PATHS.battle.roundIntroPlate}
          label={battle.roundIntroLabel}
        />
      ) : null}
    </BattleFrame>
  );
}
