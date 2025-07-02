import { Component } from "../core/ECS";

export class Charging extends Component {
    public level = 0;
    public maxLevel = 100; // Maximum charge level
    public chargeRate = 10; // Rate at which the charge level increases
}
