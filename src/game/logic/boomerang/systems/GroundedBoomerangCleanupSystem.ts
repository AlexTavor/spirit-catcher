import { System } from "../../core/ECS";
import { getPlayerEntity } from "../../../utils/getPlayerEntity";
import { HasBoomerang } from "../../player/components/HasBoomerang";
import { Boomerang } from "../components/Boomerang";
import { Grounded } from "../components/Grounded";

export class GroundedBoomerangCleanupSystem extends System {
    public componentsRequired = new Set<Function>([Grounded, Boomerang]);

    public update(): void {
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        const playerHasBoomerang = this.ecs.hasComponent(player, HasBoomerang);
        if (!playerHasBoomerang) {
            return;
        }

        const groundedBoomerangs = this.ecs.getEntitiesWithComponents([
            Grounded,
            Boomerang,
        ]);

        for (const boomerang of groundedBoomerangs) {
            this.ecs.removeEntity(boomerang);
        }
    }

    public destroy(): void {}
}
