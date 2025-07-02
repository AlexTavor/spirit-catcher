import { System } from "../core/ECS";
import { Transform } from "../components/Transform";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { HasBoomerang } from "../components/HasBoomerang";
import { Boomerang } from "../components/Boomerang";
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
        const config = ConfigManager.get();

        // Player bounds (origin is top-left)
        const playerRect = {
            x: playerTransform.pos.x,
            y: playerTransform.pos.y,
            width: config.PlayerWidth,
            height: config.PlayerHeight,
        };

        for (const boomerang of boomerangs) {
            const boomerangTransform = this.ecs.getComponent(
                boomerang,
                Transform,
            );

            // Boomerang bounds (origin is center)
            const boomerangRect = {
                x: boomerangTransform.pos.x - config.BoomerangWidth / 2,
                y: boomerangTransform.pos.y - config.BoomerangHeight / 2,
                width: config.BoomerangWidth,
                height: config.BoomerangHeight,
            };

            // AABB collision check
            const isColliding =
                playerRect.x < boomerangRect.x + boomerangRect.width &&
                playerRect.x + playerRect.width > boomerangRect.x &&
                playerRect.y < boomerangRect.y + boomerangRect.height &&
                playerRect.y + playerRect.height > boomerangRect.y;

            if (isColliding) {
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
