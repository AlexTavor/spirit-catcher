const spawnerConfig0 = {
    spawnInterval: 100, // ms
    spawnXVariance: 60, // pixels
    duration: 15000, // ms
    startDelay: 0, // ms
    initialYVelocity: 75, // pixels/ms
    noiseTimeIncrement: 0.01, // step size for noise function
};
const spawnerConfig1 = {
    spawnInterval: 500, // ms
    spawnXVariance: 80, // pixels
    duration: 10000, // ms
    startDelay: 5000, // ms
    initialYVelocity: 100, // pixels/ms
    noiseTimeIncrement: 0.03, // step size for noise function
};
export const spawnerConfig2 = {
    ...spawnerConfig0,
    spawnXVariance: 40, // pixels
    duration: 10000,
    initialYVelocity: 75,
    noiseTimeIncrement: 0.005,
};
const waveData0 = {
    spawners: [spawnerConfig2],
};
const waveData1 = {
    spawners: [spawnerConfig0, spawnerConfig1],
};
export const levelData = {
    waves: [waveData0, waveData1],
};

export type LevelData = typeof levelData;
export type WaveData = typeof waveData0;
export type SpawnerData = typeof spawnerConfig0;
