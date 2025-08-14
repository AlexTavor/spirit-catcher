import { CommandBus } from "../../../api/CommandBus";
import { EventBus } from "../../../api/EventBus";
import { ConfigManager } from "../../../consts/ConfigManager";
import { GameCommands } from "../../../consts/GameCommands";
import {
    BoomerangQuickFallCaughtPayload,
    GameEvents,
} from "../../../consts/GameEvents";
import { getUpgradesState } from "../../../utils/getUpgradesState";
import { Transform } from "../../core/components/Transform";
import { Entity, System } from "../../core/ECS";
import { ProjectileType } from "../../projectile/ProjectileType";
import { PlayerUpgradeType } from "../PlayerUpgradeType";

export class CaughtProjectileShootingSystem extends System {
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
        const numProjectilesToSpawn =
            getUpgradesState(this.ecs).upgrades[
                PlayerUpgradeType.CAUGHT_RANG_PROJECTILE
            ] || 0;

        if (numProjectilesToSpawn <= 0) {
            return;
        }

        const config = ConfigManager.get();

        const boomerangEntity = payload.entityId;
        for (
            let i = 0;
            i < numProjectilesToSpawn * config.ProjectilesPerUpgrade;
            i++
        ) {
            CommandBus.emit(GameCommands.SPAWN_PROJECTILE, {
                type: ProjectileType.TOP_SEEKING,
                origin: this.ecs.getComponent(boomerangEntity, Transform).pos,
            });
        }
    }

    public update(_entities: Set<Entity>, _delta: number): void {
        // This system doesn't need to update anything continuously.
        // It only reacts to the RANG_QUICK_FALL_CAUGHT event.
    }

    public destroy(): void {
        EventBus.removeListener(
            GameEvents.RANG_QUICK_FALL_CAUGHT,
            this.handleCaughtProjectileShooting,
            this,
        );
    }
}
