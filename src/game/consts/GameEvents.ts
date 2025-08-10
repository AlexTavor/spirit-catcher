import { LevelState } from "../logic/level/LevelState";
import { WaveState } from "../logic/level/WaveState";

export enum GameEvents {
    CANVAS_RESIZED = "CANVAS_RESIZED",
    WAVE_STATE_CHANGE = "WAVE_STATE_CHANGE",
    GAME_READY = "GAME_READY",
    SPIRIT_COLLECTED = "SPIRIT_COLLECTED",
    SPIRIT_MISSED = "SPIRIT_MISSED",
    LEVEL_STATE_CHANGE = "LEVEL_STATE_CHANGE",
}

/**
 * The data payload sent with a WAVE_STATE_CHANGE.
 */
export interface WaveStateChangeEvent {
    newState: WaveState;
    waveNumber: number;
}

export interface LevelStateChangeEvent {
    newState: LevelState;
}
