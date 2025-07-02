import { ConfigManager } from "../api/ConfigManager";
import { NoiseData } from "../utils/createNoiseTexture";

export function backgroundConfig(): NoiseData {
    return {
        width: ConfigManager.get().GameWidth,
        height: ConfigManager.get().GameHeight,
        tileSize: 1,
        noiseScale: 0.002,
        color1: 0xb58285,
        color2: 0x5a00ff,
        textureKey: "backgroundNoise",
    } as NoiseData;
}

export function groundConfig(): NoiseData {
    return {
        width: ConfigManager.get().GameWidth,
        height: 120,
        tileSize: 1,
        noiseScale: 0.02,
        color1: 0x49003b,
        color2: 0x00490f,
        textureKey: "groundNoise",
    } as NoiseData;
}
