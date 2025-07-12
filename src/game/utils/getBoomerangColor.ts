import { ConfigManager } from "../api/ConfigManager";
import { ECS } from "../logic/core/ECS";
import { HasBoomerang } from "../logic/player/components/HasBoomerang";
import { Mana } from "../logic/player/components/Mana";
import { getPlayerEntity } from "./getPlayerEntity";

const DEFAULT_COLOR = 0xffff00; // Yellow
const STOMP_READY_COLOR = 0x6495ed; // Cornflower Blue

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

    // Stomp is only available when the player does NOT have the boomerang.
    const canStomp = !ecs.hasComponent(player, HasBoomerang);
    if (!canStomp) {
        return DEFAULT_COLOR;
    }

    const mana = ecs.getComponent(player, Mana);
    const cost = ConfigManager.get().StompManaCost;

    // If mana exists and is sufficient for a stomp, change color.
    if (mana && mana.current >= cost) {
        return STOMP_READY_COLOR;
    }

    return DEFAULT_COLOR;
}
