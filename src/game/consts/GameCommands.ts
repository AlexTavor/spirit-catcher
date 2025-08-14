import { Pos } from "../../utils/Math";
import { GameState } from "../logic/level/GameState";
import { ProjectileType } from "../logic/projectile/ProjectileType";
import { PlayerUpgradeType } from "../logic/upgrades/PlayerUpgradeType";

export enum GameCommands {
    ThrowBoomerangCommand = "ThrowBoomerangCommand",
    START_GAME_COMMAND = "START_GAME_COMMAND",
    TRANSITION_TO_STATE = "TRANSITION_TO_STATE",
    UPGRADE_PLAYER = "UPGRADE_PLAYER",
    RESET_UPGRADES = "RESET_UPGRADES",
    SPAWN_PROJECTILE = "SPAWN_PROJECTILE",
}

/**
 * The data payload for a TRANSITION_TO_STATE command.
 */
export interface TransitionToStatePayload {
    newState: GameState;
}

/**
 * The data payload for an UPGRADE_PLAYER command.
 */
export interface UpgradePlayerPayload {
    type: PlayerUpgradeType;
}

export interface SpawnProjectilePayload {
    type: ProjectileType;
    origin: Pos;
}
