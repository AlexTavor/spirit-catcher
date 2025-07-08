import { System } from "../core/ECS";
import { Player } from "../player/components/Player";
import { IsWalking } from "../player/components/IsWalking";
import { WalkTarget } from "../player/components/WalkTarget";
import { MoveIntention } from "./MoveIntention";

export class MoveIntentionSystem extends System {
    public componentsRequired = new Set<Function>([Player, MoveIntention]);

    public update(entities: Set<number>): void {
        for (const entity of entities) {
            const moveIntention = this.ecs.getComponent(entity, MoveIntention);

            if (moveIntention.active) {
                // Intention is active, so the player should be moving.
                if (!this.ecs.hasComponent(entity, IsWalking)) {
                    this.ecs.addComponent(entity, new IsWalking());
                }

                // Ensure the WalkTarget exists and its position is updated.
                if (this.ecs.hasComponent(entity, WalkTarget)) {
                    this.ecs.getComponent(entity, WalkTarget).pos =
                        moveIntention.targetPos;
                } else {
                    // If WalkTarget is missing for any reason, create it.
                    const walkTarget = new WalkTarget();
                    walkTarget.pos = moveIntention.targetPos;
                    this.ecs.addComponent(entity, walkTarget);
                }
            } else {
                // Intention is not active, so the player should not be moving.
                if (this.ecs.hasComponent(entity, IsWalking)) {
                    this.ecs.removeComponent(entity, IsWalking);
                }
                if (this.ecs.hasComponent(entity, WalkTarget)) {
                    this.ecs.removeComponent(entity, WalkTarget);
                }
            }
        }
    }

    public destroy(): void {}
}
