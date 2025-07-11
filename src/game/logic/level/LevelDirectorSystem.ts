import { System, Entity } from "../core/ECS";
import { TimeManager } from "../core/time/TimeManager";
import { Mob } from "../mobs/components/Mob";
import { LevelState } from "./LevelState";
import { CommandBus } from "../../api/CommandBus";
import {
    GameCommands,
    TransitionToStatePayload,
} from "../../consts/GameCommands";
import { EventBus } from "../../api/EventBus";
import { GameEvent, MobsStateChangeEvent } from "../../consts/GameUIEvent";
import { getMobsState } from "../../utils/getMobsState";

/**
 * The single source of truth for level state. It listens for commands to change
 * state and broadcasts those changes. It also directs state changes based on
 * game events (e.g., all mobs defeated).
 */
export class LevelDirectorSystem extends System {
    public componentsRequired = new Set<Function>();

    private readonly WAVE_CLEAR_DELAY = 2000; // 2 seconds

    constructor() {
        super();
        EventBus.on(GameEvent.GAME_READY, this.start, this);
        // Start listening for state transition commands.
    }

    private start(): void {
        CommandBus.on(
            GameCommands.TRANSITION_TO_STATE,
            this.handleTransitionTo,
            this,
        );

        // Command the initial state. This ensures all state changes,
        // including the first, are handled by the same logic path.
        this.handleTransitionTo({
            newState: LevelState.PRE_GAME,
        });
    }

    public update(_entities: Set<Entity>, delta: number): void {
        const mobsState = getMobsState(this.ecs);
        if (!mobsState) return;

        // --- State-based progression logic ---
        switch (mobsState.state) {
            case LevelState.WAVE_ACTIVE:
                // If there are no more mobs, command the state to change.
                if (this.ecs.getEntitiesWithComponent(Mob).length === 0) {
                    this.handleTransitionTo({
                        newState: LevelState.WAVE_CLEARED,
                    });
                }
                break;
            case LevelState.WAVE_CLEARED:
                // Wait for a delay, then command a transition to the next wave.
                mobsState.stateTimer -= delta;
                if (mobsState.stateTimer <= 0) {
                    this.handleTransitionTo({
                        newState: LevelState.PRE_WAVE,
                    });
                }
                break;
        }
    }

    /**
     * Handles the command to change the level's state and executes all
     * side-effects associated with entering the new state.
     * @param payload The command payload with the new state.
     */
    private handleTransitionTo(payload: TransitionToStatePayload): void {
        const { newState } = payload;
        const mobsState = getMobsState(this.ecs);
        if (!mobsState) return;

        // Prevent redundant state changes.
        if (mobsState.state === newState) return;

        mobsState.state = newState;

        // Handle side-effects of entering the new state.
        switch (newState) {
            case LevelState.PRE_GAME:
                TimeManager.pause();
                mobsState.waveNumber = 0;
                break;

            case LevelState.PRE_WAVE:
                mobsState.waveNumber++;
                break;

            case LevelState.WAVE_CLEARED:
                mobsState.stateTimer = this.WAVE_CLEAR_DELAY;
                break;
        }

        // Broadcast the state change to any interested listeners (like the UI).
        EventBus.emit(GameEvent.MOBS_STATE_CHANGE_EVENT, {
            newState: mobsState.state,
            waveNumber: mobsState.waveNumber,
        } as MobsStateChangeEvent);
    }

    public destroy(): void {
        CommandBus.removeListener(
            GameCommands.TRANSITION_TO_STATE,
            this.handleTransitionTo,
            this,
        );

        EventBus.removeListener(GameEvent.GAME_READY, this.start, this);
    }
}
