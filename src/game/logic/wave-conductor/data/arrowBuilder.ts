import { ConfigManager } from "../../../consts/ConfigManager";
import { TrackDefinition, SegDefinition } from "../types";
import { buildTrack } from "./buildTrack";

/**
 * Builds the tracks and segment definition for an "arrow" pattern of spirits.
 * The arrowhead wings are always formed at a 45-degree angle.
 *
 * @param id - The base ID for the segment and its tracks.
 * @param duration - The duration of the arrow's STEM in seconds. The head's formation time is calculated automatically.
 * @param speed - The vertical speed of the spirits in pixels per second.
 * @param width - The final horizontal width of the arrowhead.
 * @param x - The central x-coordinate for the arrow's formation.
 * @returns An object containing the generated tracks and the segment definition.
 */
export const buildArrow = (
    id: string,
    duration: number,
    speed: number,
    width: number,
    x: number = ConfigManager.get().GameWidth / 2,
): { tracks: TrackDefinition[]; seg: SegDefinition } => {
    const tracks: TrackDefinition[] = [];
    const trackIds: string[] = [];
    const halfWidth = width / 2;

    // To achieve a 45-degree angle, the spawner's horizontal speed must equal the spirit's vertical speed.
    // spawner_speed_x = (width / 2) / formation_time
    // We set spawner_speed_x = speed (spirit's y-velocity)
    // Therefore, formation_time = (width / 2) / speed
    const arrowHeadFormationTime = halfWidth / speed;

    // The total duration is the time until the last pattern (stem or wing) finishes.
    const totalSegDuration = Math.max(duration, arrowHeadFormationTime);

    // Left Wing
    const leftTrackId = `${id}_left`;
    tracks.push(
        buildTrack(leftTrackId, "stream", {
            yVelocity: [{ time: 0, value: speed }],
            spawnX: [
                { time: 0, value: x }, // Start at the center
                {
                    time: arrowHeadFormationTime,
                    value: x - halfWidth, // Move to the side
                    ease: "linear",
                },
            ],
            // Activate only for the duration of the wing formation.
            trackVolume: [
                { time: 0, value: 1.0, ease: "step" },
                { time: arrowHeadFormationTime, value: 0, ease: "step" },
            ],
        }),
    );
    trackIds.push(leftTrackId);

    // Right Wing
    const rightTrackId = `${id}_right`;
    tracks.push(
        buildTrack(rightTrackId, "stream", {
            yVelocity: [{ time: 0, value: speed }],
            spawnX: [
                { time: 0, value: x }, // Start at the center
                {
                    time: arrowHeadFormationTime,
                    value: x + halfWidth, // Move to the side
                    ease: "linear",
                },
            ],
            // Activate only for the duration of the wing formation.
            trackVolume: [
                { time: 0, value: 1.0, ease: "step" },
                { time: arrowHeadFormationTime, value: 0, ease: "step" },
            ],
        }),
    );
    trackIds.push(rightTrackId);

    // Center Stem
    const stemTrackId = `${id}_stem`;
    tracks.push(
        buildTrack(stemTrackId, "stream", {
            yVelocity: [{ time: 0, value: speed }],
            spawnX: [{ time: 0, value: x }],
            // Activate at the start and run for the specified stem duration.
            trackVolume: [
                { time: 0, value: 1.0, ease: "step" },
                { time: duration, value: 0, ease: "step" },
            ],
        }),
    );
    trackIds.push(stemTrackId);

    // Segment Definition
    const seg: SegDefinition = {
        segId: id,
        duration: totalSegDuration + 1, // Add 1s padding
        rarity: 0, // Rarity is set when the segment is actually used
        trackIds: trackIds,
    };

    return {
        tracks,
        seg,
    };
};
