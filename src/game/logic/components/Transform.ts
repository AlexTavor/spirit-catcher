import { Pos } from "../../../utils/Math";
import { Component } from "../core/ECS";

export class Transform extends Component {
    public pos: Pos = { x: 0, y: 0 };
}
