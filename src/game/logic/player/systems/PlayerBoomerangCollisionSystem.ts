import { System } from "../../core/ECS";
import { Transform } from "../../core/components/Transform";
import { getPlayerEntity } from "../../../utils/getPlayerEntity";
import { Boomerang } from "../../boomerang/components/Boomerang";
import { ConfigManager } from "../../../consts/ConfigManager";
import { HasBoomerang } from "../components/HasBoomerang";
import { ModifiableStat } from "../../upgrades/mods/ModifiableStat";
import { Values } from "../../upgrades/mods/Values";
import { GameEvents } from "../../../consts/GameEvents";
import { EventBus } from "../../../api/EventBus";
import { QuickFalling } from "../../boomerang/components/QuickFalling";

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

        // Player bounds (origin is center)
        const playerRect = {
            x: playerTransform.pos.x - config.PlayerWidth / 2,
            y: playerTransform.pos.y,
            width: config.PlayerWidth,
            height: config.PlayerHeight,
        };

        for (const boomerang of boomerangs) {
            const boomerangTransform = this.ecs.getComponent(
                boomerang,
                Transform,
            );
            const size = Values.get(
                this.ecs,
                this.ecs.world,
                ModifiableStat.BOOMERANG_SIZE,
            );

            // Boomerang bounds (origin is center)
            const boomerangRect = {
                x: boomerangTransform.pos.x - size / 2,
                y: boomerangTransform.pos.y - size / 2,
                width: size,
                height: size,
            };

            // AABB collision check
            const isColliding =
                playerRect.x < boomerangRect.x + boomerangRect.width &&
                playerRect.x + playerRect.width > boomerangRect.x &&
                playerRect.y < boomerangRect.y + boomerangRect.height &&
                playerRect.y + playerRect.height > boomerangRect.y;

            if (isColliding) {
                // If player already has a boomerang, we destroy the boomerang entity.
                if (this.ecs.hasComponent(player, HasBoomerang)) {
                    this.ecs.removeEntity(boomerang);
                    continue; // Skip to the next boomerang
                }

                // Give boomerang back to player and remove the boomerang entity.
                this.ecs.addComponent(player, new HasBoomerang());

                this.handleQuickFall(boomerang);

                this.ecs.removeEntity(boomerang);

                // We're done for this frame.
                break;
            }
        }
    }

    private handleQuickFall(boomerang: number) {
        const quickFalling = this.ecs.hasComponent(boomerang, QuickFalling);
        if (quickFalling) {
            EventBus.emit(GameEvents.RANG_QUICK_FALL_CAUGHT, {
                entityId: boomerang,
            });
        }
    }

    public destroy(): void {}
}
