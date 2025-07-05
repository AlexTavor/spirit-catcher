import { Component } from "../ECS";
import { Pos } from "../../../../utils/Math";

/**
 * The state for a single pointer.
 */
export interface PointerData {
    isDown: boolean;
    pointerId: number;
    downPos: Pos;
    currentPos: Pos;
    downTimestamp: number;
}

export const MAX_POINTERS = 5;

/**
 * An ECS component that holds the live state of all user inputs.
 * This is the single source of truth for all other input-interpreting systems.
 */
export class InputState extends Component {
    public pointers: PointerData[] = [];

    constructor() {
        super();
        // Pre-allocate a pool of pointer objects to avoid garbage collection
        for (let i = 0; i < MAX_POINTERS; i++) {
            this.pointers.push({
                isDown: false,
                pointerId: -1,
                downPos: { x: 0, y: 0 },
                currentPos: { x: 0, y: 0 },
                downTimestamp: 0,
            });
        }
    }
}
