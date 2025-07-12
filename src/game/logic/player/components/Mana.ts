import { Component } from "../../core/ECS";

export class Mana extends Component {
    public current: number;
    public max: number;

    constructor(maxMana: number) {
        super();
        this.max = maxMana;
        this.current = maxMana; // Start with full mana
    }
}
