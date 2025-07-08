import { System, Entity } from "../core/ECS";
import { Transform } from "../core/components/Transform";
import { Velocity } from "../core/components/Velocity";
import { HitWallFlag } from "../boomerang/components/HitWallFlag";
import { ConfigManager } from "../../api/ConfigManager";
import { CommandBus } from "../../api/CommandBus";
import { GameCommands } from "../../consts/GameCommands";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { Boomerang } from "../boomerang/components/Boomerang";

export class WallHitBoomerangDuplicatorSystem extends System {
    public componentsRequired = new Set<Function>([
        HitWallFlag,
        Velocity,
        Transform,
    ]);

    public update(entities: Set<Entity>): void {
        if (entities.size === 0) return;
        const config = ConfigManager.get();
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        if (
            this.ecs.getEntitiesWithComponent(Boomerang).length >=
            config.BoomerangMaxActives
        ) {
            // If the player already has the maximum number of active boomerangs, do not duplicate.
            return;
        }

        for (const entity of entities) {
            const velocity = this.ecs.getComponent(entity, Velocity);
            const transform = this.ecs.getComponent(entity, Transform);

            const impactVelocity = Math.abs(velocity.x);
            const force = Math.min(
                1,
                impactVelocity / config.BoomerangImpactMaxVelocity,
            );

            if (force >= config.WallHitDuplicateMinForce) {
                if (Math.random() < config.WallHitDuplicateRangChance) {
                    const isLeftWall = transform.pos.x <= config.GameWidth / 2;
                    const from = {
                        x: isLeftWall ? 0 : config.GameWidth,
                        y: transform.pos.y,
                    };

                    // Calculate a random angle variance for the new boomerang.
                    const angleVariance =
                        Math.random() * config.WallHitAngleVariance;
                    const target = {
                        x: isLeftWall ? config.GameWidth : 0,
                        y: transform.pos.y + angleVariance,
                    };

                    CommandBus.emit(GameCommands.ThrowBoomerangCommand, {
                        chargeLevel: 0.01,
                        maxChargeLevel: 1,
                        playerId: player,
                        target: target,
                        from: from,
                    });
                }
            }
        }
    }

    public destroy(): void {}
}
