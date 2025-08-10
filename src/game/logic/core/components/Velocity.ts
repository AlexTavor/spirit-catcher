import { Pos } from "../../../../utils/Math";
import { Component } from "../ECS";

export class Velocity extends Component {
    public x: number = 0; // Horizontal velocity in pixels per second
    public y: number = 0; // Vertical velocity in pixels per second

    constructor(velocity: Pos = { x: 0, y: 0 }) {
        super();
        this.x = velocity.x;
        this.y = velocity.y;
    }
}
