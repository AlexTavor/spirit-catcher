import { ConfigManager } from "../../../api/ConfigManager";
import { groundConfig } from "../../../consts/backgrounds";
import { getPlayerEntity } from "../../../utils/getPlayerEntity";
import { Transform } from "../../core/components/Transform";
import { Velocity } from "../../core/components/Velocity";
import { System, Entity } from "../../core/ECS";
import { HasBoomerang } from "../../player/components/HasBoomerang";
import { Airborne } from "../components/Airborne";
import { Boomerang } from "../components/Boomerang";
import { Grounded } from "../components/Grounded";

export class GroundCollisionSystem extends System {
    public componentsRequired = new Set<Function>([
        Boomerang,
        Airborne,
        Transform,
    ]);

    private groundY: number;

    constructor() {
        super();
        // Cache the ground's top y-coordinate.
        this.groundY = ConfigManager.get().GameHeight - groundConfig().height;
    }

    public update(entities: Set<Entity>): void {
        for (const entity of entities) {
            const transform = this.ecs.getComponent(entity, Transform);

            // Check for collision with the ground.
            if (transform.pos.y >= this.groundY) {
                // Snap position to the ground.
                transform.pos.y = this.groundY;

                if (
                    this.ecs.hasComponent(
                        getPlayerEntity(this.ecs),
                        HasBoomerang,
                    )
                ) {
                    // If the player has a boomerang, we kill this boomerang
                    this.ecs.removeEntity(entity);
                    continue; // Skip to the next entity
                }

                // Change state from Airborne to Grounded.
                this.ecs.removeComponent(entity, Airborne);
                this.ecs.addComponent(entity, new Grounded());

                // The boomerang is now "stuck" in the ground, so it has no velocity.
                if (this.ecs.hasComponent(entity, Velocity)) {
                    this.ecs.removeComponent(entity, Velocity);
                }
            }
        }
    }

    public destroy(): void {}
}
