import { System } from "../core/ECS";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { Transform } from "../core/components/Transform";
import { ConfigManager } from "../../api/ConfigManager";
import { EventBus } from "../../api/EventBus";
import { GameInputEvent } from "../api/GameInputEvent";
import { CommandBus } from "../../api/CommandBus";
import { GameCommands } from "../../consts/GameCommands";
import { IsInputDown } from "./IsInputDown";
import { Math as PhaserMath } from "phaser";

interface GameInputPayload {
    pos: { x: number; y: number };
    pointerId: number;
}

export class DragMoveSystem extends System {
    public componentsRequired = new Set<Function>();

    private activePointerId: number | null = null;
    private fingerStartX = 0;
    private playerStartX = 0;
    private targetX = 0;

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
        if (this.activePointerId !== null) return;

        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        const transform = this.ecs.getComponent(player, Transform);

        this.activePointerId = payload.pointerId;
        this.fingerStartX = payload.pos.x;
        this.playerStartX = transform.pos.x;
        this.targetX = transform.pos.x;

        this.ecs.addComponent(player, new IsInputDown());
    }

    onMove(payload: GameInputPayload): void {
        if (payload.pointerId !== this.activePointerId) return;

        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        const deltaX = payload.pos.x - this.fingerStartX;
        this.targetX = this.playerStartX + deltaX;

        const config = ConfigManager.get();
        this.targetX = PhaserMath.Clamp(
            this.targetX,
            0,
            config.GameWidth - config.PlayerWidth,
        );
    }

    onUp(payload: GameInputPayload): void {
        if (payload.pointerId !== this.activePointerId) return;

        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        const transform = this.ecs.getComponent(player, Transform);
        const config = ConfigManager.get();

        // Emit throw
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

        this.ecs.removeComponent(player, IsInputDown);
        this.activePointerId = null;
    }

    update(): void {
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        const transform = this.ecs.getComponent(player, Transform);
        const config = ConfigManager.get();
        const ease = config.PlayerMovementEaseValue;

        transform.pos.x = PhaserMath.Linear(
            transform.pos.x,
            this.targetX,
            ease,
        );
    }
}
