import { ConfigManager } from "../../../api/ConfigManager";
import { createExplosion } from "../../explosion/ExplosionFactory";
import { Transform } from "../../core/components/Transform";
import { Entity, System } from "../../core/ECS";
import { Health } from "../components/Health";
import { Mob } from "../components/Mob";

export class MobDeathHandlerSystem extends System {
    /**
     * The ECS will pass in all entities with both a Mob and Health component.
     */
    public componentsRequired = new Set<Function>([Mob, Health]);

    /**
     * Called every frame with entities that have the required components.
     * @param entities The set of entities to process.
     * @param delta The time in milliseconds since the last frame.
     */
    public update(entities: Set<Entity>, _delta: number): void {
        // First, collect all mobs that are no longer alive to process them.
        // This avoids modifying the entity set while the ECS is iterating over it.
        const deadMobs: Entity[] = [];
        for (const entity of entities) {
            const health = this.ecs.getComponent(entity, Health);
            if (!health.isAlive) {
                deadMobs.push(entity);
            }
        }

        if (deadMobs.length === 0) {
            return;
        }

        const config = ConfigManager.get();

        // Now, process the consequences for each dead mob.
        for (const entity of deadMobs) {
            const health = this.ecs.getComponent(entity, Health);
            const transform = this.ecs.getComponent(entity, Transform);

            // --- 1. Handle Overkill Mechanic ---
            if (health.lastHitForce >= config.OverkillMinForce) {
                // NOTE: You need to add `OverkillMinForce` to your ConfigManager DEFAULTS.
                createExplosion(this.ecs, transform.pos, health.lastHitForce);
            }

            // --- 2. Handle Power-up Drops ---
            // if (this.ecs.hasComponent(entity, CarriesPowerUp)) {
            //     // Logic to spawn the power-up entity
            // }

            // --- 3. Handle Score ---
            // Logic to add to a score component/system

            // --- 4. Remove the Entity ---
            this.ecs.removeEntity(entity);
        }
    }

    public destroy(): void {}
}
