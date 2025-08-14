import { ConfigManager } from "../../../consts/ConfigManager";
import { ECS, Entity } from "../../core/ECS";
import { StatCalculator } from "../../core/modifiers/StatCalculator";
import { ModifiableStat } from "./ModifiableStat";

/**
 * Values class provides methods to retrieve effective values for modifiable stats.
 * It uses the ECS to access the player's entity and calculate the effective stats based on modifiers.
 */
export class Values {
    public static get(ecs: ECS, entity: Entity, stat: ModifiableStat): number {
        const config = ConfigManager.get();

        switch (stat) {
            case ModifiableStat.BOOMERANG_SIZE:
                return StatCalculator.getEffectiveStat(
                    ecs,
                    entity,
                    stat,
                    config.BoomerangWidth,
                );
            case ModifiableStat.MAX_HEALTH:
                return StatCalculator.getEffectiveStat(
                    ecs,
                    entity,
                    stat,
                    config.MaxHealth,
                );
            default:
                throw new Error(`Unknown modifiable stat: ${stat}`);
        }
    }
}
