import { Pos, MathUtils } from "../../../../utils/Math";
import { ConfigManager } from "../../../api/ConfigManager";
import { Boomerang } from "../../boomerang/components/Boomerang";
import { Transform } from "../../core/components/Transform";
import { Velocity } from "../../core/components/Velocity";
import { Entity, System } from "../../core/ECS";
import { Health } from "../components/Health";
import { HitCooldowns } from "../components/HitCooldowns";
import { Mob } from "../components/Mob";

/**
 * Manages all interactions between boomerangs and mobs.
 * Implements a blended model where every hit has damage, lift, and now a physical bounce,
 * with the proportions and effects determined by the boomerang's velocity.
 */
export class BoomerangMobCollisionSystem extends System {
    public componentsRequired = new Set<Function>([
        Boomerang,
        Transform,
        Velocity,
    ]);

    private allMobs: Entity[] = [];

    public update(boomerangs: Set<Entity>, delta: number): void {
        this.allMobs = this.ecs.getEntitiesWithComponents([
            Mob,
            Transform,
            Health,
            HitCooldowns,
        ]);
        if (boomerangs.size === 0 || this.allMobs.length === 0) {
            return;
        }

        const liftToApply = this.calculateAllEffects(boomerangs, delta);
        this.applyLiftToStacks(liftToApply, delta);
    }

    private calculateAllEffects(
        boomerangs: Set<Entity>,
        delta: number,
    ): Map<Entity, number> {
        const liftToApply = new Map<Entity, number>();
        for (const boomerang of boomerangs) {
            for (const mob of this.allMobs) {
                if (this.isColliding(boomerang, mob)) {
                    this.handleCollision(boomerang, mob, delta, liftToApply);
                }
            }
        }
        return liftToApply;
    }

    /**
     * Orchestrates all effects of a single collision: damage, lift, and bounce.
     */
    private handleCollision(
        boomerang: Entity,
        mob: Entity,
        delta: number,
        liftToApply: Map<Entity, number>,
    ): void {
        const rangVelocity = this.ecs.getComponent(boomerang, Velocity);
        const impactSpeed = Math.sqrt(
            rangVelocity.x ** 2 + rangVelocity.y ** 2,
        );

        this.calculateAndApplyDamage(boomerang, mob, impactSpeed, delta);

        const lift = this.calculateLift(impactSpeed);
        const currentLift = liftToApply.get(mob) || 0;
        liftToApply.set(mob, currentLift + lift);

        // NEW: Apply physical bounce to the boomerang
        this.applyBounce(boomerang, mob, impactSpeed);
    }

    private calculateAndApplyDamage(
        boomerang: Entity,
        mob: Entity,
        impactSpeed: number,
        delta: number,
    ): void {
        const config = ConfigManager.get();
        const health = this.ecs.getComponent(mob, Health);

        if (impactSpeed > config.BoomerangDamageThreshold) {
            const cooldowns = this.ecs.getComponent(mob, HitCooldowns);
            if (!cooldowns.isOnCooldown(boomerang)) {
                const normalizedForce = Math.min(
                    1,
                    impactSpeed / config.MobCollisionMaxImpactForce,
                );
                const impactDamage =
                    normalizedForce * config.MobCollisionDamageFactor;
                health.takeDamage(impactDamage);
                health.lastHitForce = normalizedForce;
                cooldowns.setCooldown(boomerang);
            }
        }

        const dpsDamage = config.BoomerangDpsDamage * (delta / 1000);
        health.takeDamage(dpsDamage);
    }

    private calculateLift(impactSpeed: number): number {
        const config = ConfigManager.get();
        let totalLift = 0;

        if (impactSpeed > config.BoomerangDamageThreshold) {
            const forceRatio = impactSpeed / config.BoomerangImpactMaxVelocity;
            const impulseLift =
                config.BoomerangMaxImpulseLift * (1 - Math.min(1, forceRatio));
            totalLift += impulseLift;
        }

        totalLift += config.BoomerangContinuousLiftForce;
        return totalLift;
    }

