// src/game/logic/projectile/systems/ProjectileSystem.ts
import { System, Entity } from "../../core/ECS";
import { Transform } from "../../core/components/Transform";
import { Velocity } from "../../core/components/Velocity";
import { CommandBus } from "../../../api/CommandBus";
import {
    GameCommands,
    SpawnProjectilePayload,
} from "../../../consts/GameCommands";
import { ProjectileType } from "../ProjectileType";
import { Spirit } from "../../spirits/components/Spirit";
import { Projectile } from "../components/Projectile";
import { MathUtils } from "../../../../utils/Math";
import { EventBus } from "../../../api/EventBus";
import { GameEvents } from "../../../consts/GameEvents";
import { ConfigManager } from "../../../consts/ConfigManager";

export class ProjectileSystem extends System {
    public componentsRequired = new Set<Function>([
        Projectile,
        Transform,
        Velocity,
    ]);

    constructor() {
        super();
        CommandBus.on(GameCommands.SPAWN_PROJECTILE, this.handleSpawn, this);
    }

    public destroy(): void {
        CommandBus.removeListener(
            GameCommands.SPAWN_PROJECTILE,
            this.handleSpawn,
            this,
        );
    }

    private handleSpawn(payload: SpawnProjectilePayload): void {
        if (payload.type === ProjectileType.TOP_SEEKING) {
            const target = this.findTopmostUntargetedSpirit();
            if (target === -1) return;

            const config = ConfigManager.get();
            const projectileEntity = this.ecs.addEntity();

            this.ecs.addComponent(
                projectileEntity,
                new Transform({ ...payload.origin }),
            );

            // --- Meandering Rocket Logic ---
            const initialSpeed = config.ProjectileMaxSpeed * 0.4; // Fly out at 40% of max speed
            const randomAngle = Math.random() * 2 * Math.PI; // Random angle in radians

            this.ecs.addComponent(
                projectileEntity,
                new Velocity({
                    x: Math.cos(randomAngle) * initialSpeed,
                    y: Math.sin(randomAngle) * initialSpeed,
                }),
            );

            const homingDelay = MathUtils.random(100, 300); // Random delay

            this.ecs.addComponent(
                projectileEntity,
                new Projectile(payload.type, target, homingDelay),
            );
        }
    }

    public update(entities: Set<Entity>, delta: number): void {
        const dt = delta / 1000;
        const config = ConfigManager.get();
        const steeringForce = config.ProjectileSteeringForce;
        const collisionRadius = config.ProjectileCollisionRadius;
        const timeToMaxSpeedMs = config.ProjectileTimeToMaxSpeed * 1000;
        const boundsPadding = 50; // pixels

        for (const entity of entities) {
            const projectile = this.ecs.getComponent(entity, Projectile);
            const transform = this.ecs.getComponent(entity, Transform);
            const velocity = this.ecs.getComponent(entity, Velocity);

            projectile.age += delta;

            // --- Homing Logic ---
            if (projectile.age > projectile.homingDelay) {
                let targetTransform = this.validateAndGetTarget(projectile);
                if (!targetTransform) {
                    const newTarget = this.findTopmostUntargetedSpirit();
                    if (newTarget !== -1) {
                        projectile.targetEntity = newTarget;
                        targetTransform = this.ecs.getComponent(
                            newTarget,
                            Transform,
                        );
                    } else {
                        this.ecs.removeEntity(entity);
                        continue;
                    }
                }

                // Calculate acceleration based on time since homing started
                const timeSinceHomingStart =
                    projectile.age - projectile.homingDelay;
                const speedMultiplier =
                    timeToMaxSpeedMs > 0
                        ? Math.min(1, timeSinceHomingStart / timeToMaxSpeedMs)
                        : 1;
                const currentMaxSpeed =
                    config.ProjectileMaxSpeed * speedMultiplier;

                // Steer Towards Target
                const desiredVelocity = MathUtils.subtract(
                    targetTransform.pos,
                    transform.pos,
                );
                const normalizedDesired =
                    MathUtils.normalizePos(desiredVelocity);
                const scaledDesired = MathUtils.multiply(
                    normalizedDesired,
                    currentMaxSpeed,
                );
                const steering = MathUtils.subtract(scaledDesired, {
                    x: velocity.x,
                    y: velocity.y,
                });
                velocity.x += steering.x * steeringForce * dt;
                velocity.y += steering.y * steeringForce * dt;

                // Clamp to Current Max Speed
                const speed = Math.sqrt(
                    velocity.x * velocity.x + velocity.y * velocity.y,
                );
                if (speed > currentMaxSpeed) {
                    velocity.x = (velocity.x / speed) * currentMaxSpeed;
                    velocity.y = (velocity.y / speed) * currentMaxSpeed;
                }
            }

            // --- Universal Logic (applies always) ---

            // Update Position
            transform.pos.x += velocity.x * dt;
            transform.pos.y += velocity.y * dt;

            // Check Collision (only if a target exists)
            if (this.ecs.hasEntity(projectile.targetEntity)) {
                const targetTransform = this.ecs.getComponent(
                    projectile.targetEntity,
                    Transform,
                );
                const distanceToTarget = MathUtils.distance(
                    transform.pos,
                    targetTransform.pos,
                );
                if (distanceToTarget < collisionRadius) {
                    EventBus.emit(GameEvents.SPIRIT_COLLECTED);
                    this.ecs.removeEntity(projectile.targetEntity);
                    this.ecs.removeEntity(entity);
                    continue; // Entity destroyed, skip to next
                }
            }

            // Out of Bounds Cleanup
            if (
                transform.pos.x < -boundsPadding ||
                transform.pos.x > config.GameWidth + boundsPadding ||
                transform.pos.y < -boundsPadding ||
                transform.pos.y > config.GameHeight + boundsPadding
            ) {
                this.ecs.removeEntity(entity);
            }
        }
    }

    private validateAndGetTarget(projectile: Projectile): Transform | null {
        if (
            projectile.targetEntity === -1 ||
            !this.ecs.hasEntity(projectile.targetEntity)
        ) {
            return null;
        }
        return this.ecs.getComponent(projectile.targetEntity, Transform);
    }

    private findTopmostUntargetedSpirit(): Entity {
        const projectiles = this.ecs.getEntitiesWithComponent(Projectile);
        const targetedSpirits = new Set<Entity>();
        for (const pEntity of projectiles) {
            const projectile = this.ecs.getComponent(pEntity, Projectile);
            if (projectile.targetEntity !== -1) {
                targetedSpirits.add(projectile.targetEntity);
            }
        }

        const spirits = this.ecs.getEntitiesWithComponent(Spirit);
        let topmostSpirit: Entity = -1;
        let highestY = Number.MAX_VALUE;

        for (const spirit of spirits) {
            if (targetedSpirits.has(spirit)) {
                continue;
            }

            const transform = this.ecs.getComponent(spirit, Transform);
            if (transform.pos.y < highestY) {
                highestY = transform.pos.y;
                topmostSpirit = spirit;
            }
        }

        return topmostSpirit;
    }
}
