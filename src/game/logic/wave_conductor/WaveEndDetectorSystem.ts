import { CommandBus } from "../../api/CommandBus";
import { getLevelState } from "../../utils/getLevelState";
import { Entity, System } from "../core/ECS";
import { GameState } from "../level/GameState";
import { Spirit } from "../spirits/components/Spirit";
import { ActiveConductorState } from "./WaveConductorSystem";
import { GameCommands } from "../../consts/GameCommands";

export class WaveEndDetectorSystem extends System {
    public componentsRequired = new Set<Function>([]);

    public update(_entities: Set<Entity>, _delta: number): void {
        const lvl = getLevelState(this.ecs);
        if (!lvl || lvl.gameState !== GameState.WAVE_ACTIVE) return;

        // Check if all spawners are inactive and no spirits are left
        const conductorState = this.ecs.getComponent(
            this.ecs.world,
            ActiveConductorState,
        );

        const hasSpawners = conductorState.activeSpawners.length > 0;
        const hasSpirits = this.ecs.getEntitiesWithComponent(Spirit).length > 0;

        if (!hasSpawners && !hasSpirits) {
            CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {
                newState: GameState.WAVE_CLEARED,
            });
        }
    }

    public destroy(): void {}
}
