import { Pos } from "../../../../utils/Math";

export class SpiritSpawnDefinition {
    public position: Pos;
    public velocity: Pos;

    constructor(position: Pos, velocity: Pos) {
        this.position = position;
        this.velocity = velocity;
    }
}
