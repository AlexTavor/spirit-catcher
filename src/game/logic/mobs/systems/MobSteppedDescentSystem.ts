import { ConfigManager } from "../../../api/ConfigManager";
import { getMobsState } from "../../../utils/getMobsState";
import { Transform } from "../../core/components/Transform";
import { Entity, System } from "../../core/ECS";
import { LevelState } from "../../level/LevelState";
import { Mob } from "../components/Mob";
import { StepMovement } from "../components/StepMovement";

/**
 * Manages the rhythmic, stepped descent of all mobs, but only
 * when the wave is in its active phase.
 */
export class MobSteppedDescentSystem extends System {
    public componentsRequired = new Set<Function>([Mob, Transform]);

    // --- System State ---
    private isStepping = false; // Is the step animation currently active?
    private stepProgress = 0; // Animation progress from 0 to 1.
    private stepTimer: number; // Time until the next step is triggered.

    // --- Configuration ---
    private readonly stepInterval: number;
    private readonly stepDuration: number;
    private readonly stepHeight: number;

    constructor() {
        super();
        const config = ConfigManager.get();
        this.stepInterval = config.MobStepInterval;
        this.stepDuration = config.MobStepDuration;
        this.stepHeight = config.MobStepHeight;

        this.stepTimer = this.stepInterval;
    }

    public override update(entities: Set<Entity>, delta: number): void {
        // Lazily get the MobsState component
        const mobsState = getMobsState(this.ecs);
        if (!mobsState) return;

        // --- STATE CHECK ---
        // Only run the descent logic if the wave is active.
        if (!mobsState || mobsState.state !== LevelState.WAVE_ACTIVE) {
            // Reset the step timer so a step doesn't happen immediately
            // upon entering the WAVE_ACTIVE state.
            this.stepTimer = this.stepInterval;
            return;
        }

        if (this.isStepping) {
            this.updateStepAnimation(delta);
        } else {
            this.updateStepTrigger(delta, entities);
        }
    }

    /**
     * Handles the countdown timer that triggers a new step.
     */
    private updateStepTrigger(delta: number, entities: Set<Entity>) {
        this.stepTimer -= delta;
        if (this.stepTimer <= 0) {
            this.startStep(entities);
        }
    }

    /**
     * Initiates a new step for all active mobs.
     */
    private startStep(entities: Set<Entity>) {
        this.isStepping = true;
        this.stepProgress = 0;
        this.stepTimer = this.stepInterval; // Reset the timer for the next interval.

        for (const entity of entities) {
            const transform = this.ecs.getComponent(entity, Transform);
            this.ecs.addComponent(
                entity,
                new StepMovement(
                    transform.pos.y,
                    transform.pos.y + this.stepHeight,
                ),
            );
        }
    }

    /**
     * Updates the smooth animation of all stepping mobs.
     * This now acts as a dispatcher.
     */
    private updateStepAnimation(delta: number) {
        this.stepProgress += delta / this.stepDuration;
        const steppingEntities = this.ecs.getEntitiesWithComponents([
            Mob,
            Transform,
            StepMovement,
        ]);

        if (this.stepProgress >= 1) {
            this.finalizeStep(steppingEntities);
        } else {
            this.progressStepAnimation(steppingEntities);
        }
    }

    /**
     * Moves mobs that are in the middle of a step animation.
     * @param steppingEntities The set of entities currently animating.
     */
    private progressStepAnimation(steppingEntities: Entity[]): void {
        for (const entity of steppingEntities) {
            const movement = this.ecs.getComponent(entity, StepMovement);
            const transform = this.ecs.getComponent(entity, Transform);
            // Linear interpolation for smooth movement
            transform.pos.y =
                movement.startY +
                (movement.targetY - movement.startY) * this.stepProgress;
        }
    }

    /**
     * Snaps mobs to their final position at the end of a step
     * and cleans up their StepMovement components.
     * @param steppingEntities The set of entities that have finished animating.
     */
    private finalizeStep(steppingEntities: Entity[]): void {
        this.isStepping = false;
        for (const entity of steppingEntities) {
            const movement = this.ecs.getComponent(entity, StepMovement);
            const transform = this.ecs.getComponent(entity, Transform);
            transform.pos.y = movement.targetY;
            this.ecs.removeComponent(entity, StepMovement);
        }
    }

    public destroy(): void {}
}
