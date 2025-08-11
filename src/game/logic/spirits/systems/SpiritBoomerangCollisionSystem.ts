import { System, Entity } from "../../core/ECS";
import { Transform } from "../../core/components/Transform";
import { Spirit } from "../components/Spirit";
import { ConfigManager } from "../../../consts/ConfigManager";
import { Boomerang } from "../../boomerang/components/Boomerang";
import { EventBus } from "../../../api/EventBus";
import { GameEvents } from "../../../consts/GameEvents";
import { ModifiableStat } from "../../upgrades/ModifiableStat";
import { Values } from "../../upgrades/Values";

export class SpiritBoomerangCollisionSystem extends System {
    public componentsRequired = new Set<Function>([Spirit, Transform]);

    public update(spirits: Set<Entity>): void {
        const boomerangEntities = this.ecs.getEntitiesWithComponent(Boomerang);
        if (boomerangEntities.length === 0) {
            return;
        }

        // Get all boomerang transforms once before looping through spirits.
        const boomerangTransforms = boomerangEntities.map((b) =>
            this.ecs.getComponent(b, Transform),
        );

        // Calculate the squared collision distance for this frame.
        const config = ConfigManager.get();
        const size = Values.get(
            this.ecs,
            this.ecs.world,
            ModifiableStat.BOOMERANG_SIZE,
        );

        const collisionRadius = config.MobWidth / 2 + size / 2;
        const collisionDistanceSq = collisionRadius * collisionRadius;

        for (const spirit of spirits) {
            const spiritTransform = this.ecs.getComponent(spirit, Transform);

            for (const boomerangTransform of boomerangTransforms) {
                const dx = spiritTransform.pos.x - boomerangTransform.pos.x;
                const dy = spiritTransform.pos.y - boomerangTransform.pos.y;
                const distanceSq = dx * dx + dy * dy;

                if (distanceSq <= collisionDistanceSq) {
                    this.ecs.removeEntity(spirit);
                    EventBus.emit(GameEvents.SPIRIT_COLLECTED);
                    break;
                }
            }
        }
    }

    destroy(): void {}
}
