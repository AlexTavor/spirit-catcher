import { CommandBus } from "../../api/CommandBus";
import { GameCommands } from "../../consts/GameCommands";
import { System, Entity } from "../core/ECS";
import { Spirit } from "../spirits/components/Spirit";
import { SpiritSpawnState } from "../spirits/components/SpiritSpawnState";
import { LevelState } from "./LevelState";
import { GameState } from "./GameState";

export class LevelProgressionDetectionSystem extends System {
    public componentsRequired = new Set<Function>([LevelState]);

    public update(entities: Set<Entity>, _: number): void {
        for (const entity of entities) {
            const lvl = this.ecs.getComponent(entity, LevelState);
            if (!lvl) continue;

            if (lvl.gameState !== GameState.WAVE_ACTIVE) {
                continue; // Only operate when the wave is active
            }

            if (this.detectGameLost(lvl)) {
                this.handleGameLost(lvl);
            } else if (this.detectWaveOver(lvl)) {
                this.handleWaveOver(lvl);
            }
        }
    }

    private handleWaveOver(lvl: LevelState) {
        if (lvl.waveNumber >= lvl.data.waves.length) {
            this.handleGameWon(lvl);
        } else {
            this.handleWaveCleared(lvl);
        }
    }

    detectGameLost(lvl: LevelState) {
        return lvl.spiritsMissed >= lvl.maxSpiritMisses;
    }

    handleGameLost(_lvl: LevelState) {
        CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {
            newState: GameState.GAME_LOST,
        });
    }

    detectWaveOver(_lvl: LevelState) {
        const hasSpawnStates =
            this.ecs.getEntitiesWithComponent(SpiritSpawnState).length > 0;

        if (hasSpawnStates) return false;

        const hasSpiritsOnBoard =
            this.ecs.getEntitiesWithComponent(Spirit).length > 0;

        return !hasSpiritsOnBoard;
    }

    handleGameWon(_lvl: LevelState) {
        CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {
            newState: GameState.GAME_WON,
        });
    }

    handleWaveCleared(_lvl: LevelState) {
        CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {
            newState: GameState.WAVE_CLEARED,
        });
    }

    public destroy(): void {}
}
