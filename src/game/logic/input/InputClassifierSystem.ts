import { System } from "../core/ECS";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { ConfigManager, ConfigType } from "../../api/ConfigManager";
import { groundConfig } from "../../consts/backgrounds";
import { HasBoomerang } from "../player/components/HasBoomerang";
import { InputIntentState, PointerIntent } from "./InputIntentState";
import { InputState, PointerData } from "../core/input/InputState";

export class InputClassifierSystem extends System {
    public componentsRequired = new Set<Function>();
    private readonly config: ConfigType = ConfigManager.get();
    private readonly groundY: number;

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
                if (!intentState.intents.has(pointerId)) {
                    const newIntent = this.classify(pointer);
                    intentState.intents.set(pointerId, newIntent);
                }
            } else {
                if (intentState.intents.has(pointerId)) {
                    intentState.intents.delete(pointerId);
                }
            }
        }
    }

    private classify(pointer: PointerData): PointerIntent {
        const player = getPlayerEntity(this.ecs);
        if (player === -1) {
            return PointerIntent.MOVE; // Default to move if no player
        }

        const playerHasBoomerang = this.ecs.hasComponent(player, HasBoomerang);

        // If the player doesn't have a boomerang, any touch is only for movement.
        if (!playerHasBoomerang) {
            return PointerIntent.MOVE;
        }

        // If the player has a boomerang, all touches are for movement.
        let intent: PointerIntent = PointerIntent.MOVE;

        // If the touch is above the ground, it is ALSO for charging.
        const isAboveGround = pointer.downPos.y < this.groundY;
        if (isAboveGround) {
            intent |= PointerIntent.CHARGE;
        }

        return intent;
    }

    public destroy(): void {}
}
