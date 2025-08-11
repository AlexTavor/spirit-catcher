import { ECS } from "../core/ECS";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { EventBus } from "../../api/EventBus";
import { GameInputEvent } from "../api/GameInputEvent";
import { IsInputDown } from "./IsInputDown";
import { DragState } from "./DragState";
import { HasBoomerang } from "../player/components/HasBoomerang";
import { throwPlayerBoomerang } from "../player/utils/throwPlayerBoomerang";
import { GameState } from "../level/GameState";
import { getLevelState } from "../../utils/getLevelState";

interface GameInputPayload {
    pos: { x: number; y: number };
    pointerId: number;
}

export class DragInput {
    constructor(public ecs: ECS) {
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
        if (DragInput.isDisabled(this.ecs)) return;
        const player = getPlayerEntity(this.ecs);
        if (player === -1 || this.ecs.hasComponent(player, DragState)) return;

        const state = new DragState();
        state.pointerId = payload.pointerId;
        state.startX = payload.pos.x;
        state.previousX = payload.pos.x;
        state.currentX = payload.pos.x;

        this.ecs.addComponent(player, state);
        this.ecs.addComponent(player, new IsInputDown());
    }

    onMove(payload: GameInputPayload): void {
        if (DragInput.isDisabled(this.ecs)) return;
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;
        const state = this.ecs.getComponent(player, DragState);
        if (!state || state.pointerId !== payload.pointerId) return;

        // Update previous and current positions
        state.previousX = state.currentX;
        state.currentX = payload.pos.x;
    }

    onUp(payload: GameInputPayload): void {
        if (DragInput.isDisabled(this.ecs)) return;
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;
        const state = this.ecs.getComponent(player, DragState);
        if (!state || state.pointerId !== payload.pointerId) return;

        if (this.ecs.hasComponent(player, HasBoomerang)) {
            throwPlayerBoomerang(player, this.ecs);
        }

        this.ecs.removeComponent(player, DragState);
        this.ecs.removeComponent(player, IsInputDown);
    }

    update(): void {}

    public static isDisabled(ecs: any): boolean {
        const lvl = getLevelState(ecs);
        if (!lvl || lvl.gameState == GameState.WAVE_CLEARED) return true;

        return false;
    }
}
