import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { advanceBattleClock, createTimedBattle } from "../game/battleClock";
import { getEnabledActionsByEnergy } from "../game/core";
import { BattleScreen } from "./BattleScreen";

describe("scheduled beat poses", () => {
  it.each([[1200, 1], [3199, 1], [3200, 2], [5199, 2], [5200, 3], [7200, 4]])("renders the scheduled pose at %ims", (now, beat) => {
    const battle = advanceBattleClock(createTimedBattle(0), now);
    const html = renderToStaticMarkup(<BattleScreen backgroundImage="" battle={battle}
      canInput={battle.beatIndex <= 2} enabledActions={getEnabledActionsByEnergy(battle.playerEnergy)} onSelectAction={() => {}} />);
    expect(battle.beatIndex).toBe(beat);
    if (beat <= 2) {
      expect(html).toContain(`player-beat${beat}.png`);
      expect(html).toContain(`enemy-beat${beat}.png`);
      expect(html.includes("enemy-beat2-right-arm.png")).toBe(beat === 2);
    } else {
      expect(html).not.toContain("enemy-beat2-right-arm.png");
      expect(html).toContain(beat === 3 ? "행동 공개" : "무승부");
      expect(battle.playerDisplayAction).toBe("ki");
      expect(battle.cpuDisplayAction).toBe("ki");
    }
  });
});
