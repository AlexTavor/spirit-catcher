import { System } from "../../core/ECS";
import { CommandBus } from "../../../api/CommandBus";
import { ConfigManager } from "../../../api/ConfigManager";
import { GameCommands } from "../../../consts/GameCommands";
import { getPlayerEntity } from "../../../utils/getPlayerEntity";
import { Velocity } from "../../core/components/Velocity";
import { Mana } from "../components/Mana";
import { Boomerang } from "../../boomerang/components/Boomerang";
import { Airborne } from "../../boomerang/components/Airborne";
import { createExplosion } from "../../explosion/ExplosionFactory";
import { Transform } from "../../core/components/Transform";

/**
 * Listens for a stomp command and applies a strong downward velocity
 * to all active boomerangs on the screen.
 */
export class StompEffectSystem extends System {
    public componentsRequired = new Set<Function>();

    constructor() {
        super();
        CommandBus.on(GameCommands.STOMP_COMMAND, this.handleStomp, this);
    }

    public destroy(): void {
        CommandBus.removeListener(
            GameCommands.STOMP_COMMAND,
            this.handleStomp,
            this,
        );
    }

    private handleStomp(): void {
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        const mana = this.ecs.getComponent(player, Mana);
        const config = ConfigManager.get();
        const cost = config.StompManaCost;

        if (!mana || mana.current < cost) {
            // Not enough mana or player has no mana component.
            return;
        }

        // Subtract the mana cost.
        mana.current -= cost;

        // Find all active (airborne) boomerangs.
        const stompForce = config.StompForce;
        const boomerangs = this.ecs.getEntitiesWithComponents([
            Boomerang,
            Airborne,
            Velocity,
        ]);

        // Override their velocity to shoot straight down.
        for (const rang of boomerangs) {
            const velocity = this.ecs.getComponent(rang, Velocity);
            velocity.x = 0; // Eliminate horizontal movement.
            velocity.y += stompForce; // Apply strong downward force.
            const transform = this.ecs.getComponent(rang, Transform);
            createExplosion(this.ecs, transform.pos, 1.0); // Create an explosion effect.
        }
    }

    public update(): void {
        // This system is purely event-driven.
    }
}
