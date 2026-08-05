import { SceneShell } from "../components/shell/SceneShell";
import { IMAGE_ASSET_PATHS } from "../game/assetPaths";

interface LobbyButtonImages {
  quickMatch: string;
  vsCpu: string;
  createRoom: string;
  joinRoom: string;
}

interface LobbyScreenProps {
  backgroundImage: string;
  buttonImages: LobbyButtonImages;
  onQuickMatch: () => void;
  onVsCpu: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

export function LobbyScreen({
  backgroundImage,
  buttonImages,
  onQuickMatch,
  onVsCpu,
  onCreateRoom,
  onJoinRoom
}: LobbyScreenProps) {
  return (
    <SceneShell backgroundImage={backgroundImage}>
      <SceneShell.Panel>
        <img
          src={IMAGE_ASSET_PATHS.lobby.titleModeSelect}
          alt="mode select"
          className="max-w-[20vw] mt-[7vh]"
        />
        <div className="grid grid-cols-1 md:max-w-[50vw] md:grid-cols-2 mb-[7vh]">
          <SceneShell.ImageButton
            imageSrc={buttonImages.quickMatch}
            label="빠른 대전"
            onClick={onQuickMatch}
            imageClassName="w-[20vw]"
          />
          <SceneShell.ImageButton
            imageSrc={buttonImages.vsCpu}
            label="VS CPU"
            onClick={onVsCpu}
            imageClassName="w-[20vw]"
          />
          <SceneShell.ImageButton
            imageSrc={buttonImages.createRoom}
            label="방 만들기"
            onClick={onCreateRoom}
            imageClassName="w-[20vw]"
          />
          <SceneShell.ImageButton
            imageSrc={buttonImages.joinRoom}
            label="참가하기"
            onClick={onJoinRoom}
            imageClassName="w-[20vw]"
          />
        </div>
      </SceneShell.Panel>
    </SceneShell>
  );
}
