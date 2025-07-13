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
 * The single source of truth for level state. It listens for commands
 * and directs state changes based on game events.
 */
export class LevelDirectorSystem extends System {
    public componentsRequired = new Set<Function>();

    private readonly WAVE_CLEAR_DELAY = 2000; // 2 seconds

    constructor() {
        super();
        EventBus.on(GameEvent.GAME_READY, this.start, this);
    }

    private start(): void {
        // Listen for commands to change state.
        CommandBus.on(
            GameCommands.TRANSITION_TO_STATE,
            this.handleTransitionTo,
            this,
        );
        // Listen for the command from WaveAdvanceSystem.
        CommandBus.on(
            GameCommands.ADVANCE_WAVE_COMMAND,
            this.handleAdvanceWave,
            this,
        );

        // Command the initial state.
        this.handleTransitionTo({
            newState: LevelState.PRE_GAME,
        });
    }

    public update(_entities: Set<Entity>, delta: number): void {
        const mobsState = getMobsState(this.ecs);
        if (!mobsState) return;

        switch (mobsState.state) {
            case LevelState.WAVE_ACTIVE:
                // If there are no more mobs, the wave is fully cleared.
                if (this.ecs.getEntitiesWithComponent(Mob).length === 0) {
                    this.handleTransitionTo({
                        newState: LevelState.WAVE_CLEARED,
                    });
                }
                break;

            case LevelState.WAVE_CLEARED:
                // After a delay, command a transition to the next wave.
                mobsState.stateTimer -= delta;
                if (mobsState.stateTimer <= 0) {
                    this.handleTransitionTo({
                        newState: LevelState.PRE_WAVE,
                    });
                }
                break;
        }
    }

    private handleAdvanceWave(): void {
        this.handleTransitionTo({ newState: LevelState.ADVANCE_WAVE });
    }

    private handleTransitionTo(payload: TransitionToStatePayload): void {
        const { newState } = payload;
        const mobsState = getMobsState(this.ecs);
        if (!mobsState || mobsState.state === newState) return;

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
        EventBus.removeListener(GameEvent.GAME_READY, this.start, this);
        CommandBus.removeListener(
            GameCommands.TRANSITION_TO_STATE,
            this.handleTransitionTo,
            this,
        );
        CommandBus.removeListener(
            GameCommands.ADVANCE_WAVE_COMMAND,
            this.handleAdvanceWave,
            this,
        );
    }
}
