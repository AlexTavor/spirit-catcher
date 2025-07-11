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
 * positions. The entire formation moves as one rigid unit.
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

        if (!mobsState || mobsState.state !== LevelState.WAVE_STARTING) {
            return;
        }

        if (entities.size === 0) {
            CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {
                newState: LevelState.WAVE_ACTIVE,
            } as TransitionToStatePayload);
            return;
        }

        // Move all mobs down by the potential displacement for this frame.
        const frameMovement = this.quickMarchSpeed * (delta / 1000);
        for (const entity of entities) {
            this.ecs.getComponent(entity, Transform).pos.y += frameMovement;
        }

        // After moving, find the new bottom edge of the formation.
        let newBottomEdgeY = -Infinity;
        for (const entity of entities) {
            const transform = this.ecs.getComponent(entity, Transform);
            if (transform.pos.y > newBottomEdgeY) {
                newBottomEdgeY = transform.pos.y;
            }
        }

        // If the bottom edge has passed the target, the march is over.
        if (newBottomEdgeY >= this.targetY) {
            // Calculate how far the formation overshot the target line.
            const overshoot = newBottomEdgeY - this.targetY;

            // Apply a correction to every mob, pulling the entire formation
            // back up by the overshoot amount. This snaps the bottom edge
            // perfectly to the target line while preserving the formation's shape.
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
