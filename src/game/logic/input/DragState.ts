import { Component } from "../core/ECS";

export class DragState extends Component {
    public pointerId: number = -1;
    public startX: number = 0;
    public currentX: number = 0;
}
