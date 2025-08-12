// src/game/logic/wave_conductor/types.ts

/**
 * Defines a single point in time for an animatable property.
 * @template T The type of the value being keyframed (e.g., number).
 */
export interface Keyframe<T> {
    /** The time in seconds from the start of the track. */
    time: number;
    /** The value of the property at this time. */
    value: T;
    /** * The easing function to use from the previous keyframe.
     * Can be a standard easing name like 'linear', 'easeInQuad', etc.
     * Use **'step'** for an immediate, non-animated change to the new value.
     */
    ease?: string;
}

/**
 * Represents the initial parameters for a spawner track.
 */
export interface TrackPrefab {
    prefabId: string;
    yVelocity: number;
    spawnXVariance: number;
    spawnYVariance: number;
    spawnInterval: number;
    spawnX: number;
    trackVolume: number;
}

/**
 * Contains the timelines for all animatable properties of a spawner track.
 */
export interface TrackProperties {
    /** The vertical speed of spawned spirits in pixels per second. */
    yVelocity: Keyframe<number>[];
    /** The maximum horizontal deviation from the spawnX position. */
    spawnXVariance: Keyframe<number>[];
    /** The maximum vertical deviation from the constant spawn Y position. */
    spawnYVariance: Keyframe<number>[];
    /** The base spawn interval in milliseconds. This is before intensity modifiers. */
    spawnInterval: Keyframe<number>[];
    /** The horizontal center position of the spawner. The Y position is constant. */
    spawnX: Keyframe<number>[];
    /** * The individual volume multiplier for this track (0.0 to 1.0).
     * This is multiplied by the global masterVolume to get the final intensity.
     */
    trackVolume: Keyframe<number>[];
}

/**
 * Defines a single spawner track, containing timelines for all its properties.
 */
export interface TrackDefinition {
    trackId: string;
    properties: TrackProperties;
    prefabId: string;
}

/**
 * Defines a reusable, authored composition of one or more tracks.
 * This is a core building block of a wave, representing a specific pattern
 * like a "Pincer Attack" or "Dense Wall".
 */
export interface SegDefinition {
    segId: string;
    /** The total duration of this segment in seconds. Should be dynamically calculated based on the track properties. */
    duration: number;
    /** * The rarity of this segment appearing. A lower number means more common.
     * Used for weighted random selection. e.g., rarity 1 is twice as common as rarity 2.
     */
    rarity: number;
    /** The array of tracks that will play in parallel during this segment, identified by their track IDs. */
    trackIds: string[];
}

/**
 * Defines the overall pacing, intensity, and length for an entire wave.
 */
export interface DifficultyCurveDefinition {
    curveId: string;
    /** The total duration of the wave in seconds. Should be dynamically calculated based on masterVolume properties. */
    waveDuration: number;
    /** * A keyframed multiplier for the intensity of all active spawners.
     * A value of 1.0 is normal intensity.
     */
    masterVolume: Keyframe<number>[];
}
