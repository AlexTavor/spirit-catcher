import { System, Entity } from "../ECS";
import { ActiveModifiersComponent } from "./ActiveModifiersComponent";

/**
 * A system that manages the lifecycle of active modifiers.
 * It is responsible for removing modifiers from entities once they expire.
 */
export class ModifierSystem extends System {
    /**
     * This system operates on any entity that has an ActiveModifiersComponent.
     */
    public componentsRequired = new Set<Function>([ActiveModifiersComponent]);

    /**
     * Updates all entities with active modifiers, removing any that have expired.
     * Note: This system's update signature requires the total elapsed game time.
     * The ECS's update loop should be modified to pass this from the main scene.
     *
     * @param entities The set of entities with an ActiveModifiersComponent.
     * @param delta The time elapsed since the last update, in milliseconds.
     */
    public update(entities: Set<Entity>, delta: number): void {
        for (const entity of entities) {
            const component = this.ecs.getComponent(
                entity,
                ActiveModifiersComponent,
            );

            // Filter the modifiers array in-place, keeping only those that have not expired.
            // This is more efficient than creating a new array if no modifiers are removed.
            let i = component.modifiers.length;
            while (i--) {
                if (component.modifiers[i].timeRemaining === -1) continue; // Infinite duration modifier, skip it.

                component.modifiers[i].timeRemaining -= delta;
                if (component.modifiers[i].timeRemaining <= 0) {
                    component.modifiers.splice(i, 1);
                }
            }
        }
    }

    /**
     * This system holds no persistent resources, so destroy is empty.
     */
    public destroy(): void {}
}

