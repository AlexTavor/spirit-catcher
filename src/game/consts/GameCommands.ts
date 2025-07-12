import { LevelState } from "../logic/level/LevelState";

export enum GameCommands {
    ThrowBoomerangCommand = "ThrowBoomerangCommand",
    START_GAME_COMMAND = "START_GAME_COMMAND",
    TRANSITION_TO_STATE = "TRANSITION_TO_STATE",
    STOMP_COMMAND = "STOMP_COMMAND",
}

/**
 * The data payload for a TRANSITION_TO_STATE command.
 */
export interface TransitionToStatePayload {
    newState: LevelState;
}
