import { System } from "../core/ECS";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { MoveIntention } from "./MoveIntention";
import { InputIntentState, PointerIntent } from "./InputIntentState";
import { InputState, PointerData } from "../core/input/InputState";

/**
 * Reads the classified pointer intents and activates the player's high-level
 * MoveIntention based on the latest pointer that has a MOVE intent flag.
 */
export class MovementAnalysisSystem extends System {
    public componentsRequired = new Set<Function>();

    update() {
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        const inputState = InputState.get(this.ecs);
        const intentState = InputIntentState.get(this.ecs);
        const moveIntention = this.ecs.getComponent(player, MoveIntention);

        let latestMovePointer: PointerData | null = null;

        // Find the most recent pointer whose locked-in intent includes MOVE.
        for (const [pointerId, intent] of intentState.intents) {
            // Use a bitwise AND to check if the MOVE flag is set in the bitmask.
            if ((intent & PointerIntent.MOVE) > 0) {
                const pointerData = inputState.pointers.find(
                    (p) => p.isDown && p.pointerId === pointerId,
                );

                if (pointerData) {
                    // If multiple pointers have the MOVE intent, use the newest one.
                    if (
                        !latestMovePointer ||
                        pointerData.downTimestamp >
                            latestMovePointer.downTimestamp
                    ) {
                        latestMovePointer = pointerData;
                    }
                }
            }
        }

        // Update the player's MoveIntention based on the winning pointer.
        if (latestMovePointer) {
            moveIntention.active = true;
            moveIntention.targetPos = latestMovePointer.currentPos;
        } else {
            moveIntention.active = false;
        }
    }

    public destroy(): void {}
}
