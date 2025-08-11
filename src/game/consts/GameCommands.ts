import { GameState } from "../logic/level/GameState";

export enum GameCommands {
    ThrowBoomerangCommand = "ThrowBoomerangCommand",
    START_GAME_COMMAND = "START_GAME_COMMAND",
    TRANSITION_TO_STATE = "TRANSITION_TO_STATE",
    UPGRADE_PLAYER = "UPGRADE_PLAYER",
    RESET_UPGRADES = "RESET_UPGRADES",
}

/**
 * The data payload for a TRANSITION_TO_STATE command.
 */
export interface TransitionToStatePayload {
    newState: GameState;
}

export enum PlayerUpgradeType {
    UP_RANG_SIZE = "upRangSize",
    UP_MAX_HEALTH = "upMaxHealth",
    HEAL = "heal",
}

/**
 * The data payload for an UPGRADE_PLAYER command.
 */
export interface UpgradePlayerPayload {
    type: PlayerUpgradeType;
}
