import { ECS } from "../logic/core/ECS";
import { UpgradesShortlistState } from "../logic/upgrades/components/UpgradesShortlistState";

let shortlistState: UpgradesShortlistState | null = null;

/**
 * A cached utility function to retrieve the single UpgradesShortlistState component
 * from the world entity. If it doesn't exist, it will be created and added.
 * @param ecs The ECS instance.
 * @returns The singleton UpgradesShortlistState component.
 */
export function getUpgradesShortlistState(ecs: ECS): UpgradesShortlistState {
    if (shortlistState) {
        return shortlistState;
    }

    shortlistState = ecs.getComponent(ecs.world, UpgradesShortlistState);

    if (!shortlistState) {
        shortlistState = new UpgradesShortlistState();
        ecs.addComponent(ecs.world, shortlistState);
    }

    return shortlistState;
}
