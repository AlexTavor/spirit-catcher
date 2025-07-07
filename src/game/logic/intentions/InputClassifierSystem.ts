import { System } from "../core/ECS";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { ConfigManager, ConfigType } from "../../api/ConfigManager";
import { groundConfig } from "../../consts/backgrounds";
import { Geom } from "phaser";
import { Transform } from "../components/Transform";
import { HasBoomerang } from "../player/components/HasBoomerang";
import { InputIntentState, PointerIntent } from "./InputIntentState";
import { InputState, PointerData } from "../core/input/InputState";

/**
 * Reads raw input state and classifies the initial, locked-in intents for each new pointer.
 * It assigns a bitmask of intents, allowing a single input to trigger multiple actions.
 */
export class InputClassifierSystem extends System {
    public componentsRequired = new Set<Function>();

    // Cache config and groundY on creation for performance.
    private readonly config: ConfigType = ConfigManager.get();
    private readonly groundY: number;
    // Re-use this rectangle object to avoid creating new ones every frame.
    private reusablePlayerBounds = new Geom.Rectangle();

    constructor() {
        super();
        this.groundY = this.config.GameHeight - groundConfig().height;
    }

    update() {
        const inputState = InputState.get(this.ecs);
        const intentState = InputIntentState.get(this.ecs);

        for (const pointer of inputState.pointers) {
            const pointerId = pointer.pointerId;

            if (pointer.isDown) {
                // If this is a new pointer, classify its intent(s) and lock them in.
                if (!intentState.intents.has(pointerId)) {
                    const newIntent = this.classify(pointer);
                    intentState.intents.set(pointerId, newIntent);
                }
            } else {
                // If the pointer is up, remove its locked-in intent.
                if (intentState.intents.has(pointerId)) {
                    intentState.intents.delete(pointerId);
                }
            }
        }
    }

    /**
     * Determines the combined, locked-in intent for a new pointer event.
     * @param pointer The raw pointer data from InputState.
     * @returns A bitmask representing all valid intents for this pointer.
     */
    private classify(pointer: PointerData): PointerIntent {
        // Start by assuming all input can cause movement.
        let intent: PointerIntent = PointerIntent.MOVE;

        const player = getPlayerEntity(this.ecs);
        if (player === -1) return intent;

        // Check for charge conditions
        const playerHasBoomerang = this.ecs.hasComponent(player, HasBoomerang);
        if (playerHasBoomerang) {
            const playerTransform = this.ecs.getComponent(player, Transform);
            this.reusablePlayerBounds.setTo(
                playerTransform.pos.x,
                playerTransform.pos.y,
                this.config.PlayerWidth,
                this.config.PlayerHeight,
            );

            // A tap is for charging if it's in the air or on the player.
            const isChargeTap =
                pointer.downPos.y < this.groundY ||
                Geom.Rectangle.Contains(
                    this.reusablePlayerBounds,
                    pointer.downPos.x,
                    pointer.downPos.y,
                );

            if (isChargeTap) {
                // Add the CHARGE flag to the existing MOVE flag.
                intent |= PointerIntent.CHARGE;
            }
        }

        return intent;
    }

    public destroy(): void {}
}
