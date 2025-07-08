import { Component } from "../../core/ECS";

export class Health extends Component {
    public hp: number;
    public maxHp: number;
    public lastHitForce = 0; // The normalized force (0-1) of the last hit
    public get isAlive(): boolean {
        return this.hp > 0;
    }

    constructor(maxHealth: number) {
        super();
        this.maxHp = maxHealth;
        this.hp = maxHealth;
    }

    public takeDamage(amount: number): void {
        this.hp = Math.max(0, this.hp - amount);
    }

    public reset(): void {
        this.hp = this.maxHp;
    }
}
