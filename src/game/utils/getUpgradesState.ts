import { ECS } from "../logic/core/ECS";
import { UpgradesState } from "../logic/upgrades/components/UpgradesState";

let upgradesState: UpgradesState | null = null;

export function getUpgradesState(ecs: ECS): UpgradesState {
    if (upgradesState) {
        return upgradesState;
    }

    upgradesState = ecs.getComponent(ecs.world, UpgradesState);
    if (!upgradesState) {
        upgradesState = new UpgradesState();
        ecs.addComponent(ecs.world, upgradesState);
    }

    return upgradesState;
}
