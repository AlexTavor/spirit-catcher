import { Transform } from "../../core/components/Transform";
import { Velocity } from "../../core/components/Velocity";
import { Entity, System } from "../../core/ECS";
import { Spirit } from "../components/Spirit";
import { SpiritSpawnState } from "../components/SpiritSpawnState";

export class SpiritInstantiationSystem extends System {
    public componentsRequired = new Set<Function>([SpiritSpawnState]);

    public update(entities: Set<Entity>, _: number): void {
        // Iterate over all entities with SpiritSpawnState, try consumeSpawn
        // and spawn a spirit if the conditions are met.
        for (const entity of entities) {
            const spawnState = this.ecs.getComponent(entity, SpiritSpawnState);
            if (!spawnState) continue;

            const spawn = spawnState.tryConsumeSpawn(this.ecs);
            if (spawn) {
                const spiritEntity = this.ecs.addEntity();
                this.ecs.addComponent(spiritEntity, new Spirit());
                this.ecs.addComponent(
                    spiritEntity,
                    new Transform(spawn.position),
                );
                this.ecs.addComponent(
                    spiritEntity,
                    new Velocity(spawn.velocity),
                );
            }
        }
    }

    public destroy(): void {}
}
