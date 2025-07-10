import { ConfigManager } from "../../../api/ConfigManager";
import { Transform } from "../../core/components/Transform";
import { Entity, System } from "../../core/ECS";
import { Mob } from "../components/Mob";
import { StepMovement } from "../components/StepMovement";

/**
 * Manages the rhythmic, stepped descent of all mobs.
 * Replaces a constant velocity descent with discrete steps.
 */
export class MobSteppedDescentSystem extends System {
    public componentsRequired = new Set<Function>([Mob, Transform]);

    // --- Configuration ---
    private readonly stepInterval: number;
    private readonly stepDuration: number;
    private readonly stepHeight: number;

    // --- System State ---
    private stepTimer: number; // Time until the next step is triggered.
    private isStepping = false; // Is the step animation currently active?
    private stepProgress = 0; // Animation progress from 0 to 1.

    constructor() {
        super();
        const config = ConfigManager.get();
        this.stepInterval = config.MobStepInterval;
        this.stepDuration = config.MobStepDuration;
        this.stepHeight = config.MobStepHeight;

        this.stepTimer = this.stepInterval;
    }

    public update(entities: Set<Entity>, delta: number): void {
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
     */
    private updateStepAnimation(delta: number) {
        this.stepProgress += delta / this.stepDuration;

        const steppingEntities = this.ecs.getEntitiesWithComponents([
            Mob,
            Transform,
            StepMovement,
        ]);

        if (this.stepProgress >= 1) {
            // --- End of Step ---
            this.isStepping = false;
            for (const entity of steppingEntities) {
                // Snap to final position and clean up
                const movement = this.ecs.getComponent(entity, StepMovement);
                const transform = this.ecs.getComponent(entity, Transform);
                transform.pos.y = movement.targetY;
                this.ecs.removeComponent(entity, StepMovement);
            }
        } else {
            // --- In-Progress Step ---
            for (const entity of steppingEntities) {
                const movement = this.ecs.getComponent(entity, StepMovement);
                const transform = this.ecs.getComponent(entity, Transform);
                // Linear interpolation for smooth movement
                transform.pos.y =
                    movement.startY +
                    (movement.targetY - movement.startY) * this.stepProgress;
            }
        }
    }

    public destroy(): void {}
}
