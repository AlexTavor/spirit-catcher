import { Component } from "../core/ECS";

export class PlayerConfig extends Component {
    public chargeMaxLevel = 100; // Maximum charge level
    public chargeRate = 50; // Rate at which the charge level increases
    public walkSpeed = 500; // Pixels per second
}
