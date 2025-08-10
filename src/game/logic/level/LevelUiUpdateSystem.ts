import { EventBus } from "../../api/EventBus";
import { GameEvents } from "../../consts/GameEvents";
import { Entity, System } from "../core/ECS";
import { LevelState } from "./LevelState";

export class LevelUiUpdateSystem extends System {
    public componentsRequired = new Set<Function>([LevelState]);

    public update(entities: Set<Entity>, _: number): void {
        for (const entity of entities) {
            const levelState = this.ecs.getComponent(entity, LevelState);
            if (!levelState) continue;

            EventBus.emit(GameEvents.LEVEL_STATE_CHANGE, {
                newState: levelState,
            });
        }
    }

    public destroy(): void {}
}
