import { System, Entity } from "../core/ECS";
import { TimeManager } from "../core/time/TimeManager";
import { WaveState } from "./WaveState";
import { CommandBus } from "../../api/CommandBus";
import {
    GameCommands,
    TransitionToStatePayload,
} from "../../consts/GameCommands";
import { EventBus } from "../../api/EventBus";
import { GameEvents, WaveStateChangeEvent } from "../../consts/GameEvents";
import { getLevelState } from "../../utils/getLevelState";
import { LevelState } from "./LevelState";

/**
 * The single source of truth for level state. It listens for commands
 * and directs state changes based on game events.
 */
export class LevelDirectorSystem extends System {
    public componentsRequired = new Set<Function>();

    private readonly WAVE_CLEAR_DELAY = 2000; // 2 seconds

    constructor() {
        super();
        EventBus.on(GameEvents.GAME_READY, this.start, this);
    }

    private start(): void {
        // Listen for commands to change state.
        CommandBus.on(
            GameCommands.TRANSITION_TO_STATE,
            this.handleTransitionTo,
            this,
        );

        // Command the initial state.
        this.handleTransitionTo({
            newState: WaveState.PRE_GAME,
        });
    }

    public update(_entities: Set<Entity>, delta: number): void {
        const lvl = getLevelState(this.ecs);
        if (!lvl) return;

        switch (lvl.waveState) {
            case WaveState.WAVE_CLEARED:
                // After a delay, command a transition to the next wave.
                this.updateWaveCleared(lvl, delta);
                break;
            case WaveState.WAVE_STARTING:
                // Handle the pre-wave state, which is a transition state.
                this.updateWaveStarting(lvl, delta);
                break;
            case WaveState.PRE_WAVE:
                this.handleTransitionTo({
                    newState: WaveState.WAVE_STARTING,
                });
                break;
        }
    }

    private updateWaveStarting(lvl: LevelState, delta: number) {
        lvl.stateTimer -= delta;
        if (lvl.stateTimer <= 0) {
            this.handleTransitionTo({
                newState: WaveState.WAVE_ACTIVE,
            });
        }
    }

    private updateWaveCleared(lvl: LevelState, delta: number) {
        lvl.stateTimer -= delta;
        if (lvl.stateTimer <= 0) {
            this.handleTransitionTo({
                newState: WaveState.PRE_WAVE,
            });
        }
    }

    private handleTransitionTo(payload: TransitionToStatePayload): void {
        const { newState } = payload;
        const lvl = getLevelState(this.ecs);
        if (!lvl || lvl.waveState === newState) return;

        lvl.waveState = newState;

        // Handle side-effects of entering the new state.
        switch (newState) {
            case WaveState.PRE_GAME:
                TimeManager.pause();
                lvl.waveNumber = 0;
                break;

            case WaveState.PRE_WAVE:
                lvl.waveNumber++;
                break;

            case WaveState.WAVE_CLEARED:
                lvl.stateTimer = this.WAVE_CLEAR_DELAY;
                break;
        }

        console.log(
            `Transitioning to state: ${WaveState[newState]}, wave number: ${lvl.waveNumber}`,
        );

        // Broadcast the state change to any interested listeners (like the UI).
        EventBus.emit(GameEvents.WAVE_STATE_CHANGE, {
            newState: lvl.waveState,
            waveNumber: lvl.waveNumber,
        } as WaveStateChangeEvent);
    }

    public destroy(): void {
        EventBus.removeListener(GameEvents.GAME_READY, this.start, this);
        CommandBus.removeListener(
            GameCommands.TRANSITION_TO_STATE,
            this.handleTransitionTo,
            this,
        );
    }
}
