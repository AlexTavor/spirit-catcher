import { ConfigManager } from "../../../consts/ConfigManager";
import { Transform } from "../../core/components/Transform";
import { Velocity } from "../../core/components/Velocity";
import { System, Entity } from "../../core/ECS";
import { ModifiableStat } from "../../upgrades/ModifiableStat";
import { Values } from "../../upgrades/Values";
import { HitWallFlag } from "../components/HitWallFlag";

export class WallCollisionBounceSystem extends System {
    public componentsRequired = new Set<Function>([
        HitWallFlag,
        Velocity,
        Transform,
    ]);

    public update(entities: Set<Entity>): void {
        const config = ConfigManager.get();

        for (const entity of entities) {
            const velocity = this.ecs.getComponent(entity, Velocity);
            // Invert horizontal velocity and apply restitution
            velocity.x *= -config.BoomerangWallBounce;

            const flag = this.ecs.getComponent(entity, HitWallFlag);
            const transform = this.ecs.getComponent(entity, Transform);

            const size =
                Values.get(
                    this.ecs,
                    this.ecs.world,
                    ModifiableStat.BOOMERANG_SIZE,
                ) / 2;

            if (flag.hitLeft) {
                transform.pos.x = size;
            } else {
                transform.pos.x = config.GameWidth - size;
            }
        }
    }

    destroy() {}
}
