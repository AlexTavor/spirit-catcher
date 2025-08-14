// src/game/logic/explosion/ExplosionDamageSystem.ts
import { System, Entity } from "../../core/ECS";
import { Transform } from "../../core/components/Transform";
import { Explosion } from "../../explosion/Explosion";
import { Spirit } from "../components/Spirit";
import { ConfigManager } from "../../../consts/ConfigManager";
import { EventBus } from "../../../api/EventBus";
import { GameEvents } from "../../../consts/GameEvents";

export class SpiritExplosionDamageSystem extends System {
    public componentsRequired = new Set<Function>([Explosion, Transform]);

    public update(explosions: Set<Entity>): void {
        if (explosions.size === 0) return;

        const spiritEntities = this.ecs.getEntitiesWithComponent(Spirit);
        if (spiritEntities.length === 0) return;

        const config = ConfigManager.get();

        for (const ex of explosions) {
            const explosion = this.ecs.getComponent(ex, Explosion);
            const exTransform = this.ecs.getComponent(ex, Transform);

            // Ignore finished explosions (ExplosionSystem will clean them up)
            const raw = explosion.age / explosion.duration;
            if (raw >= 1) continue;

            // Match ExplosionView’s easing so visuals == gameplay
            const progress = raw * (2 - raw); // ease-out quad
            const maxRadius =
                explosion.maxForce * config.ExplosionForceToSizeRatio;
            const radius = maxRadius * progress;

            // Treat the shockwave as a ring with configurable thickness
            const halfThickness = (config.ExplosionShockwaveWidth || 4) * 0.5;

            for (const spirit of spiritEntities) {
                if (!this.ecs.hasEntity(spirit)) continue; // may have been killed by a prior explosion this frame
                const sTransform = this.ecs.getComponent(spirit, Transform);
                if (!sTransform) continue;

                const dx = sTransform.pos.x - exTransform.pos.x;
                const dy = sTransform.pos.y - exTransform.pos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Intersect the leading edge band: [radius - t/2, radius + t/2]
                if (Math.abs(dist - radius) <= halfThickness) {
                    EventBus.emit(GameEvents.SPIRIT_COLLECTED);
                    this.ecs.removeEntity(spirit);
                }
            }
        }
    }

    public destroy(): void {}
}
