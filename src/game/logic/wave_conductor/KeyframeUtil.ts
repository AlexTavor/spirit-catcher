import { MathUtils } from "../../../utils/Math";
import { Keyframe } from "./types";

// --- Utility for Keyframe Interpolation ---
export class KeyframeUtil {
    /**
     * Finds the two keyframes a given time falls between.
     */
    private static findSurroundingKeyframes<T>(
        keyframes: Keyframe<T>[],
        time: number,
    ): { prev: Keyframe<T>; next: Keyframe<T> } | null {
        if (keyframes.length === 0) return null;
        if (keyframes.length === 1)
            return { prev: keyframes[0], next: keyframes[0] };

        const first = keyframes[0];
        if (time < first.time) return { prev: first, next: first };

        for (let i = 0; i < keyframes.length - 1; i++) {
            const current = keyframes[i];
            const next = keyframes[i + 1];
            if (time >= current.time && time <= next.time) {
                return { prev: current, next: next };
            }
        }

        const last = keyframes[keyframes.length - 1];
        return { prev: last, next: last };
    }

    /**
     * Calculates the value of a property at a specific time based on its keyframes.
     * Supports 'step' and 'linear' easing.
     */
    public static calculateValue(
        keyframes: Keyframe<number>[],
        time: number,
    ): number {
        const frames = this.findSurroundingKeyframes(keyframes, time);
        if (!frames) return 0;

        const { prev, next } = frames;

        if (prev === next || prev.ease === "step" || prev.time === next.time) {
            return prev.value;
        }

        const duration = next.time - prev.time;
        const timeSincePrev = time - prev.time;
        const t = MathUtils.clamp(timeSincePrev / duration, 0, 1);

        // Linear interpolation
        return prev.value + (next.value - prev.value) * t;
    }
}
