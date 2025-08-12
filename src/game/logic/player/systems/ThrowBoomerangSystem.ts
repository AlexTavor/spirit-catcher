import { System, Entity } from "../../core/ECS";
import { CommandBus } from "../../../api/CommandBus";
import { GameCommands } from "../../../consts/GameCommands";
import { Pos, MathUtils } from "../../../../utils/Math";
import { Transform } from "../../core/components/Transform";
import { Velocity } from "../../core/components/Velocity";
import { Boomerang } from "../../boomerang/components/Boomerang";
import { Airborne } from "../../boomerang/components/Airborne";
import { ConfigManager } from "../../../consts/ConfigManager";
import { HasBoomerang } from "../components/HasBoomerang";

interface ThrowPayload {
    chargeLevel: number;
    maxChargeLevel: number;
    playerId: Entity;
    target: Pos;
    from: Pos;
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
        const { playerId, target, from } = payload;

        const boomerang = this.ecs.addEntity();

        const transform = new Transform();
        transform.pos = from;
        this.ecs.addComponent(boomerang, transform);

        // Calculate throw velocity based on direction and charge level.
        // Get the direction from the spawn point to the target.
        const direction = MathUtils.subtract(target, from);
        const normalizedDirection = MathUtils.normalizePos(direction);

        const throwSpeed = ConfigManager.get().BoomerangThrowMinForce;

        // Combine direction and speed to get the final velocity vector.
        const velocityVector = MathUtils.multiply(
            normalizedDirection,
            throwSpeed,
        );
        this.ecs.addComponent(boomerang, new Velocity(velocityVector));

        // Add tag components.
        this.ecs.addComponent(boomerang, new Boomerang());
        this.ecs.addComponent(boomerang, new Airborne());

        // Remove the boomerang from the player.
        this.ecs.removeComponent(playerId, HasBoomerang);
    }
}
