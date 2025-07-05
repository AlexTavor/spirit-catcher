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

interface GameInputPayload {
    pos: Pos;
    pointerId: number;
}

interface PointerState {
    state: InputState;
    pos: Pos;
}

export class InputSystem extends System {
    public componentsRequired = new Set<Function>();

    private readonly groundY: number;
    private readonly config: ConfigType;

    // Use a Map to track the state of each active pointer
    private activePointers = new Map<number, PointerState>();
    private movementPointerId: number | null = null;

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
        Analytics.emit(AnalyticsEvent.DOWN, { ...payload });
        if (this.activePointers.has(payload.pointerId)) return;

        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        const playerHasBoomerang = this.ecs.hasComponent(player, HasBoomerang);
        const playerTransform = this.ecs.getComponent(player, Transform);
        const playerBounds = new Geom.Rectangle(
            playerTransform.pos.x,
            playerTransform.pos.y,
            this.config.PlayerWidth,
            this.config.PlayerHeight,
        );

        // Determine if the action is charging or moving
        const isChargeTap =
            playerHasBoomerang &&
            (Geom.Rectangle.Contains(
                playerBounds,
                payload.pos.x,
                payload.pos.y,
            ) ||
                payload.pos.y < this.groundY);

        const newState = isChargeTap ? InputState.CHARGING : InputState.MOVING;

        // Store the new pointer's state
        this.activePointers.set(payload.pointerId, {
            state: newState,
            pos: payload.pos,
        });

        // "Last touch wins" for movement
        if (newState === InputState.MOVING) {
            this.movementPointerId = payload.pointerId;
        }

        this.updatePlayerIntentions();
    }

    private onMove(payload: GameInputPayload): void {
        const pointer = this.activePointers.get(payload.pointerId);
        if (!pointer) return;

        // Update the pointer's position
        pointer.pos = payload.pos;

        // If this pointer is controlling movement, update the player's move intention
        if (payload.pointerId === this.movementPointerId) {
            const player = getPlayerEntity(this.ecs);
            if (player === -1) return;
            const moveIntention = this.ecs.getComponent(player, MoveIntention);
            moveIntention.targetPos = payload.pos;
        }
    }

    private onUp(payload: GameInputPayload): void {
        Analytics.emit(AnalyticsEvent.UP, { ...payload });
        const releasedPointer = this.activePointers.get(payload.pointerId);
        if (!releasedPointer) return;

        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        // If the released pointer was for charging, throw the boomerang
        if (releasedPointer.state === InputState.CHARGING) {
            this.throwBoomerang(player);
        }

        this.activePointers.delete(payload.pointerId);

        // If the released pointer was the one controlling movement, find a new one
        if (payload.pointerId === this.movementPointerId) {
            this.movementPointerId = null;
            // Find the last-touched pointer that is still in a MOVING state
            for (const [id, data] of this.activePointers) {
                if (data.state === InputState.MOVING) {
                    this.movementPointerId = id;
                }
            }
        }

        this.updatePlayerIntentions();
    }

    /**
     * Updates the player's intention components based on the current state of all active pointers.
     */
    private updatePlayerIntentions(): void {
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        const moveIntention = this.ecs.getComponent(player, MoveIntention);
        const chargeIntention = this.ecs.getComponent(player, ChargeIntention);

        // Update Move Intention
        if (this.movementPointerId !== null) {
            const movePointer = this.activePointers.get(this.movementPointerId);
            if (movePointer) {
                moveIntention.active = true;
                moveIntention.targetPos = movePointer.pos;
            }
        } else {
            moveIntention.active = false;
        }

        // Update Charge Intention
        let isCharging = false;
        for (const data of this.activePointers.values()) {
            if (data.state === InputState.CHARGING) {
                isCharging = true;
                break;
            }
        }
        chargeIntention.active = isCharging;
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
