import { Component } from "../core/ECS";

export class Velocity extends Component {
    public x: number = 0; // Horizontal velocity in pixels per second
    public y: number = 0; // Vertical velocity in pixels per second

    constructor(x: number = 0, y: number = 0) {
        super();
        this.x = x;
        this.y = y;
    }
}
