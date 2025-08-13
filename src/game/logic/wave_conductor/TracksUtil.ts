import { buildTrack } from "./data";
import {
    SegDefinition,
    TrackDefinition,
    TrackProperties,
    Keyframe,
} from "./types";

type StaggerableValue<T> = T | ((step: number) => T);

export interface StaggerConfig {
    delay: number;
    duration: number;
    segDurationPadding?: number;
    valueFunctions: {
        yVelocity?: StaggerableValue<number>;
        spawnXVariance?: StaggerableValue<number>;
        spawnYVariance?: StaggerableValue<number>;
        spawnInterval?: StaggerableValue<number>;
        spawnX?: StaggerableValue<number>;
    };
}

export class TracksUtil {
    public static buildStaggered(
        idBase: string,
        prefabId: string,
        count: number,
        staggerConfig: StaggerConfig,
        rarity: number = 10,
    ): { tracks: TrackDefinition[]; seg: SegDefinition } {
        const tracks: TrackDefinition[] = [];

        for (let i = 0; i < count; i++) {
            const trackId = `${idBase}_${i}`;
            const overrides: Partial<TrackDefinition["properties"]> = {};

            // Apply stagger values
            TracksUtil.applyStaggeredOverrides(staggerConfig, overrides, i);

            // Handle trackVolume
            overrides.trackVolume = TracksUtil.generateVolumeKeyframes(
                i,
                staggerConfig,
            );

            tracks.push(buildTrack(trackId, prefabId, overrides));
        }

        const seg: SegDefinition = {
            segId: `${idBase}_seg`,
            trackIds: tracks.map((track) => track.trackId),
            duration: TracksUtil.calculateTotalSegDuration(
                staggerConfig,
                count,
            ),
            rarity,
        };

        console.log(seg);

        return { tracks, seg };
    }

    private static applyStaggeredOverrides(
        staggerConfig: StaggerConfig,
        overrides: Partial<TrackProperties>,
        i: number,
    ) {
        const applyValue = (
            key: keyof TrackProperties,
            valueOrFn: StaggerableValue<number> | undefined,
        ) => {
            if (valueOrFn !== undefined) {
                const value =
                    typeof valueOrFn === "function"
                        ? (valueOrFn as (step: number) => number)(i)
                        : valueOrFn;
                overrides[key] = [{ time: 0, value }];
            }
        };

        applyValue("yVelocity", staggerConfig.valueFunctions.yVelocity);
        applyValue(
            "spawnXVariance",
            staggerConfig.valueFunctions.spawnXVariance,
        );
        applyValue(
            "spawnYVariance",
            staggerConfig.valueFunctions.spawnYVariance,
        );
        applyValue("spawnInterval", staggerConfig.valueFunctions.spawnInterval);
        applyValue("spawnX", staggerConfig.valueFunctions.spawnX);
    }

    private static generateVolumeKeyframes(
        i: number,
        staggerConfig: StaggerConfig,
    ): Keyframe<number>[] | undefined {
        // The first track (i === 0) should start active.
        if (i === 0) {
            return [
                { time: 0, value: 1.0 },
                {
                    time: staggerConfig.duration,
                    value: 0.0,
                    ease: "step",
                },
            ];
        }

        // Subsequent tracks are delayed.
        const delay = staggerConfig.delay * i;
        const duration = staggerConfig.duration;

        return [
            { time: 0, value: 0 },
            {
                time: delay,
                value: 1.0,
                ease: "step",
            },
            {
                time: delay + duration,
                value: 0.0,
                ease: "step",
            },
        ];
    }

    private static calculateTotalSegDuration(
        staggerConfig: StaggerConfig,
        count: number,
    ): number {
        if (count === 0) return 0;
        const lastTrackStartTime = staggerConfig.delay * (count - 1);
        return (
            lastTrackStartTime +
            staggerConfig.duration +
            (staggerConfig.segDurationPadding || 0)
        );
    }
}
