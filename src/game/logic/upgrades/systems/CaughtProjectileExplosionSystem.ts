import { EventBus } from "../../../api/EventBus";
import { ConfigManager } from "../../../consts/ConfigManager";
import {
    BoomerangQuickFallCaughtPayload,
    GameEvents,
} from "../../../consts/GameEvents";
import { getUpgradesState } from "../../../utils/getUpgradesState";
import { Transform } from "../../core/components/Transform";
import { Entity, System } from "../../core/ECS";
import { createExplosion } from "../../explosion/ExplosionFactory";
import { PlayerUpgradeType } from "../PlayerUpgradeType";

export class CaughtProjectileExplosionSystem extends System {
    public componentsRequired: Set<Function> = new Set<Function>();

    constructor() {
        super();
        EventBus.on(
            GameEvents.RANG_QUICK_FALL_CAUGHT,
            this.handleCaughtProjectileShooting,
            this,
        );
    }

    private handleCaughtProjectileShooting(
        payload: BoomerangQuickFallCaughtPayload,
    ): void {
        const exploisionLevel =
            getUpgradesState(this.ecs).upgrades[
                PlayerUpgradeType.CAUGHT_RANG_EXPLOSION
            ] || 0;

        if (exploisionLevel <= 0) {
            return;
        }

        const config = ConfigManager.get();
        const explosionForce =
            config.CaughtQuickfallExplosionBaseForce +
            config.CaughtQuickfallExplosionAddForce * exploisionLevel;
        const origin = this.ecs.getComponent(payload.entityId, Transform).pos;

        createExplosion(this.ecs, origin, explosionForce);
    }

    public update(_entities: Set<Entity>, _delta: number): void {
        // This system doesn't need to update anything continuously.
    }

    public destroy(): void {
        EventBus.removeListener(
            GameEvents.RANG_QUICK_FALL_CAUGHT,
            this.handleCaughtProjectileShooting,
            this,
        );
    }
}
