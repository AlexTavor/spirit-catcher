// src/game/logic/intentions/ChargeIntention.ts

import { Component } from "../core/ECS";

/**
 * A permanent component on the player representing the desire to charge a throw.
 */
export class ChargeIntention extends Component {
    private _active = false;

    public get active(): boolean {
        return this._active;
    }

    public set active(value: boolean) {
        if (this._active === value) return; // Avoid redundant logging

        if (!value) {
            console.warn(
                "ChargeIntention active state should not be set to false directly. Use the appropriate system to handle charging.",
            );
        }
        console.log(`ChargeIntention active state set to: ${value}`);
        this._active = value;
    }
}
