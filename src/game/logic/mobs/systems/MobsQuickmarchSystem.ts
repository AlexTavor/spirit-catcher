import { System, Entity } from "../../core/ECS";
import { Transform } from "../../core/components/Transform";
import { Mob } from "../components/Mob";
import { ConfigManager } from "../../../api/ConfigManager";
import { LevelState } from "../../level/LevelState";
import { CommandBus } from "../../../api/CommandBus";
import {
    GameCommands,
    TransitionToStatePayload,
} from "../../../consts/GameCommands";
import { getMobsState } from "../../../utils/getMobsState";

/**
 * Handles the fast, downward "march" of mobs into their starting
 * positions. This now runs for both the start of a wave and for subsequent advances.
 */
export class MobsQuickMarchSystem extends System {
    public componentsRequired = new Set<Function>([Mob, Transform]);

    private readonly quickMarchSpeed: number = 800;
    private readonly targetY: number;

    constructor() {
        super();
        const config = ConfigManager.get();
        this.targetY = config.MobHeight * 8;
    }

    public override update(entities: Set<Entity>, delta: number): void {
        const mobsState = getMobsState(this.ecs);

        // Activate for both the initial wave start and subsequent advances.
        if (
            !mobsState ||
            (mobsState.state !== LevelState.WAVE_STARTING &&
                mobsState.state !== LevelState.ADVANCE_WAVE)
        ) {
            return;
        }

        if (entities.size === 0) {
            CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {
                newState: LevelState.WAVE_ACTIVE,
            } as TransitionToStatePayload);
            return;
        }

        // Move all mobs down by the displacement for this frame.
        const frameMovement = this.quickMarchSpeed * (delta / 1000);
        for (const entity of entities) {
            this.ecs.getComponent(entity, Transform).pos.y += frameMovement;
        }

        // Find the bottom edge of the formation after moving.
        let newBottomEdgeY = -Infinity;
        for (const entity of entities) {
            const transform = this.ecs.getComponent(entity, Transform);
            if (transform.pos.y > newBottomEdgeY) {
                newBottomEdgeY = transform.pos.y;
            }
        }

        // If the bottom edge has passed the target, the march is over.
        if (newBottomEdgeY >= this.targetY) {
            // Correct the formation's position by the overshoot amount.
            const overshoot = newBottomEdgeY - this.targetY;
            for (const entity of entities) {
                this.ecs.getComponent(entity, Transform).pos.y -= overshoot;
            }

            // Command the state transition to end the march.
            CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {
                newState: LevelState.WAVE_ACTIVE,
            } as TransitionToStatePayload);
        }
    }

    public destroy(): void {}
}
