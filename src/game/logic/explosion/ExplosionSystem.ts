import { System, Entity } from "../core/ECS";
import { Explosion } from "./Explosion";

export class ExplosionSystem extends System {
    /**
     * A set of components that an entity must have for this system to operate on it.
     */
    public componentsRequired = new Set<Function>([Explosion]);

    /**
     * The update method is called every frame.
     * @param entities The set of entities that have an Explosion component.
     * @param delta The time in milliseconds since the last update.
     */
    public update(entities: Set<Entity>, delta: number): void {
        for (const entity of entities) {
            const explosion = this.ecs.getComponent(entity, Explosion);

            // Increment the age of the explosion.
            explosion.age += delta;

            // If the explosion's age has surpassed its duration, remove the entity.
            if (explosion.age >= explosion.duration) {
                this.ecs.removeEntity(entity);
            }
        }
    }

    /**
     * Called when the system is removed from the ECS, used for cleanup.
     */
    public destroy(): void {}
}
