import { Component } from "../../core/ECS";

export interface SpawnerData {
    yVelocity: number;
    spawnXVariance: number;
    spawnYVariance: number;
    spawnInterval: number;
    spawnX: number;
}

/**
 * The SpiritSpawnState holds the state for spawning spirits.
 */
export class SpiritSpawnState extends Component {
    private spawnTimer: number = 0;
    public data: SpawnerData;

    constructor(data: SpawnerData) {
        super();
        this.data = { ...data };
    }

    public canSpawn(): boolean {
        return this.spawnTimer >= this.data.spawnInterval;
    }

    public updateTimer(delta: number) {
        this.spawnTimer += delta;
    }

    resetTimer() {
        this.spawnTimer -= this.data.spawnInterval; // Reset the timer after spawning
    }
}
