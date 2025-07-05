import { EventBus } from "../../../api/EventBus";
import { System } from "../ECS";
import { Pos } from "../../../../utils/Math";
import { GameInputEvent } from "../../api/GameInputEvent";
import { Analytics } from "../../../api/Analytics";
import { AnalyticsEvent } from "../../api/AnalyticsEvent";
import { InputState } from "./InputStateComponent";

interface GameInputPayload {
    pos: Pos;
    pointerId: number;
}

/**
 * Listens for raw input events and updates the central InputState component.
 * It does not interpret the input; its only job is state management.
 */
export class InputSystem extends System {
    public componentsRequired = new Set<Function>();
    private inputState!: InputState;

    constructor() {
        super();

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

        // Find the first available pointer slot in our pool
        const pointer = this.inputState.pointers.find((p) => !p.isDown);
        if (!pointer) return; // No available slots

        // Activate the slot with the new pointer's data
        pointer.isDown = true;
        pointer.pointerId = payload.pointerId;
        pointer.downPos = { ...payload.pos };
        pointer.currentPos = { ...payload.pos };
        pointer.downTimestamp = Date.now();
    }

    private onMove(payload: GameInputPayload): void {
        const pointer = this.inputState.pointers.find(
            (p) => p.isDown && p.pointerId === payload.pointerId,
        );
        if (!pointer) return;

        pointer.currentPos = { ...payload.pos };
    }

    private onUp(payload: GameInputPayload): void {
        Analytics.emit(AnalyticsEvent.UP, { ...payload });
        const pointer = this.inputState.pointers.find(
            (p) => p.isDown && p.pointerId === payload.pointerId,
        );
        if (!pointer) return;

        // Deactivate the slot, making it available for the next touch
        pointer.isDown = false;
    }

    public update(): void {
        // Ensure the InputState component is initialized
        if (!this.inputState) {
            if (!this.ecs.hasComponent(this.ecs.world, InputState)) {
                // If the InputState component doesn't exist, create it
                this.ecs.addComponent(this.ecs.world, new InputState());
            }

            this.inputState = this.ecs.getComponent(this.ecs.world, InputState);
        }
    }
}
