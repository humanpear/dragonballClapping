import { SceneShell } from "../components/shell/SceneShell";

interface ResultScreenProps {
  backgroundImage: string;
  winner: "player" | "cpu" | null;
  playerWins: number;
  cpuWins: number;
  onRematch: () => void;
  onBackToLobby: () => void;
}

export function ResultScreen({
  backgroundImage,
  winner,
  playerWins,
  cpuWins,
  onRematch,
  onBackToLobby
}: ResultScreenProps) {
  return (
    <SceneShell backgroundImage={backgroundImage}>
      <SceneShell.Panel className="text-center">
        <h1 className="m-0 text-[clamp(2.2rem,6vw,3.4rem)] font-bold">
          {winner === "player" ? "승리" : "패배"}
        </h1>
        <p className="m-0 text-base">
          최종 스코어 {playerWins} : {cpuWins}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onRematch}
            className="h-11 min-w-[140px] cursor-pointer rounded-full border border-slate-300 bg-slate-900/80 px-4 font-bold text-white"
          >
            리매치
          </button>
          <button
            type="button"
            onClick={onBackToLobby}
            className="h-11 min-w-[140px] cursor-pointer rounded-full border border-slate-300 bg-slate-900/80 px-4 font-bold text-white"
          >
            로비 복귀
          </button>
        </div>
      </SceneShell.Panel>
    </SceneShell>
  );
}
