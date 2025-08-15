import { TrackDefinition, SegDefinition } from "../types";
import { ConfigManager } from "../../../consts/ConfigManager";
import { TracksUtil } from "./TracksUtil";
import { allTracks } from "./allTracks";
import { buildArrow } from "./arrowBuilder";

const puffStep = ConfigManager.get().GameWidth / 6;
const fingersStep = ConfigManager.get().GameWidth / 8;
const fingerSpeeds = [80, 90, 120, 110, 100];

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
const thinSnake: SegDefinition = {
    segId: "thinSnake",
    duration: 13,
    rarity: 10,
    trackIds: ["thinSnake"],
};

allTracks.push(...puffSlowTracks, ...puffQuickTracks, ...fingersTracks);

const { tracks: arrowLeftTracks, seg: arrowLeftSeg } = buildArrow(
    "arrowLeft",
    10,
    75,
    400,
    200,
);

allTracks.push(...arrowLeftTracks);

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
const { tracks: thinSnakeMirrorTracks, seg: thinSnakeMirrorSeg } =
    TracksUtil.mirror(thinSnake);
const { tracks: arrowRightTracks, seg: arrowRightSeg } =
    TracksUtil.mirror(arrowLeftSeg);

export const allTracksWithMirrors: TrackDefinition[] = [
    ...zigZagMirrorTracks,
    ...puffSlowMirrorTracks,
    ...puffQuickMirrorTracks,
    ...fingersMirrorTracks,
    ...wallBounceMirrorTracks,
    ...fatSnakeMirrorTracks,
    ...thinSnakeMirrorTracks,
    ...arrowRightTracks,
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
    thinSnake,
    thinSnakeMirrorSeg,
    arrowLeftSeg,
    arrowRightSeg,
];
