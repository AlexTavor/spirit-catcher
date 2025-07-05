import { CommandBus } from "../../api/CommandBus";
import { ConfigManager, ConfigType } from "../../api/ConfigManager";
import { EventBus } from "../../api/EventBus";
import { groundConfig } from "../../consts/backgrounds";
import { GameCommands } from "../../consts/GameCommands";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { System, Entity } from "../core/ECS";
import { HasBoomerang } from "../player/components/HasBoomerang";
import { IsCharging } from "../player/components/IsCharging";
import { Charging } from "../components/Charging";
import { Transform } from "../components/Transform";
import { Geom } from "phaser";
import { Pos } from "../../../utils/Math";
import { MoveIntention } from "../intentions/MoveIntention";
import { ChargeIntention } from "../intentions/ChargeIntention";
import { GameInputEvent } from "./GameInputEvent";
import { Analytics } from "../../api/Analytics";
import { AnalyticsEvent } from "./AnalyticsEvent";

enum InputState {
    IDLE,
    MOVING,
    CHARGING,
}

/**
 * The data payload associated with a raw input event.
 */
interface GameInputPayload {
    pos: Pos;
    pointerId: number;
}

export class InputSystem extends System {
    public componentsRequired = new Set<Function>();

    private state: InputState = InputState.IDLE;
    private readonly groundY: number;
    private readonly config: ConfigType;

    private activePointerId: number | null = null;

    constructor() {
        super();
        this.config = ConfigManager.get();
        this.groundY = this.config.GameHeight - groundConfig().height;

        EventBus.on(GameInputEvent.DOWN, this.onDown, this);
        EventBus.on(GameInputEvent.UP, this.onUp, this);
        EventBus.on(GameInputEvent.MOVE, this.onMove, this);
    }

    public destroy(): void {
        EventBus.removeListener(GameInputEvent.DOWN, this.onDown, this);
        EventBus.removeListener(GameInputEvent.UP, this.onUp, this);
        EventBus.removeListener(GameInputEvent.MOVE, this.onMove, this);
    }

    private onDown(payload: GameInputPayload): void {
        Analytics.emit(AnalyticsEvent.DOWN, {
            pos: { x: Math.round(payload.pos.x), y: Math.round(payload.pos.y) },
            pointerId: payload.pointerId,
        });

        if (this.activePointerId !== null) return;

        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        this.activePointerId = payload.pointerId;

        if (this.ecs.hasComponent(player, HasBoomerang)) {
            this.handleDownWithBoomerang(player, payload);
        } else {
            this.handleDownWithoutBoomerang(player, payload);
        }
    }

    private handleDownWithBoomerang(
        player: Entity,
        payload: GameInputPayload,
    ): void {
        const playerTransform = this.ecs.getComponent(player, Transform);
        const playerBounds = new Geom.Rectangle(
            playerTransform.pos.x,
            playerTransform.pos.y,
            this.config.PlayerWidth,
            this.config.PlayerHeight,
        );

        const isChargeTap =
            Geom.Rectangle.Contains(
                playerBounds,
                payload.pos.x,
                payload.pos.y,
            ) || payload.pos.y < this.groundY;

        if (isChargeTap) {
            this.state = InputState.CHARGING;
            this.ecs.getComponent(player, ChargeIntention).active = true;
        } else {
            this.state = InputState.MOVING;
            const moveIntention = this.ecs.getComponent(player, MoveIntention);
            moveIntention.active = true;
            moveIntention.targetPos = payload.pos;
        }
    }

    private handleDownWithoutBoomerang(
        player: Entity,
        payload: GameInputPayload,
    ): void {
        this.state = InputState.MOVING;
        const moveIntention = this.ecs.getComponent(player, MoveIntention);
        moveIntention.active = true;
        moveIntention.targetPos = payload.pos;
    }

    private onMove(payload: GameInputPayload): void {
        if (payload.pointerId !== this.activePointerId) return;

        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        const moveIntention = this.ecs.getComponent(player, MoveIntention);
        moveIntention.active = true;
        moveIntention.targetPos = payload.pos;
    }

    private onUp(payload: GameInputPayload): void {
        Analytics.emit(AnalyticsEvent.UP, {
            pos: { x: Math.round(payload.pos.x), y: Math.round(payload.pos.y) },
            pointerId: payload.pointerId,
        });

        if (payload.pointerId !== this.activePointerId) return;

        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        if (this.state === InputState.CHARGING) {
            this.ecs.getComponent(player, ChargeIntention).active = false;
            this.throwBoomerang(player);
        }

        this.ecs.getComponent(player, MoveIntention).active = false;

        this.activePointerId = null;
        this.state = InputState.IDLE;
    }

    private throwBoomerang(player: Entity): void {
        const isCharging = this.ecs.getComponent(player, IsCharging);
        if (!isCharging) return;

        const indicatorId = isCharging.indicatorEntityId;
        const charge = this.ecs.getComponent(indicatorId, Charging);
        if (!charge) return;

        CommandBus.emit(GameCommands.ThrowBoomerangCommand, {
            chargeLevel: charge.level,
            maxChargeLevel: charge.maxLevel,
            playerId: player,
            target: { x: this.config.GameWidth / 2, y: 0 },
        });
    }

    public update(): void {}
}
