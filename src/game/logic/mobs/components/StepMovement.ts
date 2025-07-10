import { Component } from "../../core/ECS";

/**
 * A temporary component added to mobs while they are actively animating a step.
 * It holds the start and end positions for the interpolation.
 */
export class StepMovement extends Component {
    constructor(
        public startY: number,
        public targetY: number,
    ) {
        super();
    }
}
