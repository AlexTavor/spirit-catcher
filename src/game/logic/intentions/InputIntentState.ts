import { Component, ECS } from "../core/ECS";

/**
 * Defines the possible "locked-in" intents for a given pointer,
 * using a bitmask to allow for multiple simultaneous intents.
 */
export enum PointerIntent {
    NONE = 0, // binary 00
    MOVE = 1, // binary 01
    CHARGE = 2, // binary 10
}

/**
 * An ECS component that holds the interpreted, "locked-in" intent for each active pointer.
 */
export class InputIntentState extends Component {
    /**
     * Maps a pointer's unique ID to its combined bitmask of intents.
     */
    public intents = new Map<number, PointerIntent>();

    /**
     * A static getter to ensure the component is a singleton on the world entity.
     * Creates and caches the component on its first call.
     * @param ecs The ECS instance.
     * @returns The single instance of the InputIntentState component.
     */
    public static get(ecs: ECS): InputIntentState {
        if (!ecs.hasComponent(ecs.world, InputIntentState)) {
            ecs.addComponent(ecs.world, new InputIntentState());
        }
        return ecs.getComponent(ecs.world, InputIntentState);
    }
}
