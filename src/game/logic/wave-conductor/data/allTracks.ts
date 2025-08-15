import { ConfigManager } from "../../../consts/ConfigManager";
import { TrackDefinition } from "../types";
import { buildTrack } from "./buildTrack";

export const fatSnakeXStep = ConfigManager.get().GameWidth / 4;
export const thinSnakeStartX = 80; // Starting X position for thin snake
export const thinSnakeMaxWidth =
    ConfigManager.get().GameWidth / 2 - thinSnakeStartX;
export const wallBounceXStep = 30;
export const hWidth = ConfigManager.get().GameWidth / 2;

export const allTracks: TrackDefinition[] = [
    buildTrack("steadyStream", "stream", {}),
    buildTrack("fastStream", "stream", {
        yVelocity: [{ time: 0, value: 250 }],
    }),
    buildTrack("wideWall", "wall", {}),
    buildTrack("pincerLeft", "pincer", {}),
    buildTrack("pincerRight", "pincer", {
        spawnX: [{ time: 0, value: ConfigManager.get().GameWidth - 50 }],
    }),
    buildTrack("weavingStream", "stream", {
        spawnX: [
            { time: 0, value: 50 },
            {
                time: 2,
                value: ConfigManager.get().GameWidth - 50,
                ease: "linear",
            },
            { time: 4, value: 50, ease: "linear" },
            {
                time: 6,
                value: ConfigManager.get().GameWidth - 50,
                ease: "linear",
            },
            { time: 8, value: 50, ease: "linear" },
        ],
        trackVolume: [
            { time: 0, value: 1.0 },
            { time: 8, value: 0, ease: "step" },
        ],
    }),
    buildTrack("fatSnake", "stream", {
        yVelocity: [{ time: 0, value: 80 }],
        spawnInterval: [{ time: 0, value: 75 }],
        spawnXVariance: [{ time: 0, value: 30 }],
        spawnYVariance: [{ time: 0, value: 30 }],
        spawnX: [
            { time: 0, value: fatSnakeXStep },
            {
                time: 3,
                value: ConfigManager.get().GameWidth - fatSnakeXStep,
                ease: "expo",
            },
            { time: 6, value: fatSnakeXStep, ease: "expo" },
            {
                time: 9,
                value: ConfigManager.get().GameWidth - fatSnakeXStep,
                ease: "expo",
            },
            { time: 12, value: fatSnakeXStep, ease: "expo" },
        ],
        trackVolume: [
            { time: 0, value: 1.0 },
            { time: 12, value: 0, ease: "step" },
        ],
    }),
    buildTrack("wallBounce", "stream", {
        yVelocity: [{ time: 0, value: 100 }],
        spawnInterval: [{ time: 0, value: 75 }],
        spawnXVariance: [{ time: 0, value: wallBounceXStep }],
        spawnYVariance: [{ time: 0, value: wallBounceXStep }],
        spawnX: [
            { time: 0, value: wallBounceXStep },
            {
                time: 3,
                value: hWidth,
                ease: "quint",
            },
            { time: 6, value: wallBounceXStep },
            {
                time: 9,
                value: hWidth,
                ease: "quint",
            },
            { time: 12, value: wallBounceXStep },
        ],
        trackVolume: [
            { time: 0, value: 0.0 },
            { time: 0.01, value: 1.0, ease: "step" },
            { time: 12, value: 0, ease: "step" },
        ],
    }),
    buildTrack("thinSnake", "stream", {
        yVelocity: [{ time: 0, value: 80 }],
        spawnInterval: [{ time: 0, value: 75 }],
        spawnXVariance: [{ time: 0, value: 30 }],
        spawnYVariance: [{ time: 0, value: 30 }],
        spawnX: [
            { time: 0, value: thinSnakeStartX },
            {
                time: 3,
                value: thinSnakeMaxWidth,
                ease: "quad",
            },
            { time: 6, value: thinSnakeStartX, ease: "quad" },
            {
                time: 9,
                value: thinSnakeMaxWidth,
                ease: "quad",
            },
            { time: 12, value: thinSnakeStartX, ease: "quad" },
        ],
        trackVolume: [
            { time: 0, value: 1.0 },
            { time: 12, value: 0, ease: "step" },
        ],
    }),
];
