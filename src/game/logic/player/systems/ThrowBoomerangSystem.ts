import { System, Entity } from "../../core/ECS";
import { CommandBus } from "../../../api/CommandBus";
import { GameCommands } from "../../../consts/GameCommands";
import { Pos, MathUtils } from "../../../../utils/Math";
import { Transform } from "../../components/Transform";
import { Velocity } from "../../components/Velocity";
import { Boomerang } from "../../boomerang/components/Boomerang";
import { Airborne } from "../../boomerang/components/Airborne";
import { ConfigManager } from "../../../api/ConfigManager";
import { HasBoomerang } from "../components/HasBoomerang";

interface ThrowPayload {
    chargeLevel: number;
    maxChargeLevel: number;
    playerId: Entity;
    target: Pos;
}

export class ThrowBoomerangSystem extends System {
    public componentsRequired = new Set<Function>();

    constructor() {
        super();
        CommandBus.on(
            GameCommands.ThrowBoomerangCommand,
            this.handleThrow,
            this,
        );
    }

    public destroy(): void {
        CommandBus.removeListener(
            GameCommands.ThrowBoomerangCommand,
            this.handleThrow,
            this,
        );
    }

    public update(): void {}

    private handleThrow(payload: ThrowPayload): void {
        const { chargeLevel, maxChargeLevel, playerId, target } = payload;
        const playerTransform = this.ecs.getComponent(playerId, Transform);
        if (!playerTransform) return;

        const boomerang = this.ecs.addEntity();

        // 1. Set initial position above the player's head.
        const spawnPos = {
            x: playerTransform.pos.x,
            y:
                playerTransform.pos.y -
                ConfigManager.get().PlayerHeight -
                ConfigManager.get().BoomerangSpawnOffsetY,
        };

        const transform = new Transform();
        transform.pos = spawnPos;
        this.ecs.addComponent(boomerang, transform);

        // 2. Calculate throw velocity based on direction and charge level.
        // Get the direction from the spawn point to the target.
        const direction = MathUtils.subtract(target, spawnPos);
        const normalizedDirection = MathUtils.normalize(direction);

        // Calculate the magnitude of the throw based on charge level.
        const chargeRatio = Math.min(1, chargeLevel / maxChargeLevel);
        const throwSpeed =
            ConfigManager.get().BoomerangThrowMinForce +
            (ConfigManager.get().BoomerangThrowMaxForce -
                ConfigManager.get().BoomerangThrowMinForce) *
                chargeRatio;

        // Combine direction and speed to get the final velocity vector.
        const velocityVector = MathUtils.multiply(
            normalizedDirection,
            throwSpeed,
        );
        this.ecs.addComponent(
            boomerang,
            new Velocity(velocityVector.x, velocityVector.y),
        );

        // Add tag components.
        this.ecs.addComponent(boomerang, new Boomerang());
        this.ecs.addComponent(boomerang, new Airborne());

        // Remove the boomerang from the player.
        this.ecs.removeComponent(playerId, HasBoomerang);
    }
}
