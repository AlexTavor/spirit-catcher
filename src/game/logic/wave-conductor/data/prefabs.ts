import { ConfigManager } from "../../../consts/ConfigManager";
import { TrackPrefab } from "../types";

// --- PREFABS ---
// Reusable templates for spawner behaviors.

export const prefabs: { [key: string]: TrackPrefab } = {
    stream: {
        prefabId: "stream",
        yVelocity: 150,
        spawnXVariance: 20,
        spawnYVariance: 0,
        spawnInterval: 150,
        spawnX: ConfigManager.get().GameWidth / 2,
        trackVolume: 1.0,
    },
    wall: {
        prefabId: "wall",
        yVelocity: 40,
        spawnXVariance: ConfigManager.get().GameWidth,
        spawnYVariance: 40,
        spawnInterval: 20,
        spawnX: ConfigManager.get().GameWidth / 2,
        trackVolume: 1.0,
    },
    pincer: {
        prefabId: "pincer",
        yVelocity: 100,
        spawnXVariance: 10,
        spawnYVariance: 10,
        spawnInterval: 200,
        spawnX: 50, // Starts on the left
        trackVolume: 1.0,
    },
    puff: {
        prefabId: "puff",
        yVelocity: 80,
        spawnXVariance: 60,
        spawnYVariance: 60,
        spawnInterval: 20,
        spawnX: ConfigManager.get().GameWidth / 2,
        trackVolume: 1.0,
    },
};
