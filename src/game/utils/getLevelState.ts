import { ECS } from "../logic/core/ECS";
import { LevelState } from "../logic/level/LevelState";
import { ModifiableStat } from "../logic/upgrades/ModifiableStat";
import { Values } from "../logic/upgrades/Values";

let lvlState: LevelState | null = null;

export function getLevelState(ecs: ECS): LevelState {
    if (lvlState) {
        return lvlState;
    }

    lvlState = ecs.getComponent(ecs.world, LevelState);
    if (!lvlState) {
        lvlState = new LevelState(
            Values.get(ecs, ecs.world, ModifiableStat.MAX_HEALTH),
        );
        ecs.addComponent(ecs.world, lvlState);
    }

    return lvlState;
}
