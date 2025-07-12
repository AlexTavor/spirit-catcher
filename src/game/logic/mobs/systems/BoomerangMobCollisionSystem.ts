import { Pos, MathUtils } from "../../../../utils/Math";
import { ConfigManager } from "../../../api/ConfigManager";
import { Boomerang } from "../../boomerang/components/Boomerang";
import { Transform } from "../../core/components/Transform";
import { Velocity } from "../../core/components/Velocity";
import { Entity, System } from "../../core/ECS";
import { Health } from "../components/Health";
import { HitCooldowns } from "../components/HitCooldowns";
import { LiftResistance } from "../components/LiftResistance";
import { Mob } from "../components/Mob";

export class BoomerangMobCollisionSystem extends System {
    public componentsRequired = new Set<Function>([
        Boomerang,
        Transform,
        Velocity,
    ]);
    private allMobs: Entity[] = [];
    private readonly COLUMN_ALIGNMENT_TOLERANCE = 5; // Pixels

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
        this.applyLiftFromImpacts(liftToApply, delta);
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

    private applyBounce(
        boomerang: Entity,
        mob: Entity,
        impactSpeed: number,
    ): void {
        const config = ConfigManager.get();
        if (impactSpeed < config.BoomerangBounceThreshold) {
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

        const bounceVelocity = MathUtils.multiply(
            reflectionNormal,
            impactSpeed * config.BoomerangMobBounceFactor,
        );
        rangVelocity.x = bounceVelocity.x;
        rangVelocity.y = bounceVelocity.y;
    }

    private applyLiftFromImpacts(
        liftToApply: Map<Entity, number>,
        delta: number,
    ): void {
        const displacementToApply = new Map<Entity, number>();

        for (const [startMob, incomingLift] of liftToApply.entries()) {
            if (!this.ecs.hasEntity(startMob)) continue;

            const liftGroup: Entity[] = [];
            let mobChain: Entity | null = startMob;
            let maxResistanceInGroup = 0;

            // 1. Determine the lift group and its highest resistance.
            // The group includes the start mob and all mobs above it, stopping at the first full blocker.
            while (mobChain !== null) {
                liftGroup.push(mobChain);
                const resComp = this.ecs.getComponent(mobChain, LiftResistance);
                const resistance = resComp ? resComp.resistance : 0;
                maxResistanceInGroup = Math.max(
                    maxResistanceInGroup,
                    resistance,
                );

                if (resistance >= 1.0) {
                    break; // This mob is a full anchor; the group stops here.
                }
                mobChain = this.findMobDirectlyAbove(mobChain);
            }

            // 2. Calculate a single effective lift for the entire group.
            const effectiveLift = incomingLift * (1 - maxResistanceInGroup);

            if (effectiveLift > 0) {
                const displacement = effectiveLift * (delta / 1000);

                // 3. Aggregate displacement for every mob in the determined group.
                for (const mobInGroup of liftGroup) {
                    const existingDisplacement =
                        displacementToApply.get(mobInGroup) || 0;
                    displacementToApply.set(
                        mobInGroup,
                        existingDisplacement + displacement,
                    );
                }
            }
        }

        // 4. Apply the final aggregated displacements to all affected mobs.
        for (const [mob, displacement] of displacementToApply.entries()) {
            if (this.ecs.hasEntity(mob)) {
                const transform = this.ecs.getComponent(mob, Transform);
                transform.pos.y -= displacement;
            }
        }
    }

    private findMobDirectlyAbove(mob: Entity): Entity | null {
        const currentTransform = this.ecs.getComponent(mob, Transform);
        const config = ConfigManager.get();

        for (const otherMob of this.allMobs) {
            if (otherMob === mob) continue;

            const otherTransform = this.ecs.getComponent(otherMob, Transform);
            const isSameColumn =
                Math.abs(currentTransform.pos.x - otherTransform.pos.x) <
                this.COLUMN_ALIGNMENT_TOLERANCE;
            if (!isSameColumn) continue;

            const isAbove = otherTransform.pos.y < currentTransform.pos.y;
            if (!isAbove) continue;

            const isDirectlyAbove =
                Math.abs(
                    otherTransform.pos.y -
                        (currentTransform.pos.y - config.MobHeight),
                ) < this.COLUMN_ALIGNMENT_TOLERANCE;

            if (isDirectlyAbove) {
                return otherMob;
            }
        }
        return null;
    }

    private isColliding(boomerang: Entity, mob: Entity): boolean {
        const mobHealth = this.ecs.getComponent(mob, Health);
        if (!mobHealth || !mobHealth.isAlive) {
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

    public destroy(): void {}
}
