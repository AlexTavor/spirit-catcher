import { Component } from "../../core/ECS";

export class HitWallFlag extends Component {
    constructor(public hitLeft: boolean = false) {
        super();
    }
}
