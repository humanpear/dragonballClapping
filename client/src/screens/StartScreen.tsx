import { SceneShell } from "../components/shell/SceneShell";
import { IMAGE_ASSET_PATHS } from "../game/assetPaths";

interface StartScreenProps {
  backgroundImage: string;
  startButtonImage: string;
  onStart: () => void;
}

export function StartScreen({
  backgroundImage,
  startButtonImage,
  onStart
}: StartScreenProps) {
  return (
    <SceneShell backgroundImage={backgroundImage}>
      <SceneShell.Panel>
        <img
          src={IMAGE_ASSET_PATHS.start.title}
          alt="Dragonball Clapping title"
          className="w-[35vw] mt-[10vh]"
        />
        <SceneShell.ImageButton
          imageSrc={startButtonImage}
          label="게임 시작"
          aria-label="start-game"
          onClick={onStart}
          imageClassName="w-[20vw] mb-[15vh]"
        />
      </SceneShell.Panel>
    </SceneShell>
  );
}
