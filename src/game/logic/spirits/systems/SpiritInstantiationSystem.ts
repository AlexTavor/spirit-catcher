import { MathUtils } from "../../../../utils/Math";
import { ConfigManager } from "../../../consts/ConfigManager";
import { Transform } from "../../core/components/Transform";
import { Velocity } from "../../core/components/Velocity";
import { Entity, System } from "../../core/ECS";
import { Spirit } from "../components/Spirit";
import { SpiritSpawnState } from "../components/SpiritSpawnState";
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

            const config = ConfigManager.get();
            const size = config.MobHeight / 2;
            const data = spawnState.data;

            // Get a noise value between -1 and 1.
            const noiseValue = spawnState.getNoiseValue();

            // Remap it to a 0-1 range.
            const t = MathUtils.remapNoiseToUnit(noiseValue);

            // Lerp between the min and max spawn positions.
            const spawnX =
                size +
                t * (config.GameWidth - size * 2) +
                MathUtils.random(-data.spawnXVariance, data.spawnXVariance);

            const spawn = new SpiritSpawnDefinition(
                {
                    x: spawnX,
                    y: config.GameHeight - this.SPAWN_Y_OFFSET,
                },
                { x: 0, y: data.initialYVelocity },
            );

            spawnState.resetTimer();

            const spiritEntity = this.ecs.addEntity();
            this.ecs.addComponent(spiritEntity, new Spirit());
            this.ecs.addComponent(spiritEntity, new Transform(spawn.position));
            this.ecs.addComponent(spiritEntity, new Velocity(spawn.velocity));
        }
    }

    public destroy(): void {}
}
