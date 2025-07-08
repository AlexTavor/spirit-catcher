import { Pos } from "../../../utils/Math";
import { Component } from "../core/ECS";

/**
 * A permanent component on the player representing the desire to move.
 */

export class MoveIntention extends Component {
    public active: boolean = false;
    public targetPos: Pos = { x: 0, y: 0 };
}
