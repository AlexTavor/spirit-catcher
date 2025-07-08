import { EventBus } from "../../api/EventBus";
import { ConfigManager } from "../../api/ConfigManager";
import { GameInputEvent } from "../api/GameInputEvent";
import { Pos } from "../../../utils/Math";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { System } from "../core/ECS";
import { MoveIntention } from "./MoveIntention";
import { ChargeIntention } from "./ChargeIntention";
import { HasBoomerang } from "../player/components/HasBoomerang";

interface GameInputPayload {
    pos: Pos;
    pointerId: number;
}

export class ThumbstickInputSystem extends System {
    public componentsRequired = new Set<Function>();

    private activePointerId: number | null = null;
    private downPos: Pos | null = null;

    private readonly deadzone = 20; // Pixels
    private readonly leftEdgePos: Pos;
    private readonly rightEdgePos: Pos;

    constructor() {
        super();

        const config = ConfigManager.get();
        const targetY = config.GameHeight;
        this.leftEdgePos = { x: 0, y: targetY };
        this.rightEdgePos = { x: config.GameWidth, y: targetY };

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
        if (this.activePointerId !== null) return; // Another pointer is already active

        this.activePointerId = payload.pointerId;
        this.downPos = payload.pos;

        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        // If the player has a boomerang, touching down begins the 'intent' to throw.
        if (this.ecs.hasComponent(player, HasBoomerang)) {
            const chargeIntention = this.ecs.getComponent(
                player,
                ChargeIntention,
            );
            if (chargeIntention) {
                chargeIntention.active = true;
            }
        }
    }

    private onMove(payload: GameInputPayload): void {
        if (payload.pointerId !== this.activePointerId || !this.downPos) return;

        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        const moveIntention = this.ecs.getComponent(player, MoveIntention);
        if (!moveIntention) return;

        const deltaX = payload.pos.x - this.downPos.x;

        if (deltaX > this.deadzone) {
            moveIntention.active = true;
            moveIntention.targetPos = this.rightEdgePos;
        } else if (deltaX < -this.deadzone) {
            moveIntention.active = true;
            moveIntention.targetPos = this.leftEdgePos;
        } else {
            // Within deadzone, so no movement intention.
            moveIntention.active = false;
        }
    }

    private onUp(payload: GameInputPayload): void {
        if (payload.pointerId !== this.activePointerId) return;

        const player = getPlayerEntity(this.ecs);
        if (player !== -1) {
            // Deactivate movement
            const moveIntention = this.ecs.getComponent(player, MoveIntention);
            if (moveIntention) {
                moveIntention.active = false;
            }

            // Deactivate charge intention, which signals ChargeIntentionSystem to throw.
            const chargeIntention = this.ecs.getComponent(
                player,
                ChargeIntention,
            );
            if (chargeIntention) {
                chargeIntention.active = false;
            }
        }

        // Reset state to allow another pointer to take control
        this.activePointerId = null;
        this.downPos = null;
    }

    public update(): void {
        // This system is entirely event-driven.
    }
}
