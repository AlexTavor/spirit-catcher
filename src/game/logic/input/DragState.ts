import { Component } from "../core/ECS";

export class DragState extends Component {
    public pointerId: number = -1;
    public fingerStartX: number = 0;
    public playerStartX: number = 0;
    public targetX: number = 0;
}
