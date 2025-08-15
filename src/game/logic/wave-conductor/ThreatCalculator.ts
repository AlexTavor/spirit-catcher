import { allTracks } from "./data/allTracks";
import { KeyframeUtil } from "./KeyframeUtil";
import { SegDefinition, TrackDefinition } from "./types";

// --- --- TUNING CONSTANTS --- --- //

/**
 * Weights determine the contribution of each threat component to the final score.
 */
const WEIGHTS = {
    SPEED: 1.1,
    DENSITY: 1,
    VARIANCE_PRESSURE: 0.8,
    POSITION_PRESSURE: 1.0,
};

/**
 * Base values for normalization.
 */
const BASELINE = {
    Y_VELOCITY: 100, // px/s
    SPAWN_INTERVAL: 20, // ms
    X_VARIANCE: 50, // px
    X_SPEED: 100, // px/s of spawner movement
};

/**
 * The number of times per second to sample a track's properties to calculate its
 * average threat.
 */
const SAMPLES_PER_SECOND = 4;
/**
 * A multiplier applied to a segment's threat for each additional track beyond the first.
 */
const SIMULTANEOUS_TRACK_MULTIPLIER = 0.5;
/**
 * The high threat score assigned when a spawner's interval is at or below zero,
 * representing an extremely dense (or infinite) spawn rate.
 */
const ZERO_INTERVAL_DENSITY_SCORE = 5.0;

/**
 * The small time delta (in seconds) used to numerically approximate the
 * instantaneous horizontal speed of a spawner.
 */
const VELOCITY_CALCULATION_TIME_STEP = 0.1;

/**
 * A static utility class to calculate a numerical "threat" score for wave segments.
 */
export class ThreatCalculator {
    /**
     * Calculates the total threat score for a given wave segment definition.
     */
    public static calculateSegThreat(segDef: SegDefinition): number {
        let totalThreat = 0;
        const tracks = segDef.trackIds
            .map((id) => allTracks.find((t) => t.trackId === id))
            .filter((t): t is TrackDefinition => !!t);
        if (tracks.length === 0) return 0;

        for (const track of tracks) {
            totalThreat += this.calculateTrackThreat(track, segDef.duration);
        }

        const multiplier =
            1 + (tracks.length - 1) * SIMULTANEOUS_TRACK_MULTIPLIER;
        return totalThreat * multiplier;
    }

    /**
     * Calculates the total average threat of a single track
     */
    private static calculateTrackThreat(
        trackDef: TrackDefinition,
        duration: number,
    ): number {
        let cumulativeThreat = 0;
        const numSamples = Math.max(
            1,
            Math.floor(duration * SAMPLES_PER_SECOND),
        );
        const timeStep = duration / numSamples;
        let activeWeight = 0;

        for (let i = 0; i < numSamples; i++) {
            const time = i * timeStep;
            const trackVolume = KeyframeUtil.calculateValue(
                trackDef.properties.trackVolume,
                time,
            );
            if (trackVolume <= 0) continue;

            const speedThreat = this.calculateSpeedThreat(trackDef, time);
            const densityThreat = this.calculateDensityThreat(trackDef, time);
            const varianceThreat = this.calculateVariancePressureThreat(
                trackDef,
                time,
            );
            const positionThreat = this.calculatePositionPressureThreat(
                trackDef,
                time,
            );

            activeWeight += trackVolume;

            // Exponential model: Raw threats are modified by a weight exponent.
            const combinedThreat =
                Math.pow(1 + speedThreat, WEIGHTS.SPEED) *
                Math.pow(1 + densityThreat, WEIGHTS.DENSITY) *
                Math.pow(1 + varianceThreat, WEIGHTS.VARIANCE_PRESSURE) *
                Math.pow(1 + positionThreat, WEIGHTS.POSITION_PRESSURE);

            // Subtract 1 to normalize the baseline back to 0 before applying volume
            cumulativeThreat += (combinedThreat - 1) * trackVolume;
        }

        const avg = activeWeight > 0 ? cumulativeThreat / activeWeight : 0;
        return avg;
    }

    /**
     * Calculates threat based on spirit vertical speed.
     */
    private static calculateSpeedThreat(
        trackDef: TrackDefinition,
        time: number,
    ): number {
        const yVelocity = KeyframeUtil.calculateValue(
            trackDef.properties.yVelocity,
            time,
        );
        return yVelocity / BASELINE.Y_VELOCITY;
    }

    /**
     * Calculates threat based on spawn rate.
     */
    private static calculateDensityThreat(
        trackDef: TrackDefinition,
        time: number,
    ): number {
        const spawnInterval = KeyframeUtil.calculateValue(
            trackDef.properties.spawnInterval,
            time,
        );
        if (spawnInterval <= 0) return ZERO_INTERVAL_DENSITY_SCORE;
        return BASELINE.SPAWN_INTERVAL / spawnInterval;
    }

    /**
     * Calculates threat based on the horizontal area spirits can spawn in.
     */
    private static calculateVariancePressureThreat(
        trackDef: TrackDefinition,
        time: number,
    ): number {
        const spawnXVariance = KeyframeUtil.calculateValue(
            trackDef.properties.spawnXVariance,
            time,
        );
        return spawnXVariance / BASELINE.X_VARIANCE;
    }

    /**
     * Calculates threat based on the horizontal speed of the spawner itself.
     */
    private static calculatePositionPressureThreat(
        trackDef: TrackDefinition,
        time: number,
    ): number {
        const spawnX = KeyframeUtil.calculateValue(
            trackDef.properties.spawnX,
            time,
        );
        const futureX = KeyframeUtil.calculateValue(
            trackDef.properties.spawnX,
            time + VELOCITY_CALCULATION_TIME_STEP,
        );
        const xSpeed =
            Math.abs(futureX - spawnX) / VELOCITY_CALCULATION_TIME_STEP;
        return xSpeed / BASELINE.X_SPEED;
    }
}
