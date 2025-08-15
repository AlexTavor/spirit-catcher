import { TrackProperties, TrackDefinition, Keyframe } from "../types";
import { prefabs } from "./prefabs";

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
