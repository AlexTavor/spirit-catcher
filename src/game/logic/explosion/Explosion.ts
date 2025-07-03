import { Component } from "../core/ECS";

export class Explosion extends Component {
    /** The initial, normalized (0-1) intensity of the explosion. */
    public readonly maxForce: number;

    /** The total lifespan of the explosion effect in milliseconds. */
    public readonly duration: number;

    /** The current age of the explosion in milliseconds, updated by ExplosionSystem. */
    public age: number = 0;

    /**
     * @param maxForce The initial, normalized (0-1) intensity of the explosion.
     * @param duration The duration of the explosion effect in milliseconds.
     */
    constructor(maxForce: number, duration: number = 1000) {
        super();
        this.maxForce = maxForce;
        this.duration = duration;
    }
}
