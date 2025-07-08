import { Pos, MathUtils } from "../../../../utils/Math";
import { ConfigManager } from "../../../api/ConfigManager";
import { Boomerang } from "../../boomerang/components/Boomerang";
import { Transform } from "../../core/components/Transform";
import { Velocity } from "../../core/components/Velocity";
import { Entity, System } from "../../core/ECS";
import { Health } from "../components/Health";
import { Mob } from "../components/Mob";

export class BoomerangMobCollisionSystem extends System {
    /**
     * This system will run on all boomerangs.
     * It will then fetch all mobs to check for collisions against.
     */
    public componentsRequired = new Set<Function>([
        Boomerang,
        Transform,
        Velocity,
    ]);

    public update(boomerangs: Set<Entity>, _delta: number): void {
        const mobs = this.ecs.getEntitiesWithComponents([
            Mob,
            Transform,
            Health,
        ]);
        if (boomerangs.size === 0 || mobs.length === 0) {
            return;
        }

        for (const boomerang of boomerangs) {
            for (const mob of mobs) {
                if (this.checkForCollision(boomerang, mob)) {
                    this.handleCollision(boomerang, mob);
                    // A single boomerang can only hit one mob per frame.
                    // Break the inner loop to prevent multi-hits.
                    break;
                }
            }
        }
    }

    /**
     * Checks for an AABB collision between a boomerang and a mob.
     * @param boomerang The boomerang entity.
     * @param mob The mob entity.
     * @returns True if a collision is detected, false otherwise.
     */
    private checkForCollision(boomerang: Entity, mob: Entity): boolean {
        const mobHealth = this.ecs.getComponent(mob, Health);
        if (!mobHealth.isAlive) {
            return false; // Skip mobs that are already dead
        }

        const config = ConfigManager.get();
        const rangTransform = this.ecs.getComponent(boomerang, Transform);
        const mobTransform = this.ecs.getComponent(mob, Transform);

        // Boomerang bounds (origin is center)
        const rangRect = {
            x: rangTransform.pos.x - config.BoomerangWidth / 2,
            y: rangTransform.pos.y - config.BoomerangHeight / 2,
            width: config.BoomerangWidth,
            height: config.BoomerangHeight,
        };

        // Mob bounds (assuming origin is top-left)
        const mobRect = {
            x: mobTransform.pos.x,
            y: mobTransform.pos.y,
            width: config.MobWidth,
            height: config.MobHeight,
        };

        // AABB collision check
        return (
            rangRect.x < mobRect.x + mobRect.width &&
            rangRect.x + rangRect.width > mobRect.x &&
            rangRect.y < mobRect.y + mobRect.height &&
            rangRect.y + rangRect.height > mobRect.y
        );
    }

    /**
     * Handles the consequences of a collision between a boomerang and a mob.
     * @param boomerang The boomerang entity.
     * @param mob The mob entity.
     */
    private handleCollision(boomerang: Entity, mob: Entity): void {
        const rangVelocity = this.ecs.getComponent(boomerang, Velocity);

        // Calculate Impact Force & Damage
        const impactVelocity = Math.sqrt(
            rangVelocity.x ** 2 + rangVelocity.y ** 2,
        );
        const config = ConfigManager.get();
        const normalizedForce = Math.min(
            1,
            impactVelocity / config.MobCollisionMaxImpactForce,
        );

        this.applyDamage(mob, normalizedForce);
        this.applyForces(boomerang, mob, impactVelocity);
    }

    /**
     * Applies damage to the mob and records the hit force.
     * @param mob The mob entity.
     * @param normalizedForce The normalized impact force (0-1).
     */
    private applyDamage(mob: Entity, normalizedForce: number): void {
        const config = ConfigManager.get();
        const mobHealth = this.ecs.getComponent(mob, Health);
        const damage = normalizedForce * config.MobCollisionDamageFactor;
        mobHealth.takeDamage(damage);
        mobHealth.lastHitForce = normalizedForce;
    }

    /**
     * Applies physical forces to the mob and the boomerang after a collision.
     * @param boomerang The boomerang entity.
     * @param mob The mob entity.
     * @param impactSpeed The original speed of the boomerang on impact.
     */
    private applyForces(
        boomerang: Entity,
        mob: Entity,
        impactSpeed: number,
    ): void {
        const config = ConfigManager.get();
        const rangTransform = this.ecs.getComponent(boomerang, Transform);
        const rangVelocity = this.ecs.getComponent(boomerang, Velocity);
        const mobTransform = this.ecs.getComponent(mob, Transform);

        // 1. Apply knock-up to mob
        mobTransform.pos.y -= config.MobCollisionMobLift;

        // 2. Reflect Boomerang Velocity
        // Get mob center position
        const mobCenterPos: Pos = {
            x: mobTransform.pos.x + config.MobWidth / 2,
            y: mobTransform.pos.y + config.MobHeight / 2,
        };

        // Get the direction from the mob's center to the boomerang's position
        const reflectionNormal = MathUtils.normalize(
            MathUtils.subtract(rangTransform.pos, mobCenterPos),
        );

        // Calculate the new velocity by reflecting and applying the reflect factor
        const reflectedVel = MathUtils.multiply(
            reflectionNormal,
            impactSpeed * config.MobCollisionReflectFactor,
        );

        rangVelocity.x = reflectedVel.x;
        rangVelocity.y = reflectedVel.y;

        // 3. Apply additional upward kick to boomerang
        rangVelocity.y -= config.MobCollisionRangUpKick;
    }

    public destroy(): void {}
}
