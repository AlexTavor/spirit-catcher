import { CommandBus } from "../../api/CommandBus";
import { GameCommands } from "../../consts/GameCommands";
import { getLevelState } from "../../utils/getLevelState";
import { System, Entity } from "../core/ECS";
import { GameState } from "./GameState";

export class GameLostDetectionSystem extends System {
    public componentsRequired = new Set<Function>([]);

    public update(_entities: Set<Entity>, _delta: number): void {
        const lvl = getLevelState(this.ecs);
        if (!lvl || lvl.gameState !== GameState.WAVE_ACTIVE) return;

        if (lvl.spiritsMissed >= lvl.maxSpiritMisses) {
            CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {
                newState: GameState.GAME_LOST,
            });
        }
    }

    public destroy(): void {}
}
