import {
    Keyframe,
    TrackPrefab,
    TrackProperties,
    TrackDefinition,
    SegDefinition,
    DifficultyCurveDefinition,
} from "./types";
import { ConfigManager } from "../../consts/ConfigManager";

// --- PREFABS ---
// Reusable templates for spawner behaviors.

const prefabs: { [key: string]: TrackPrefab } = {
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
        yVelocity: 60,
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
};

// --- TRACKS ---
// Specific instances of prefabs with keyframed property timelines.

const buildTrack = (
    trackId: string,
    prefabId: string,
    overrides: Partial<TrackProperties>,
): TrackDefinition => {
    const prefab = prefabs[prefabId];
    // Helper to create a default keyframe array if not provided
    const kf = <T>(value: T): Keyframe<T>[] => [
        { time: 0, value: value, ease: "step" },
    ];

    return {
        trackId,
        prefabId,
        properties: {
            yVelocity: overrides.yVelocity ?? kf(prefab.yVelocity),
            spawnXVariance:
                overrides.spawnXVariance ?? kf(prefab.spawnXVariance),
            spawnYVariance:
                overrides.spawnYVariance ?? kf(prefab.spawnYVariance),
            spawnInterval: overrides.spawnInterval ?? kf(prefab.spawnInterval),
            spawnX: overrides.spawnX ?? kf(prefab.spawnX),
            trackVolume: overrides.trackVolume ?? kf(prefab.trackVolume),
        },
    };
};

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
];

// --- SEGMENTS ---
// Compositions of tracks that represent a gameplay "moment".

export const allSegs: SegDefinition[] = [
    {
        segId: "warmup",
        duration: 5, // seconds
        rarity: 1,
        trackIds: ["steadyStream"],
    },
    {
        segId: "wallAttack",
        duration: 4,
        rarity: 2,
        trackIds: ["wideWall"],
    },
    {
        segId: "pincerAttack",
        duration: 6,
        rarity: 3,
        trackIds: ["pincerLeft", "pincerRight"],
    },
    {
        segId: "weaving",
        duration: 8,
        rarity: 2,
        trackIds: ["weavingStream"],
    },
];

// --- DIFFICULTY CURVES ---
// Defines the overall pacing and intensity of a full wave.

export const allCurves: DifficultyCurveDefinition[] = [
    {
        curveId: "standardRamp",
        waveDuration: 30, // seconds
        masterVolume: [
            { time: 0, value: 0.5, ease: "linear" },
            { time: 15, value: 1.0, ease: "linear" },
            { time: 30, value: 1.5 },
        ],
    },
];
