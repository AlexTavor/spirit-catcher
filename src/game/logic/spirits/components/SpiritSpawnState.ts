import { MathUtils } from "../../../../utils/Math";
import { SimplexNoise } from "../../../../utils/SimplexNoise";
import { ConfigManager } from "../../../api/ConfigManager";
import { Component, ECS } from "../../core/ECS";
import { SpiritSpawnDefinition } from "../systems/SpiritSpawnDefinition";

/**
 * The SpiritSpawnState holds the state for spawning spirits.
 */
export class SpiritSpawnState extends Component {
    // --- Constants ---
    private readonly SPAWN_INTERVAL_MS = 50;
    private readonly SPAWN_X_VARIATION = 50; // Horizontal variation for spawn position.
    private readonly SPAWN_Y_OFFSET = 50; // Distance from the bottom of the screen.
    private readonly INITIAL_VELOCITY_Y = 100; // Upward speed of the spirit.
    private readonly NOISE_TIME_INCREMENT = 0.01; // How fast to move through the noise space.

    // --- State ---
    private spawnTimer: number = 0;
    private nextSpawn: SpiritSpawnDefinition | null = null;
    private noise: SimplexNoise = new SimplexNoise(Date.now());
    private noiseTime: number = 0;

    constructor() {
        super();
    }

    public canSpawn(): boolean {
        return this.spawnTimer >= this.SPAWN_INTERVAL_MS;
    }

    public updateTimer(delta: number) {
        this.spawnTimer += delta;
    }

    public flagSpawnIfReady(ecs: ECS): void {
        if (this.canSpawn()) {
            this.flagSpawnReady(ecs);
        }
    }

    public flagSpawnReady(_ecs: ECS): void {
        if (this.nextSpawn) return; // Already has a spawn ready
        const config = ConfigManager.get();
        const size = config.MobHeight / 2;

        // Get a noise value between -1 and 1.
        const noiseValue = this.noise.noise(this.noiseTime, 0);
        // Remap it to a 0-1 range.
        const t = MathUtils.remapNoiseToUnit(noiseValue);
        // Lerp between the min and max spawn positions.
        const spawnX =
            size +
            t * (config.GameWidth - size * 2) +
            MathUtils.random(-this.SPAWN_X_VARIATION, this.SPAWN_X_VARIATION);

        this.nextSpawn = new SpiritSpawnDefinition(
            {
                x: spawnX,
                y: config.GameHeight - this.SPAWN_Y_OFFSET,
            },
            { x: 0, y: this.INITIAL_VELOCITY_Y },
        );

        // Increment noise time to get a different value for the next spawn.
        this.noiseTime += this.NOISE_TIME_INCREMENT;
        this.spawnTimer -= this.SPAWN_INTERVAL_MS; // Reset the timer after spawning
    }

    /**
     * Attempts to consume the next spawn and return its definition.
     * @param ecs The ECS instance to use for consuming the spawn.
     * @returns The next spawn definition or null if no spawn is available.
     */
    public tryConsumeSpawn(_ecs: ECS): SpiritSpawnDefinition | null {
        if (this.nextSpawn) {
            const spawn = this.nextSpawn;
            this.nextSpawn = null; // Clear the next spawn after consuming it
            return spawn;
        }
        return null; // No spawn available
    }
}
