import { LevelState } from "../logic/level/LevelState";

export enum GameEvent {
    CANVAS_RESIZED_EVENT = "CANVAS_RESIZED_EVENT",
    MOBS_STATE_CHANGE_EVENT = "MOBS_STATE_CHANGE_EVENT",
    GAME_READY = "GAME_READY",
}

/**
 * The data payload sent with a MOBS_STATE_CHANGE_EVENT.
 */
export interface MobsStateChangeEvent {
    newState: LevelState;
    waveNumber: number;
}
