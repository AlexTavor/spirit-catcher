import { CommandBus } from "../../api/CommandBus";
import { GameCommands } from "../../consts/GameCommands";
import { System } from "../core/ECS";
import { TimeManager } from "../core/time/TimeManager";
import { LevelState } from "../level/LevelState";
import { MobsState } from "../level/MobsState";

/**
 * Listens for high-level commands issued from the UI layer and
 * translates them into game state changes.
 */
export class UICommandSystem extends System {
    public componentsRequired = new Set<Function>();

    constructor() {
        super();
        CommandBus.on(
            GameCommands.START_GAME_COMMAND,
            this.handleStartGame,
            this,
        );
    }

    public override destroy(): void {
        CommandBus.removeListener(
            GameCommands.START_GAME_COMMAND,
            this.handleStartGame,
            this,
        );
    }

    private handleStartGame(): void {
        const mobsState = this.ecs.getComponent(this.ecs.world, MobsState);
        if (!mobsState || mobsState.state !== LevelState.PRE_GAME) {
            // Do nothing if the game is already started.
            return;
        }

        // Unpause the game and transition to the first wave.
        TimeManager.resume();

        CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {
            newState: LevelState.PRE_WAVE,
        });
    }

    public update(): void {
        // This system is entirely event-driven.
    }
}
