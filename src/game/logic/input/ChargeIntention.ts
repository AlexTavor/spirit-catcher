// src/game/logic/intentions/ChargeIntention.ts

import { Component } from "../core/ECS";

/**
 * A permanent component on the player representing the desire to charge a throw.
 */
export class ChargeIntention extends Component {
    public active = false;
}
