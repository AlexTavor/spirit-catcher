import { Scene } from "phaser";
import { SimplexNoise } from "../../utils/SimplexNoise";
import { MathUtils } from "../../utils/Math";
import { lerpColor } from "../../utils/Color";

export class NoiseData {
    constructor(
        public readonly width: number,
        public readonly height: number,
        public readonly tileSize: number,
        public readonly noiseScale: number,
        public readonly color1: number,
        public readonly color2: number,
        public readonly textureKey = "backgroundNoise",
    ) {}
}

export function createNoiseTexture(
    data: NoiseData,
    scene: Scene,
): Phaser.Textures.CanvasTexture {
    const noise = new SimplexNoise(Date.now());

    const { width, height, tileSize, noiseScale, color1, color2, textureKey } =
        data;

    const texture = scene.textures.createCanvas(
        textureKey,
        width,
        height,
    ) as Phaser.Textures.CanvasTexture;

    const context = texture.getContext();

    for (let y = 0; y < height; y += tileSize) {
        for (let x = 0; x < width; x += tileSize) {
            // Get noise value for this position
            const noiseValue = noise.noise(x * noiseScale, y * noiseScale);

            // Remap noise from [-1, 1] to [0, 1] for the lerp
            const t = MathUtils.remapNoiseToUnit(noiseValue);

            // Interpolate between our two pastel colors
            const color = lerpColor(color1, color2, t);

            context.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
            context.fillRect(x, y, tileSize, tileSize);
        }
    }

    // Refresh the texture to apply the changes
    texture.refresh();
    return texture;
}
