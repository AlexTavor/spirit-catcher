import { ConfigManager } from "../../../consts/ConfigManager";
import { EventBus } from "../../../api/EventBus";
import { GameEvents } from "../../../consts/GameEvents";
import { System, Entity } from "../../core/ECS";
import { Transform } from "../../core/components/Transform";
import { Spirit } from "../components/Spirit";

/**
 * Removes spirits that have reached the top of the screen.
 */
export class SpiritCeilingCollisionSystem extends System {
    /**
     * This system operates on any entity that has both a Spirit and a Transform component.
     */
    public componentsRequired = new Set<Function>([Spirit, Transform]);

    /**
     * Updates all relevant entities, checking for ceiling collision.
     * @param entities The set of entities with Spirit and Transform components.
     */
    public update(entities: Set<Entity>): void {
        const config = ConfigManager.get();
        const hSize = config.MobHeight / 2;

        for (const entity of entities) {
            const transform = this.ecs.getComponent(entity, Transform);

            // Check if the spirit's y-position is at or above the ceiling
            if (transform.pos.y <= hSize) {
                // If it hits the ceiling, remove the spirit entity from the game.
                this.ecs.removeEntity(entity);
                // Emit an event for the spirit being missed.
                EventBus.emit(GameEvents.SPIRIT_MISSED);
            }
        }
    }

    /**
     * This system holds no persistent resources, so destroy is empty.
     */
    public destroy(): void {}
}
