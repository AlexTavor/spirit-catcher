import {
    Keyframe,
    TrackPrefab,
    TrackProperties,
    TrackDefinition,
    SegDefinition,
    DifficultyCurveDefinition,
} from "./types";
import { ConfigManager } from "../../consts/ConfigManager";
import { TracksUtil } from "./TracksUtil";

const puffStep = ConfigManager.get().GameWidth / 6;
const fingersStep = ConfigManager.get().GameWidth / 8;
const fingerSpeeds = [80, 90, 120, 110, 100];

const fatSnakeXStep = ConfigManager.get().GameWidth / 4;
const wallBounceXStep = 30;
const hWidth = ConfigManager.get().GameWidth / 2;

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

// --- TRACKS ---
// Specific instances of prefabs with keyframed property timelines.

export const buildTrack = (
    trackId: string,
    prefabId: string,
    overrides: Partial<TrackProperties>,
): TrackDefinition => {
    const prefab = prefabs[prefabId];

    if (!prefab) {
        throw new Error(`Track prefab '${prefabId}' not found.`);
    }

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

const { tracks: puffSlowTracks, seg: puffSlowSeg } = TracksUtil.buildStaggered(
    "puffSlow",
    "puff",
    3,
    {
        delay: 3,
        duration: 1,
        segDurationPadding: 1,
        valueFunctions: {
            yVelocity: (step) => 60 + step * 15,
            spawnX: (step) => {
                let value = puffStep + puffStep * step * 2;
                value = reflectFromWall(value);
                return value;
            },
        },
    },
    10, // Rarity
);

const { tracks: puffQuickTracks, seg: puffQuickSeg } =
    TracksUtil.buildStaggered(
        "puffQuick",
        "puff",
        3,
        {
            delay: 3,
            duration: 1,
            segDurationPadding: 1,
            valueFunctions: {
                yVelocity: (step) => 80 + step * 30,
                spawnX: (step) => {
                    let value =
                        ConfigManager.get().GameWidth -
                        (puffStep + puffStep * step * 2);
                    value = reflectFromWall(value);
                    return value;
                },
            },
        },
        30, // Rarity
    );

const { tracks: fingersTracks, seg: fingersSeg } = TracksUtil.buildStaggered(
    "fingers",
    "stream",
    5,
    {
        delay: 1,
        duration: 5,
        segDurationPadding: 2,
        valueFunctions: {
            yVelocity: (step) => fingerSpeeds[step % fingerSpeeds.length],
            spawnX: (step) => {
                const value = fingersStep + fingersStep * (step * 1.4);
                return value;
            },
        },
    },
    60, // Rarity
);

const thinLine: SegDefinition = {
    segId: "warmup",
    duration: 5, // seconds
    rarity: 10,
    trackIds: ["steadyStream"],
};
const wallAttack: SegDefinition = {
    segId: "wallAttack",
    duration: 4,
    rarity: 20,
    trackIds: ["wideWall"],
};
const parallelLines: SegDefinition = {
    segId: "parallelLines",
    duration: 6,
    rarity: 30,
    trackIds: ["pincerLeft", "pincerRight"],
};
const zigZag: SegDefinition = {
    segId: "zigZag",
    duration: 8,
    rarity: 20,
    trackIds: ["weavingStream"],
};
const fatSnake: SegDefinition = {
    segId: "fatSnake",
    duration: 13,
    rarity: 10,
    trackIds: ["fatSnake"],
};
const wallBounce: SegDefinition = {
    segId: "wallBounce",
    duration: 13,
    rarity: 10,
    trackIds: ["wallBounce"],
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
    ...puffSlowTracks,
    ...puffQuickTracks,
    ...fingersTracks,
];

const { tracks: zigZagMirrorTracks, seg: zigZagMirrorSeg } =
    TracksUtil.mirror(zigZag);
const { tracks: puffSlowMirrorTracks, seg: puffSlowMirrorSeg } =
    TracksUtil.mirror(puffSlowSeg);
const { tracks: puffQuickMirrorTracks, seg: puffQuickMirrorSeg } =
    TracksUtil.mirror(puffQuickSeg);
const { tracks: fingersMirrorTracks, seg: fingersMirrorSeg } =
    TracksUtil.mirror(fingersSeg);
const { tracks: wallBounceMirrorTracks, seg: wallBounceMirrorSeg } =
    TracksUtil.mirror(wallBounce);
const { tracks: fatSnakeMirrorTracks, seg: fatSnakeMirrorSeg } =
    TracksUtil.mirror(fatSnake);

export const allTracksWithMirrors: TrackDefinition[] = [
    ...zigZagMirrorTracks,
    ...puffSlowMirrorTracks,
    ...puffQuickMirrorTracks,
    ...fingersMirrorTracks,
    ...wallBounceMirrorTracks,
    ...fatSnakeMirrorTracks,
];

allTracks.push(...allTracksWithMirrors);

// --- SEGMENTS ---
// Compositions of tracks that represent a gameplay "moment".

export const allSegs: SegDefinition[] = [
    thinLine,
    wallAttack,
    parallelLines,
    zigZag,
    fatSnake,
    wallBounce,
    puffSlowSeg,
    puffQuickSeg,
    fingersSeg,
    zigZagMirrorSeg,
    puffSlowMirrorSeg,
    puffQuickMirrorSeg,
    fingersMirrorSeg,
    wallBounceMirrorSeg,
    fatSnakeMirrorSeg,
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

function reflectFromWall(value: number) {
    if (value > ConfigManager.get().GameWidth - puffStep) {
        const overstep = value - (ConfigManager.get().GameWidth - puffStep);
        value = ConfigManager.get().GameWidth - puffStep - overstep;
    }
    return value;
}
