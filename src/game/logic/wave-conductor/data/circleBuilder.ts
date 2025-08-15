import { ConfigManager } from "../../../consts/ConfigManager";
import { TrackDefinition, SegDefinition } from "../types";
import { buildTrack } from "./buildTrack";

/**
 * Builds the tracks and segment definition for a circular pattern of spirits.
 * The circle is drawn by two spawners, each tracing a semi-circle path.
 *
 * @param id - The base ID for the segment and its tracks.
 * @param radius - The horizontal radius of the circle in pixels.
 * @param speed - The vertical speed of the spirits in pixels per second.
 * @param thickness - The thickness of the circle's line, created by spawn variance.
 * @param x - The central x-coordinate for the circle's formation.
 * @returns An object containing the generated tracks and the segment definition.
 */
export const buildCircle = (
    id: string,
    radius: number,
    speed: number,
    thickness: number,
    x: number = ConfigManager.get().GameWidth / 2,
): { tracks: TrackDefinition[]; seg: SegDefinition } => {
    // To make the pattern appear as a circle, its height should equal its width (2 * radius).
    // The time it takes to form this height is determined by the spirits' speed.
    // formationTime = height / speed
    const formationTime = (2 * radius) / speed;
    const trackIds: string[] = [];
    const tracks: TrackDefinition[] = [];

    // --- Left Semi-Circle Track ---
    const leftTrackId = `${id}_left`;
    trackIds.push(leftTrackId);
    tracks.push(
        buildTrack(leftTrackId, "stream", {
            yVelocity: [{ time: 0, value: speed }],
            spawnXVariance: [{ time: 0, value: thickness }],
            spawnYVariance: [{ time: 0, value: thickness }],
            // This path traces an arc from the center, to the left, and back to the center.
            spawnX: [
                { time: 0, value: x, ease: "sine" },
                { time: formationTime / 2, value: x - radius, ease: "sine" },
                { time: formationTime, value: x, ease: "sine" },
            ],
            // The track is active for the full duration of the circle formation.
            trackVolume: [
                { time: 0, value: 1.0, ease: "step" },
                { time: formationTime, value: 0, ease: "step" },
            ],
        }),
    );

    // --- Right Semi-Circle Track ---
    const rightTrackId = `${id}_right`;
    trackIds.push(rightTrackId);
    tracks.push(
        buildTrack(rightTrackId, "stream", {
            yVelocity: [{ time: 0, value: speed }],
            spawnXVariance: [{ time: 0, value: thickness }],
            spawnYVariance: [{ time: 0, value: thickness }],
            // This path mirrors the left track, tracing the right-side arc.
            spawnX: [
                { time: 0, value: x, ease: "sine" },
                { time: formationTime / 2, value: x + radius, ease: "sine" },
                { time: formationTime, value: x, ease: "sine" },
            ],
            trackVolume: [
                { time: 0, value: 1.0, ease: "step" },
                { time: formationTime, value: 0, ease: "step" },
            ],
        }),
    );

    // --- Segment Definition ---
    const seg: SegDefinition = {
        segId: id,
        duration: formationTime + 1, // Add 1s padding
        rarity: 0, // Rarity is set when the segment is actually used
        trackIds: trackIds,
    };

    return {
        tracks,
        seg,
    };
};
