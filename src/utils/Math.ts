export interface Pos {
    x: number;
    y: number;
}

export class MathUtils {
    static weightedRand(weightedValues: { [key: number]: number }): number {
        // Calculate the total weight
        let totalWeight = 0;
        for (const key in weightedValues) {
            totalWeight += weightedValues[key];
        }

        // Generate a random number in the range [0, totalWeight)
        let random = Math.random() * totalWeight;

        // Determine which key corresponds to the random number
        for (const key in weightedValues) {
            random -= weightedValues[key];
            if (random <= 0) {
                return parseInt(key);
            }
        }

        // Fallback, should theoretically never be reached
        return -1;
    }

    /**
     * Selects a random key from an object based on the numerical weights assigned to each key.
     *
     * @param weightedValues - An object where keys are the items to choose from (string)
     * and values are their corresponding weights (number).
     * @returns A randomly selected key (string) based on the provided weights.
     * Returns an empty string if the input object is empty or total weight is zero.
     */
    public static weightedRandString(weightedValues: {
        [key: string]: number;
    }): string {
        let totalWeight = 0;

        // Calculate the sum of all weights
        for (const key in weightedValues) {
            // Ensure the property belongs to the object itself, not its prototype
            if (Object.prototype.hasOwnProperty.call(weightedValues, key)) {
                // Ensure weight is a positive number
                const weight = Math.max(0, weightedValues[key]);
                weightedValues[key] = weight; // Store the sanitized weight back
                totalWeight += weight;
            }
        }

        // Handle edge case: no items or zero total weight
        if (totalWeight <= 0) {
            console.warn(
                "weightedRand called with empty or zero-weight items.",
            );
            // Attempt to return the first key if any exist, otherwise empty string
            const keys = Object.keys(weightedValues);
            return keys.length > 0 ? keys[0] : "";
        }

        // Generate a random number between 0 (inclusive) and totalWeight (exclusive)
        let random = Math.random() * totalWeight;

        // Iterate through the items again to find the chosen one
        for (const key in weightedValues) {
            if (Object.prototype.hasOwnProperty.call(weightedValues, key)) {
                // If the random number falls within the current item's weight range
                if (random < weightedValues[key]) {
                    return key; // Return the key of the selected item
                }
                // Subtract the current item's weight from the random number
                random -= weightedValues[key];
            }
        }

        // Fallback: Should theoretically not be reached if totalWeight > 0
        // Return the last key as a safeguard
        const keys = Object.keys(weightedValues);
        console.warn("weightedRand fallback triggered.");
        return keys.length > 0 ? keys[keys.length - 1] : "";
    }

    static weightedRandIndex(weights: number[]): number {
        // Calculate the total weight
        let totalWeight = 0;
        for (let i = 0; i < weights.length; i++) {
            totalWeight += weights[i];
        }

        // Generate a random number in the range [0, totalWeight)
        let random = Math.random() * totalWeight;

        // Determine which key corresponds to the random number
        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return i;
            }
        }

        // Fallback, should theoretically never be reached
        return -1;
    }

    static remapNoiseToUnit(value: number): number {
        return (value + 1) / 2;
    }

    static distance(pos1: Pos, pos2: Pos): number {
        // Simple Euclidean distance calculation
        return Math.sqrt(
            Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2),
        );
    }

    static normalize(pos: Pos): Pos {
        const length = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
        if (length == 0) return { x: 0, y: 0 };
        return { x: pos.x / length, y: pos.y / length };
    }

    static multiply(pos: Pos, scalar: number): Pos {
        return { x: pos.x * scalar, y: pos.y * scalar };
    }

    static add(pos1: Pos, pos2: Pos): Pos {
        return { x: pos1.x + pos2.x, y: pos1.y + pos2.y };
    }

    static subtract(pos1: Pos, pos2: Pos): Pos {
        return { x: pos1.x - pos2.x, y: pos1.y - pos2.y };
    }

    static randomPointOnCircumference(position: Pos, radius: number): Pos {
        const angle = Math.random() * 2 * Math.PI;
        const x = position.x + radius * Math.cos(angle);
        const y = position.y + radius * Math.sin(angle);
        return { x, y };
    }

    static closestValue(
        position: Pos,
        values: Set<number>,
        positions: Map<number, Pos>,
    ): number | undefined {
        let closest = Number.MAX_VALUE;
        let target = undefined;

        values.forEach((value) => {
            const pos = positions.get(value);
            if (!pos) {
                return;
            }
            const distance = MathUtils.distance(position, pos);
            if (distance < closest) {
                closest = distance;
                target = value;
            }
        });

        return target;
    }
}
