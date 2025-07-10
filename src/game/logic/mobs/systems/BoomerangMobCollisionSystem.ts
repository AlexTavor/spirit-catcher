import { Pos, MathUtils } from "../../../../utils/Math";
import { ConfigManager } from "../../../api/ConfigManager";
import { Boomerang } from "../../boomerang/components/Boomerang";
import { Transform } from "../../core/components/Transform";
import { Velocity } from "../../core/components/Velocity";
import { Entity, System } from "../../core/ECS";
import { Health } from "../components/Health";
import { Mob } from "../components/Mob";

export class BoomerangMobCollisionSystem extends System {
    public componentsRequired = new Set<Function>([
        Boomerang,
        Transform,
        Velocity,
    ]);

    // Cache all mobs once per frame to avoid repeatedly querying the ECS
    private allMobs: Entity[] = [];

    public update(boomerangs: Set<Entity>, _delta: number): void {
        this.allMobs = this.ecs.getEntitiesWithComponents([
            Mob,
            Transform,
            Health,
        ]);
        if (boomerangs.size === 0 || this.allMobs.length === 0) {
            return;
        }

        for (const boomerang of boomerangs) {
            for (const mob of this.allMobs) {
                if (this.checkForCollision(boomerang, mob)) {
                    this.handleCollision(boomerang, mob);
                    break;
                }
            }
        }
    }

    private checkForCollision(boomerang: Entity, mob: Entity): boolean {
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

    private handleCollision(boomerang: Entity, mob: Entity): void {
        const rangVelocity = this.ecs.getComponent(boomerang, Velocity);
        const impactVelocity = Math.sqrt(
            rangVelocity.x ** 2 + rangVelocity.y ** 2,
        );
        const config = ConfigManager.get();
        const normalizedForce = Math.min(
            1,
            impactVelocity / config.MobCollisionMaxImpactForce,
        );

        this.applyDamage(mob, normalizedForce);
        this.applyLift(mob);
        this.applyBoomerangBounce(boomerang, mob, impactVelocity);
    }

    private applyDamage(mob: Entity, normalizedForce: number): void {
        const config = ConfigManager.get();
        const mobHealth = this.ecs.getComponent(mob, Health);
        const damage = normalizedForce * config.MobCollisionDamageFactor;
        mobHealth.takeDamage(damage);
        mobHealth.lastHitForce = normalizedForce;
    }

    /**
     * Identifies the contiguous stack of mobs and applies the upward lift to all of them.
     * @param hitMob The initial mob that was struck by the boomerang.
     */
    private applyLift(hitMob: Entity): void {
        const config = ConfigManager.get();
        const stack = this.getContiguousStack(hitMob);
        for (const mobInStack of stack) {
            const mobTransform = this.ecs.getComponent(mobInStack, Transform);
            mobTransform.pos.y -= config.MobCollisionMobLift;
        }
    }

    /**
     * Calculates and applies the reflected velocity and upward kick to the boomerang.
     * @param boomerang The boomerang entity.
     * @param mob The mob entity it collided with.
     * @param impactSpeed The original speed of the boomerang.
     */
    private applyBoomerangBounce(
        boomerang: Entity,
        mob: Entity,
        impactSpeed: number,
    ): void {
        const config = ConfigManager.get();
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
        const reflectedVel = MathUtils.multiply(
            reflectionNormal,
            impactSpeed * config.MobCollisionReflectFactor,
        );
        rangVelocity.x = reflectedVel.x;
        rangVelocity.y = reflectedVel.y;
        rangVelocity.y -= config.MobCollisionRangUpKick;
    }

    /**
     * Finds all mobs connected vertically in a single column, starting from a given mob.
     * @param startMob The mob to begin the search from.
     * @returns An array of entities representing the vertical stack.
     */
    private getContiguousStack(startMob: Entity): Entity[] {
        const stack: Entity[] = [startMob];
        const config = ConfigManager.get();
        let currentMob = startMob;

        while (currentMob) {
            const currentTransform = this.ecs.getComponent(
                currentMob,
                Transform,
            );
            if (!currentTransform) break;
            let foundNext = false;
            for (const otherMob of this.allMobs) {
                if (otherMob === currentMob) continue;

                const otherTransform = this.ecs.getComponent(
                    otherMob,
                    Transform,
                );
                if (!otherTransform) continue;

                const cpos = currentTransform.pos;
                const opos = otherTransform.pos;

                const isSameColumn = Math.abs(cpos.x - opos.x) < 5;
                const isDirectlyAbove =
                    Math.abs(opos.y - (cpos.y - config.MobHeight)) < 5;

                if (isSameColumn && isDirectlyAbove) {
                    stack.push(otherMob);
                    currentMob = otherMob;
                    foundNext = true;
                    break;
                }
            }
            if (!foundNext) {
                currentMob = -1; // End the loop
            }
        }
        return stack;
    }

    public destroy(): void {}
}
