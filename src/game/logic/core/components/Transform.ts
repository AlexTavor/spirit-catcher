import { Pos } from "../../../../utils/Math";
import { Component } from "../ECS";

export class Transform extends Component {
    public pos: Pos = { x: 0, y: 0 };

    constructor(pos: Pos = { x: 0, y: 0 }) {
        super();
        this.pos = { ...pos };
    }
}
