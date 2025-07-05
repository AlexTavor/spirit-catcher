import { ConfigManager } from "../../api/ConfigManager";
import { ChargeIntention } from "./ChargeIntention";
import { Charging } from "../components/Charging";
import { TargetIndicator } from "../components/TargetIndicator";
import { Transform } from "../components/Transform";
import { System, Entity } from "../core/ECS";
import { IsCharging } from "../player/components/IsCharging";
import { Player } from "../player/components/Player";

export class ChargeIntentionSystem extends System {
    public componentsRequired = new Set<Function>([Player, ChargeIntention]);

    public update(entities: Set<number>): void {
        for (const entity of entities) {
            const chargeIntention = this.ecs.getComponent(
                entity,
                ChargeIntention,
            );
            const isCharging = this.ecs.getComponent(entity, IsCharging);

            if (chargeIntention.active && !isCharging) {
                // Intention is active, but not charging. Start charging.
                this.startCharging(entity);
            } else if (!chargeIntention.active && isCharging) {
                // Intention is not active, but we are charging. Stop charging.
                this.stopCharging(entity, isCharging);
            }
        }
    }

    private startCharging(player: Entity): void {
        const config = ConfigManager.get();
        const indicatorEntity = this.ecs.addEntity();

        // Add components to the new indicator entity
        const transform = new Transform();
        transform.pos = {
            x: config.GameWidth / 2,
            y: 0,
        };
        this.ecs.addComponent(indicatorEntity, transform);
        this.ecs.addComponent(indicatorEntity, new TargetIndicator());

        const charging = new Charging();
        charging.maxLevel = config.ChargeMaxLevel;
        charging.chargeRate = config.ChargeRate;
        this.ecs.addComponent(indicatorEntity, charging);

        // Add IsCharging component to the player, linking to the indicator
        const isCharging = new IsCharging();
        isCharging.indicatorEntityId = indicatorEntity;
        this.ecs.addComponent(player, isCharging);
    }

    private stopCharging(player: Entity, isCharging: IsCharging): void {
        // Clean up indicator entity and player's charging state
        if (this.ecs.hasEntity(isCharging.indicatorEntityId)) {
            this.ecs.removeEntity(isCharging.indicatorEntityId);
        }
        this.ecs.removeComponent(player, IsCharging);
    }

    public destroy(): void {}
}
