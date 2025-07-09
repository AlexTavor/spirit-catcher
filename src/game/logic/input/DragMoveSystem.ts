import { System } from "../core/ECS";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { Transform } from "../core/components/Transform";
import { ConfigManager } from "../../api/ConfigManager";
import { EventBus } from "../../api/EventBus";
import { GameInputEvent } from "../api/GameInputEvent";
import { CommandBus } from "../../api/CommandBus";
import { GameCommands } from "../../consts/GameCommands";
import { IsInputDown } from "./IsInputDown";
import { DragState } from "./DragState";
import { Math as PhaserMath } from "phaser";
import { HasBoomerang } from "../player/components/HasBoomerang";

interface GameInputPayload {
    pos: { x: number; y: number };
    pointerId: number;
}

export class DragMoveSystem extends System {
    public componentsRequired = new Set<Function>();

    constructor() {
        super();
        EventBus.on(GameInputEvent.DOWN, this.onDown, this);
        EventBus.on(GameInputEvent.MOVE, this.onMove, this);
        EventBus.on(GameInputEvent.UP, this.onUp, this);
    }

    destroy(): void {
        EventBus.removeListener(GameInputEvent.DOWN, this.onDown, this);
        EventBus.removeListener(GameInputEvent.MOVE, this.onMove, this);
        EventBus.removeListener(GameInputEvent.UP, this.onUp, this);
    }

    onDown(payload: GameInputPayload): void {
        const player = getPlayerEntity(this.ecs);
        if (player === -1 || this.ecs.hasComponent(player, DragState)) return;

        const transform = this.ecs.getComponent(player, Transform);

        const state = new DragState();
        state.pointerId = payload.pointerId;
        state.fingerStartX = payload.pos.x;
        state.playerStartX = transform.pos.x;
        state.targetX = transform.pos.x;

        this.ecs.addComponent(player, state);
        this.ecs.addComponent(player, new IsInputDown());
    }

    onMove(payload: GameInputPayload): void {
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;
        const state = this.ecs.getComponent(player, DragState);
        if (!state || state.pointerId !== payload.pointerId) return;

        const config = ConfigManager.get();
        const deltaX = payload.pos.x - state.fingerStartX;
        state.targetX = PhaserMath.Clamp(
            state.playerStartX + deltaX,
            0,
            config.GameWidth - config.PlayerWidth,
        );
    }

    onUp(payload: GameInputPayload): void {
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;
        const state = this.ecs.getComponent(player, DragState);
        if (!state || state.pointerId !== payload.pointerId) return;

        const transform = this.ecs.getComponent(player, Transform);
        const config = ConfigManager.get();

        if (this.ecs.hasComponent(player, HasBoomerang)) {
            CommandBus.emit(GameCommands.ThrowBoomerangCommand, {
                chargeLevel: 1,
                maxChargeLevel: 1,
                playerId: player,
                target: { x: transform.pos.x, y: 0 },
                from: {
                    x: transform.pos.x,
                    y:
                        transform.pos.y -
                        config.PlayerHeight / 2 -
                        config.BoomerangSpawnOffsetY,
                },
            });
        }

        this.ecs.removeComponent(player, DragState);
        this.ecs.removeComponent(player, IsInputDown);
    }

    update(): void {
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;
        if (!this.ecs.hasComponent(player, DragState)) return;

        const transform = this.ecs.getComponent(player, Transform);
        const state = this.ecs.getComponent(player, DragState);
        const ease = ConfigManager.get().PlayerMovementEaseValue;

        transform.pos.x = PhaserMath.Linear(
            transform.pos.x,
            state.targetX,
            ease,
        );
    }
}
