import { SimplexNoise } from "../../../../utils/SimplexNoise";
import { Component } from "../../core/ECS";
import { SpawnerData } from "../../level/levelData";

/**
 * The SpiritSpawnState holds the state for spawning spirits.
 */
export class SpiritSpawnState extends Component {
    private spawnTimer: number = 0;
    private noiseTime: number = 0;

    public data: SpawnerData;
    public noise: SimplexNoise = new SimplexNoise(Date.now());
    public duration: number = 0;
    public startDelay: number = 0;

    constructor(data: SpawnerData) {
        super();
        this.data = { ...data };
        this.duration = this.data.duration;
        this.startDelay = this.data.startDelay;
    }

    public canSpawn(): boolean {
        return this.spawnTimer >= this.data.spawnInterval;
    }

    public updateTimer(delta: number) {
        this.startDelay -= delta;

        if (this.startDelay > 0) {
            return; // Still in the start delay phase
        }

        this.spawnTimer += delta;
        this.duration -= delta;
    }

    public getNoiseValue() {
        return this.noise.noise(this.noiseTime, 0);
    }

    resetTimer() {
        this.noiseTime += this.data.noiseTimeIncrement;
        this.spawnTimer -= this.data.spawnInterval; // Reset the timer after spawning
    }
}
