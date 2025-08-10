import { WaveState } from "../logic/level/WaveState";

export enum GameCommands {
    ThrowBoomerangCommand = "ThrowBoomerangCommand",
    START_GAME_COMMAND = "START_GAME_COMMAND",
    TRANSITION_TO_STATE = "TRANSITION_TO_STATE",
}

/**
 * The data payload for a TRANSITION_TO_STATE command.
 */
export interface TransitionToStatePayload {
    newState: WaveState;
}
