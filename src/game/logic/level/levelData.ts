import { ConfigManager } from "../../consts/ConfigManager";

const FatSnake = {
    spawnInterval: 100, // ms
    spawnPosXVariance: 40, // pixels
    spawnPosYVariance: 20, // pixels
    duration: 50000, // ms
    startDelay: 0, // ms
    initialYVelocity: 80, // pixels/ms
    noiseTimeIncrement: 0.03, // step size for noise function
};

const WideWall = {
    spawnInterval: 30, // ms
    spawnPosXVariance: ConfigManager.get().GameWidth / 2, // pixels
    spawnPosYVariance: 80, // pixels
    duration: 5000, // ms
    startDelay: 0, // ms
    initialYVelocity: 50, // pixels/ms
    noiseTimeIncrement: 0, // step size for noise function
};

const Stream = {
    spawnInterval: 100, // ms
    spawnPosXVariance: 40, // pixels
    spawnPosYVariance: 0, // pixels
    duration: 50000, // ms
    startDelay: 0, // ms
    initialYVelocity: 200, // pixels/ms
    noiseTimeIncrement: 0.005, // step size for noise function
};

const Puff = {
    spawnInterval: 1, // ms
    spawnPosXVariance: 100, // pixels
    spawnPosYVariance: 100, // pixels
    duration: 1000, // ms
    startDelay: 1000, // ms
    initialYVelocity: 60, // pixels/ms
    noiseTimeIncrement: 0.001, // step size for noise function
};

const spawnerConfig0 = {
    spawnInterval: 100, // ms
    spawnPosXVariance: 60, // pixels
    spawnPosYVariance: 0, // pixels
    duration: 15000, // ms
    startDelay: 0, // ms
    initialYVelocity: 75, // pixels/ms
    noiseTimeIncrement: 0.01, // step size for noise function
};
const spawnerConfig1 = {
    spawnInterval: 100, // ms
    spawnPosXVariance: 80, // pixels
    spawnPosYVariance: 0, // pixels
    duration: 10000, // ms
    startDelay: 5000, // ms
    initialYVelocity: 100, // pixels/ms
    noiseTimeIncrement: 0.03, // step size for noise function
};
const spawnerConfig2 = {
    ...spawnerConfig0,
    spawnPosXVariance: 400, // pixels
    duration: 10000,
    initialYVelocity: 275,
    noiseTimeIncrement: 0.005,
};
const waveData0 = {
    spawners: [FatSnake],
};
const waveData1 = {
    spawners: [spawnerConfig0, spawnerConfig1, spawnerConfig2],
};
export const levelData = {
    waves: [waveData0, waveData1],
};

export type LevelData = typeof levelData;
export type WaveData = typeof waveData0;
export type SpawnerData = typeof spawnerConfig0;
