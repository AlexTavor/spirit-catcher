import { System } from "../core/ECS";
import { Transform } from "../components/Transform";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { HasBoomerang } from "../components/HasBoomerang";
import { Boomerang } from "../components/Boomerang";
import { MathUtils } from "../../../utils/Math";
import { ConfigManager } from "../../api/ConfigManager";

export class PlayerBoomerangCollisionSystem extends System {
    public componentsRequired = new Set<Function>();

    public update(): void {
        const player = getPlayerEntity(this.ecs);

        // Do nothing if player doesn't exist or already has the boomerang.
        if (player === -1 || this.ecs.hasComponent(player, HasBoomerang)) {
            return;
        }

        const playerTransform = this.ecs.getComponent(player, Transform);
        const boomerangs = this.ecs.getEntitiesWithComponent(Boomerang);

        for (const boomerang of boomerangs) {
            const boomerangTransform = this.ecs.getComponent(
                boomerang,
                Transform,
            );

            const distance = MathUtils.distance(
                playerTransform.pos,
                boomerangTransform.pos,
            );

            // Check if the player is close enough to pick it up.
            if (distance < ConfigManager.get().PlayerPickupRadius) {
                // Give boomerang back to player and remove the boomerang entity.
                this.ecs.addComponent(player, new HasBoomerang());
                this.ecs.removeEntity(boomerang);

                // We're done for this frame.
                break;
            }
        }
    }

    public destroy(): void {}
}
