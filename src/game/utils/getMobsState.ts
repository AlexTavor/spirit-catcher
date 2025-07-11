import { ECS } from "../logic/core/ECS";
import { MobsState } from "../logic/level/MobsState";

let mobsState: MobsState | null = null;

export function getMobsState(ecs: ECS): MobsState {
    if (mobsState) {
        return mobsState;
    }

    mobsState = ecs.getComponent(ecs.world, MobsState);
    if (!mobsState) {
        mobsState = new MobsState();
        ecs.addComponent(ecs.world, mobsState);
    }

    return mobsState;
}
