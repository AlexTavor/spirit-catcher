// src/game/logic/projectile/components/Projectile.ts
import { Entity } from "../../core/ECS";
import { Component } from "../../core/ECS";
import { ProjectileType } from "../ProjectileType";

export class Projectile extends Component {
    public age: number = 0;
    constructor(
        public type: ProjectileType,
        public targetEntity: Entity = -1,
        public homingDelay: number = 0,
    ) {
        super();
    }
}
