import { DifficultyCurveDefinition } from "../types";

// --- DIFFICULTY CURVES ---
// Defines the overall pacing and intensity of a full wave.

export const difficultyCurves: DifficultyCurveDefinition[] = [
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