    /**
     * Applies a physical bounce to the boomerang if impact speed is high enough.
     */
    private applyBounce(
        boomerang: Entity,
        mob: Entity,
        impactSpeed: number,
    ): void {
        const config = ConfigManager.get();
        if (impactSpeed < config.BoomerangBounceThreshold) {
            // Not moving fast enough to bounce, preserve "gentle touch" mechanic
            return;
        }

        const rangTransform = this.ecs.getComponent(boomerang, Transform);
        const rangVelocity = this.ecs.getComponent(boomerang, Velocity);
        const mobTransform = this.ecs.getComponent(mob, Transform);

        const mobCenterPos: Pos = {
            x: mobTransform.pos.x + config.MobWidth / 2,
            y: mobTransform.pos.y + config.MobHeight / 2,
        };

        const reflectionNormal = MathUtils.normalize(
            MathUtils.subtract(rangTransform.pos, mobCenterPos),
        );

        // The new velocity is the reflection vector scaled by the impact speed and a bounce factor
        const bounceVelocity = MathUtils.multiply(
            reflectionNormal,
            impactSpeed * config.BoomerangMobBounceFactor,
        );

        rangVelocity.x = bounceVelocity.x;
        rangVelocity.y = bounceVelocity.y;
    }

    private applyLiftToStacks(
        liftToApply: Map<Entity, number>,
        delta: number,
    ): void {
        for (const [mob, liftForce] of liftToApply.entries()) {
            if (!this.ecs.hasEntity(mob)) continue;

            const stack = this.getContiguousStack(mob);
            const displacement = liftForce * (delta / 1000);

            for (const mobInStack of stack) {
                const transform = this.ecs.getComponent(mobInStack, Transform);
                transform.pos.y -= displacement;
            }
        }
    }

    private isColliding(boomerang: Entity, mob: Entity): boolean {
        const mobHealth = this.ecs.getComponent(mob, Health);
        if (!mobHealth.isAlive) {
            return false;
        }

        const config = ConfigManager.get();
        const rangTransform = this.ecs.getComponent(boomerang, Transform);
        const mobTransform = this.ecs.getComponent(mob, Transform);

        const rangRect = {
            x: rangTransform.pos.x - config.BoomerangWidth / 2,
            y: rangTransform.pos.y - config.BoomerangHeight / 2,
            width: config.BoomerangWidth,
            height: config.BoomerangHeight,
        };
        const mobRect = {
            x: mobTransform.pos.x,
            y: mobTransform.pos.y,
            width: config.MobWidth,
            height: config.MobHeight,
        };

        return (
            rangRect.x < mobRect.x + mobRect.width &&
            rangRect.x + rangRect.width > mobRect.x &&
            rangRect.y < mobRect.y + mobRect.height &&
            rangRect.y + rangRect.height > mobRect.y
        );
    }

    private getContiguousStack(startMob: Entity): Entity[] {
        const stack: Entity[] = [startMob];
        const config = ConfigManager.get();
        let currentMob = startMob;

        while (this.ecs.hasEntity(currentMob)) {
            const currentTransform = this.ecs.getComponent(
                currentMob,
                Transform,
            );
            let foundNext = false;
            for (const otherMob of this.allMobs) {
                if (otherMob === currentMob || !this.ecs.hasEntity(otherMob))
                    continue;

                const otherTransform = this.ecs.getComponent(
                    otherMob,
                    Transform,
                );
                const isSameColumn =
                    Math.abs(currentTransform.pos.x - otherTransform.pos.x) < 5;
                const isDirectlyAbove =
                    Math.abs(
                        otherTransform.pos.y -
                            (currentTransform.pos.y - config.MobHeight),
                    ) < 5;

                if (isSameColumn && isDirectlyAbove) {
                    stack.push(otherMob);
                    currentMob = otherMob;
                    foundNext = true;
                    break;
                }
            }
            if (!foundNext) {
                break;
            }
        }
        return stack;
    }

    public destroy(): void {}
}
