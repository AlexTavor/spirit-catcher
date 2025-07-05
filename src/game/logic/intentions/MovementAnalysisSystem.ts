import { System } from "../core/ECS";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { MoveIntention } from "./MoveIntention";
import { ConfigManager } from "../../api/ConfigManager";
import { groundConfig } from "../../consts/backgrounds";
import { HasBoomerang } from "../player/components/HasBoomerang";
import { InputState, PointerData } from "../core/input/InputStateComponent";

export class MovementAnalysisSystem extends System {
    public componentsRequired = new Set<Function>();
    private readonly groundY: number;

    constructor() {
        super();
        this.groundY = ConfigManager.get().GameHeight - groundConfig().height;
    }

    update() {
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        const inputState = this.ecs.getComponent(this.ecs.world, InputState);
        const moveIntention = this.ecs.getComponent(player, MoveIntention);
        const playerHasBoomerang = this.ecs.hasComponent(player, HasBoomerang);

        let latestMovePointer: PointerData | null = null;

        // Find the most recent pointer that qualifies as a "move" action based on game state
        for (const pointer of inputState.pointers) {
            if (pointer.isDown) {
                // Rule: If player has no boomerang, any tap is a move.
                // If player has a boomerang, only ground taps are a move.
                const isGroundTap = pointer.currentPos.y >= this.groundY;
                const isValidMove = !playerHasBoomerang || isGroundTap;

                if (isValidMove) {
                    if (
                        !latestMovePointer ||
                        pointer.downTimestamp > latestMovePointer.downTimestamp
                    ) {
                        latestMovePointer = pointer;
                    }
                }
            }
        }

        // Update the MoveIntention component based on our findings
        if (latestMovePointer) {
            moveIntention.active = true;
            moveIntention.targetPos = latestMovePointer.currentPos;
        } else {
            moveIntention.active = false;
        }
    }

    public destroy(): void {}
}
