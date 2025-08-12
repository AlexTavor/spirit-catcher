import { System, Entity } from "../core/ECS";
import { GameState } from "./GameState";
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
 * LevelDirectorSystem manages the state transitions of the game level.
 * It listens for commands to transition between different wave states,
 * handles the timing of state changes, and broadcasts state changes to
 * interested listeners (like the UI).
 */
export class LevelDirectorSystem extends System {
    public componentsRequired = new Set<Function>();

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
            newState: GameState.PRE_GAME,
        });
    }

    public update(_entities: Set<Entity>, delta: number): void {
        const lvl = getLevelState(this.ecs);
        if (!lvl) return;

        switch (lvl.gameState) {
            case GameState.WAVE_CLEARED:
                // After a delay, command a transition to the next wave.
                this.updateWaveCleared(lvl, delta);
                break;
            case GameState.WAVE_STARTING:
                // Handle the pre-wave state, which is a transition state.
                this.updateWaveStarting(lvl, delta);
                break;
            case GameState.PRE_WAVE:
                this.updatePreWave(lvl, delta);
                break;
        }
    }

    private updatePreWave(lvl: LevelState, delta: number) {
        lvl.stateTimer -= delta;
        if (lvl.stateTimer <= 0) {
            lvl.stateTimer = 0;

            const isFirstWave = lvl.waveNumber === 1;
            CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {
                newState: isFirstWave
                    ? GameState.WAVE_STARTING
                    : GameState.UPGRADE_PLAYER,
            });
        }
    }

    private updateWaveStarting(lvl: LevelState, delta: number) {
        lvl.stateTimer -= delta;
        if (lvl.stateTimer <= 0) {
            lvl.stateTimer = 0;

            this.handleTransitionTo({
                newState: GameState.WAVE_ACTIVE,
            });
        }
    }

    private updateWaveCleared(lvl: LevelState, delta: number) {
        lvl.stateTimer -= delta;
        if (lvl.stateTimer <= 0) {
            lvl.stateTimer = 0;

            this.handleTransitionTo({
                newState: GameState.PRE_WAVE,
            });
        }
    }

    private handleTransitionTo(payload: TransitionToStatePayload): void {
        const { newState } = payload;
        const lvl = getLevelState(this.ecs);
        if (!lvl || lvl.gameState === newState) return;

        lvl.gameState = newState;

        console.log(
            `Transitioning to state: ${GameState[newState]}, wave number: ${lvl.waveNumber}`,
        );

        // Broadcast the state change to any interested listeners (like the UI).
        EventBus.emit(GameEvents.WAVE_STATE_CHANGE, {
            newState: lvl.gameState,
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
