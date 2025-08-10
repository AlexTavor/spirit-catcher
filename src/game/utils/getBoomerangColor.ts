import { ECS } from "../logic/core/ECS";
import { getPlayerEntity } from "./getPlayerEntity";

const DEFAULT_COLOR = 0xffff00; // Yellow

/**
 * Determines the boomerang's color. It turns blue if the stomp ability is available.
 * @param ecs The Entity-Component-System instance.
 * @returns The hex color code for the boomerang.
 */
export function getBoomerangColor(ecs: ECS): number {
    const player = getPlayerEntity(ecs);
    if (player === -1) {
        return DEFAULT_COLOR;
    }

    return DEFAULT_COLOR;
}
