import { LevelState } from "../logic/level/LevelState";
import { GameState } from "../logic/level/GameState";

export enum GameEvents {
    CANVAS_RESIZED = "CANVAS_RESIZED",
    WAVE_STATE_CHANGE = "WAVE_STATE_CHANGE",
    GAME_READY = "GAME_READY",
    SPIRIT_COLLECTED = "SPIRIT_COLLECTED",
    SPIRIT_MISSED = "SPIRIT_MISSED",
    LEVEL_STATE_CHANGE = "LEVEL_STATE_CHANGE",
    RANG_QUICK_FALL_CAUGHT = "RANG_QUICK_FALL_CAUGHT",
    UPGRADE_SHORTLIST_CHANGED = "UPGRADE_SHORTLIST_CHANGED",
}

/**
 * The data payload sent with a WAVE_STATE_CHANGE.
 */
export interface WaveStateChangeEvent {
    newState: GameState;
    waveNumber: number;
}

/**
 * The data payload sent with a LEVEL_STATE_CHANGE.
 */
export interface LevelStateChangeEvent {
    newState: LevelState;
}

/**
 * The data payload sent with a RANG_QUICK_FALL_CAUGHT.
 */
export interface BoomerangQuickFallCaughtPayload {
    entityId: number;
}
