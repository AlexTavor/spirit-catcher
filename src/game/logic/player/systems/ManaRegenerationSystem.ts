import { System, Entity } from "../../core/ECS";
import { ConfigManager } from "../../../api/ConfigManager";
import { Player } from "../components/Player";
import { Mana } from "../components/Mana";

/**
 * Handles passive regeneration of the player's mana over time.
 */
export class ManaRegenSystem extends System {
    public componentsRequired = new Set<Function>([Player, Mana]);

    public update(entities: Set<Entity>, delta: number): void {
        const config = ConfigManager.get();
        const regenRate = config.ManaRegenPerSecond;
        if (!regenRate || regenRate <= 0) return;

        const manaGain = regenRate * (delta / 1000);

        for (const player of entities) {
            const mana = this.ecs.getComponent(player, Mana);
            if (mana.current < mana.max) {
                mana.current = Math.min(mana.max, mana.current + manaGain);
            }
        }
    }

    public destroy(): void {}
}
