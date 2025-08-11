import { ECS } from "../logic/core/ECS";
import { LevelState } from "../logic/level/LevelState";
import { levelData } from "../logic/spirits/systems/levelData";

let lvlState: LevelState | null = null;

export function getLevelState(ecs: ECS): LevelState {
    if (lvlState) {
        return lvlState;
    }

    lvlState = ecs.getComponent(ecs.world, LevelState);
    if (!lvlState) {
        lvlState = new LevelState(levelData);
        ecs.addComponent(ecs.world, lvlState);
    }

    return lvlState;
}
