import { EventBus } from "../../api/EventBus";
import { GameEvents } from "../../consts/GameEvents";
import { getLevelState } from "../../utils/getLevelState";
import { Entity, System } from "../core/ECS";

export class LevelStateUpdateSystem extends System {
    public componentsRequired: Set<Function> = new Set<Function>();

    constructor() {
        super();
        EventBus.on(
            GameEvents.SPIRIT_COLLECTED,
            this.handleSpiritCollected,
            this,
        );

        EventBus.on(GameEvents.SPIRIT_MISSED, this.handleSpiritMissed, this);
    }

    public update(_entities: Set<Entity>, _delta: number): void {
        // Unused, but required for the system to be registered.
        // This system is event-driven and does not require a regular update loop.
    }

    private handleSpiritCollected(_event: any): void {
        const levelState = getLevelState(this.ecs);
        levelState.spiritsCollected += 1;
    }

    private handleSpiritMissed(_event: any): void {
        const levelState = getLevelState(this.ecs);
        levelState.spiritsMissed += 1;
    }

    public destroy(): void {
        EventBus.removeListener(
            GameEvents.SPIRIT_COLLECTED,
            this.handleSpiritCollected,
            this,
        );
        EventBus.removeListener(
            GameEvents.SPIRIT_MISSED,
            this.handleSpiritMissed,
            this,
        );
    }
}
