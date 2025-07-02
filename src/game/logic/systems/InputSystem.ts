import { System } from "../core/ECS";
import { EventBus } from "../../api/EventBus";
import { GameUIEvent } from "../../consts/GameUIEvent";
import { Pos } from "../../../utils/Math";
import { CommandBus } from "../../api/CommandBus";
import { GameCommands } from "../../consts/GameCommands";

import { Charging } from "../components/Charging";
import { Transform } from "../components/Transform";
import { HasBoomerang } from "../components/HasBoomerang";
import { IsCharging } from "../components/IsCharging";
import { PlayerConfig } from "../components/PlayerConfig";
import { TargetIndicator } from "../components/TargetIndicator";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { GROUND_EVENTS } from "./MovementInputSystem";

export class InputSystem extends System {
    public componentsRequired = new Set<Function>();

    constructor() {
        super();
        EventBus.on(GameUIEvent.TAP_START, this.handleTapStart, this);
        EventBus.on(GameUIEvent.TAP_END, this.handleTapEnd, this);
    }

    public destroy(): void {
        EventBus.removeListener(
            GameUIEvent.TAP_START,
            this.handleTapStart,
            this,
        );
        EventBus.removeListener(GameUIEvent.TAP_END, this.handleTapEnd, this);
    }

    public update(): void {}

    private handleTapStart(pos: Pos): void {
        const playerEntity = getPlayerEntity(this.ecs);

        // If there is no boomerang, we want to signal the ground that the player tapped.
        if (!this.ecs.hasComponent(playerEntity, HasBoomerang)) {
            EventBus.emit(GROUND_EVENTS.DOWN, pos);
            return;
        }

        // Can only start charging if holding a boomerang and not already charging.
        if (this.ecs.hasComponent(playerEntity, IsCharging)) {
            return;
        }

        // Create a new entity to represent the charge indicator.
        const indicatorEntity = this.ecs.addEntity();

        // It has a position and identifies as a TargetIndicator.
        const transform = new Transform();
        transform.pos = pos; // Set the position to where the player tapped.
        this.ecs.addComponent(indicatorEntity, transform);
        this.ecs.addComponent(indicatorEntity, new TargetIndicator());

        // It also gets the Charging component, configured by the player.
        const playerConfig = this.ecs.getComponent(playerEntity, PlayerConfig);
        if (!playerConfig) {
            throw new Error(
                "PlayerConfig component is missing on the player entity.",
            );
        }

        const chargingComponent = new Charging();
        chargingComponent.maxLevel = playerConfig.chargeMaxLevel;
        chargingComponent.chargeRate = playerConfig.chargeRate;
        this.ecs.addComponent(indicatorEntity, chargingComponent);

        // Finally, update the player's state to link to the indicator.
        const isCharging = new IsCharging();
        isCharging.indicatorEntityId = indicatorEntity;
        this.ecs.addComponent(playerEntity, isCharging);
    }

    private handleTapEnd(): void {
        const playerEntity = getPlayerEntity(this.ecs);

        if (!this.ecs.hasComponent(playerEntity, HasBoomerang)) {
            EventBus.emit(GROUND_EVENTS.UP);
            return;
        }

        if (!this.ecs.hasComponent(playerEntity, IsCharging)) {
            return;
        }

        const isCharging = this.ecs.getComponent(playerEntity, IsCharging);
        const indicatorId = isCharging.indicatorEntityId;

        // Ensure the indicator entity still exists before proceeding.
        if (!this.ecs.hasEntity(indicatorId)) {
            this.ecs.removeComponent(playerEntity, IsCharging); // Cleanup stale component
            return;
        }

        const chargeComponent = this.ecs.getComponent(indicatorId, Charging);
        const transform = this.ecs.getComponent(indicatorId, Transform);

        // Issue the command to throw.
        CommandBus.emit(GameCommands.ThrowBoomerangCommand, {
            chargeLevel: chargeComponent.level,
            maxChargeLevel: chargeComponent.maxLevel,
            playerId: playerEntity,
            target: transform.pos,
        });

        // Update player state: no longer charging, no longer has boomerang.
        this.ecs.removeComponent(playerEntity, IsCharging);
        this.ecs.removeComponent(playerEntity, HasBoomerang);

        // The indicator entity is no longer needed.
        this.ecs.removeEntity(indicatorId);
    }
}
