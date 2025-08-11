import { Pos } from "../../../utils/Math";
import { ConfigManager } from "../../consts/ConfigManager";
import { Transform } from "../core/components/Transform";
import { ECS, Entity } from "../core/ECS";
import { Explosion } from "../explosion/Explosion";

/**
 * Creates an explosion entity with the necessary components.
 * @param ecs The ECS instance.
 * @param pos The position of the explosion.
 * @param force The normalized force (0-1) of the explosion.
 * @returns The created entity's ID.
 */
export function createExplosion(ecs: ECS, pos: Pos, force: number): Entity {
    const config = ConfigManager.get();
    const duration =
        config.ExplosionBaseDuration + force * config.ExplosionDurationPerForce;

    const entity = ecs.addEntity();

    // Add Transform for position
    const transform = new Transform();
    transform.pos = pos;
    ecs.addComponent(entity, transform);

    // Add Explosion data component
    const explosion = new Explosion(force, duration);
    ecs.addComponent(entity, explosion);

    return entity;
}
