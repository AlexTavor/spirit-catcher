import { Charging } from "../components/Charging";
import { System, Entity } from "../core/ECS";

export class ChargingSystem extends System {
    /**
     * This system operates on any entity that has a Charging component.
     */
    public componentsRequired = new Set<Function>([Charging]);

    /**
     * Called every frame by the ECS.
     * @param entities The set of entities that have a Charging component.
     * @param delta The time in milliseconds since the last frame.
     */
    public update(entities: Set<Entity>, delta: number): void {
        // Convert delta from milliseconds to seconds for rate calculations
        const deltaInSeconds = delta / 1000;

        for (const entity of entities) {
            const charging = this.ecs.getComponent(entity, Charging);

            // Do not increase charge level if it's already at max
            if (charging.level >= charging.maxLevel) {
                continue;
            }

            // Increase the charge level based on the charge rate
            const newLevel =
                charging.level + charging.chargeRate * deltaInSeconds;

            // Clamp the new level to the max level
            charging.level = Math.min(newLevel, charging.maxLevel);
        }
    }

    /**
     * This system doesn't hold any resources, so destroy is empty.
     */
    public destroy(): void {}
}
