import { PlayerUpgradeType } from "./PlayerUpgradeType";

/**
 * Defines the static properties of a player upgrade.
 */
export interface UpgradeDefinition {
    /** The unique identifier for the upgrade. */
    readonly type: PlayerUpgradeType;
    /** The maximum number of times this upgrade can be acquired. Use -1 for infinite. */
    readonly maxLevel: number;
    /** The base selection weight. Higher numbers are more common. */
    readonly weight: number;
    /** The title of the upgrade card. */
    readonly title: string;
    /** The description of the upgrade card. */
    readonly description: string;
}

export const allUpgradeDefinitions: UpgradeDefinition[] = [
    {
        type: PlayerUpgradeType.UP_RANG_SIZE,
        maxLevel: 4,
        weight: 100,
        title: "Bigger 'Rang",
        description: "Increases the size of your boomerang.",
    },
    {
        type: PlayerUpgradeType.UP_MAX_HEALTH,
        maxLevel: -1,
        weight: 100,
        title: "Fortify",
        description: "Increases your maximum health by 10%.",
    },
    {
        type: PlayerUpgradeType.HEAL,
        maxLevel: -1,
        weight: 80,
        title: "Heal",
        description: "Restores 50% of your maximum health.",
    },
    {
        type: PlayerUpgradeType.CAUGHT_RANG_PROJECTILE,
        maxLevel: 5,
        weight: 50,
        title: "Homing Shots",
        description: "Catching a fast 'rang fires a homing shot at a spirit.",
    },
    {
        type: PlayerUpgradeType.CAUGHT_RANG_EXPLOSION,
        maxLevel: 3,
        weight: 40,
        title: "Impact Nova",
        description: "Catching a fast 'rang creates a damaging explosion.",
    },
];
