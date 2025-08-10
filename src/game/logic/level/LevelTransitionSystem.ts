import { EventBus } from "../../api/EventBus";
import { GameEvents, WaveStateChangeEvent } from "../../consts/GameEvents";
import { getLevelState } from "../../utils/getLevelState";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { System } from "../core/ECS";
import { TimeManager } from "../core/time/TimeManager";
import { Boomerang } from "../boomerang/components/Boomerang";
import { HasBoomerang } from "../player/components/HasBoomerang";
import { Spirit } from "../spirits/components/Spirit";
import { SpiritSpawnState } from "../spirits/components/SpiritSpawnState";
import { WaveState } from "./WaveState";
import { CommandBus } from "../../api/CommandBus";
import { GameCommands } from "../../consts/GameCommands";

/**
 * Handles the side-effects of major level state transitions, such as resetting the game.
 */
export class LevelTransitionSystem extends System {
    public componentsRequired = new Set<Function>();

    constructor() {
        super();
        EventBus.on(GameEvents.WAVE_STATE_CHANGE, this.handleStateChange, this);
    }

    public destroy(): void {
        EventBus.removeListener(
            GameEvents.WAVE_STATE_CHANGE,
            this.handleStateChange,
            this,
        );
    }

    private handleStateChange(data: WaveStateChangeEvent): void {
        switch (data.newState) {
            case WaveState.GAME_LOST:
            case WaveState.GAME_WON:
                TimeManager.pause();
                break;

            case WaveState.PRE_GAME:
                this.resetGame();
                TimeManager.resume();

                CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {
                    newState: WaveState.PRE_WAVE,
                });

                break;
        }
    }

    private resetGame(): void {
        // Remove all existing spirit entities
        const spirits = this.ecs.getEntitiesWithComponent(Spirit);
        for (const spirit of spirits) {
            this.ecs.removeEntity(spirit);
        }

        // Remove all existing boomerang entities
        const boomerangs = this.ecs.getEntitiesWithComponent(Boomerang);
        for (const boomerang of boomerangs) {
            this.ecs.removeEntity(boomerang);
        }

        // Ensure the player starts with a boomerang
        const player = getPlayerEntity(this.ecs);
        if (player !== -1 && !this.ecs.hasComponent(player, HasBoomerang)) {
            this.ecs.addComponent(player, new HasBoomerang());
        }

        // Reset the core level progression state
        const lvl = getLevelState(this.ecs);
        lvl.waveNumber = 0;
        lvl.spiritsCollected = 0;
        lvl.spiritsMissed = 0;
        lvl.stateTimer = 0;

        // Clean up any existing spirit spawn state entities
        const spawnStates = this.ecs.getEntitiesWithComponent(SpiritSpawnState);
        for (const state of spawnStates) {
            this.ecs.removeEntity(state);
        }
    }

    public update(): void {
        // This system is entirely event-driven.
    }
}
