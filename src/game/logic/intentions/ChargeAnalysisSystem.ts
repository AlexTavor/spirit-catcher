import { System } from "../core/ECS";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { ChargeIntention } from "./ChargeIntention";
import { HasBoomerang } from "../player/components/HasBoomerang";
import { InputIntentState, PointerIntent } from "./InputIntentState";

/**
 * Reads the classified pointer intents and activates the player's high-level
 * ChargeIntention if any pointer has a CHARGE intent flag.
 */
export class ChargeAnalysisSystem extends System {
    public componentsRequired = new Set<Function>();

    update() {
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        const intentState = InputIntentState.get(this.ecs);
        const chargeIntention = this.ecs.getComponent(player, ChargeIntention);
        const playerHasBoomerang = this.ecs.hasComponent(player, HasBoomerang);

        let isChargingActive = false;

        // Player can only charge if they have the boomerang.
        if (playerHasBoomerang) {
            // Check if any locked-in intent includes the CHARGE flag.
            for (const intent of intentState.intents.values()) {
                // Use a bitwise AND to check if the CHARGE flag is set in the bitmask.
                if ((intent & PointerIntent.CHARGE) > 0) {
                    isChargingActive = true;
                    break; // Found a valid charge intent, no need to check further.
                }
            }
        }

        chargeIntention.active = isChargingActive;
    }

    public destroy(): void {}
}
