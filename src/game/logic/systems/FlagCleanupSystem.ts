import { System } from "../core/ECS";
import { HitWallFlag } from "../boomerang/components/HitWallFlag";
import { HitCeilingFlag } from "../boomerang/components/HitCeilingFlag";

export class FlagCleanupSystem extends System {
    // This system doesn't operate on a specific component set.
    // Instead, it manually queries for entities with flags.
    public componentsRequired = new Set<Function>();

    public update(): void {
        const wallHitters = this.ecs.getEntitiesWithComponent(HitWallFlag);
        for (const entity of wallHitters) {
            this.ecs.removeComponent(entity, HitWallFlag);
        }

        const ceilingHitters =
            this.ecs.getEntitiesWithComponent(HitCeilingFlag);
        for (const entity of ceilingHitters) {
            this.ecs.removeComponent(entity, HitCeilingFlag);
        }
    }

    destroy() {}
}
