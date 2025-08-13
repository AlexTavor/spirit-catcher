import { MathUtils } from "../../../../utils/Math";
import { ConfigManager } from "../../../consts/ConfigManager";
import { Transform } from "../../core/components/Transform";
import { Velocity } from "../../core/components/Velocity";
import { Entity, System } from "../../core/ECS";
import { Spirit } from "../components/Spirit";
import { SpawnerData, SpiritSpawnState } from "../components/SpiritSpawnState";
import { SpiritSpawnDefinition } from "./SpiritSpawnDefinition";

export class SpiritInstantiationSystem extends System {
    private readonly SPAWN_Y_OFFSET = 50; // Distance from the bottom of the screen.

    public componentsRequired = new Set<Function>([SpiritSpawnState]);

    public update(entities: Set<Entity>, _delta: number): void {
        // Iterate over all entities with SpiritSpawnState
        // and check if they can spawn a spirit.
        // If they can, create a new spirit entity and add it to the ECS.

        for (const entity of entities) {
            const spawnState = this.ecs.getComponent(entity, SpiritSpawnState);
            if (!spawnState) continue;

            const canSpawn = spawnState.canSpawn();
            if (!canSpawn) {
                continue;
            }

            // Calculate the spawn position based on the spawn definition.
            const spawn = this.generateSpawn(spawnState.data);

            spawnState.resetTimer();

            const spiritEntity = this.ecs.addEntity();
            this.ecs.addComponent(spiritEntity, new Spirit());
            this.ecs.addComponent(spiritEntity, new Transform(spawn.position));
            this.ecs.addComponent(spiritEntity, new Velocity(spawn.velocity));
        }
    }

    private generateSpawn(data: SpawnerData): SpiritSpawnDefinition {
        const spawn = new SpiritSpawnDefinition();
        const xRand = MathUtils.random(
            -data.spawnXVariance,
            data.spawnXVariance,
        );

        const clampedX = MathUtils.clamp(
            data.spawnX + xRand,
            0,
            ConfigManager.get().GameWidth,
        );

        spawn.position.x = clampedX;

        const spawnY = ConfigManager.get().GameHeight + this.SPAWN_Y_OFFSET;
        const yRand = MathUtils.random(
            -data.spawnYVariance,
            data.spawnYVariance,
        );
        spawn.position.y = spawnY + yRand;
        spawn.velocity.y = data.yVelocity;

        return spawn;
    }

    public destroy(): void {}
}
