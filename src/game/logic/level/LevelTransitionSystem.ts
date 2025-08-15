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
import { GameState } from "./GameState";
import { CommandBus } from "../../api/CommandBus";
import { GameCommands } from "../../consts/GameCommands";
import { getUpgradesState } from "../../utils/getUpgradesState";

/**
 * Handles the side-effects of game state transitions, such as resetting the game.
 */
export class LevelTransitionSystem extends System {
    public componentsRequired = new Set<Function>();
    private readonly WAVE_CLEAR_DELAY = 2000; // 2 seconds
    private readonly WAVE_STARTING_DELAY = 100; // 100 ms

    private readonly preWaveNotFoundWarning =
        "LevelTransitionSystem: PRE_WAVE state change received when not in PRE_WAVE state.";

    private readonly waveClearedStateWarning =
        "LevelTransitionSystem: WAVE_CLEARED state change received when not in WAVE_CLEARED state.";

    private readonly waveStartingStateWarning =
        "LevelTransitionSystem: WAVE_STARTING state change received when not in WAVE_STARTING state.";

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
            // -- Handle game state transitions
            case GameState.GAME_LOST:
            case GameState.GAME_WON:
                TimeManager.pause();
                break;

            case GameState.PRE_GAME:
                this.resetGame();
                TimeManager.resume();

                CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {
                    newState: GameState.PRE_WAVE,
                });

                break;

            // -- Handle wave state transitions
            case GameState.PRE_WAVE:
                {
                    const lvl = getLevelState(this.ecs);
                    if (!lvl || lvl.gameState !== GameState.PRE_WAVE) {
                        console.warn(this.preWaveNotFoundWarning);
                        return;
                    }
                    lvl.waveNumber++;
                    lvl.stateTimer = 1; // Set a short timer
                    lvl.isWaveGenerated = false;
                }
                break;
            case GameState.WAVE_STARTING:
                {
                    const lvl = getLevelState(this.ecs);
                    if (!lvl || lvl.gameState !== GameState.WAVE_STARTING) {
                        console.warn(this.waveStartingStateWarning);
                        return;
                    }

                    lvl.stateTimer = this.WAVE_STARTING_DELAY;
                }
                break;
            case GameState.WAVE_CLEARED:
                {
                    const lvl = getLevelState(this.ecs);
                    if (!lvl || lvl.gameState !== GameState.WAVE_CLEARED) {
                        console.warn(this.waveClearedStateWarning);
                        return;
                    }

                    lvl.stateTimer = this.WAVE_CLEAR_DELAY;
                }
                break;
        }
    }

    private resetGame(): void {
        CommandBus.emit(GameCommands.RESET_UPGRADES);
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
        lvl.isWaveGenerated = false;

        // Clean up any existing spirit spawn state entities
        const spawnStates = this.ecs.getEntitiesWithComponent(SpiritSpawnState);
        for (const state of spawnStates) {
            this.ecs.removeEntity(state);
        }

        // Clean up upgrades
        const up = getUpgradesState(this.ecs);
        up.upgrades = {};
    }

    public update(): void {
        // This system is entirely event-driven.
    }
}
