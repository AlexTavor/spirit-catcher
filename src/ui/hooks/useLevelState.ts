import { useState, useEffect } from "react";
import { EventBus } from "../../game/api/EventBus";
import {
    GameEvents,
    LevelStateChangeEvent,
} from "../../game/consts/GameEvents";
import { LevelState } from "../../game/logic/level/LevelState";

/**
 * A React hook that provides the current LevelState from the game.
 * It listens for LEVEL_STATE_CHANGE events from the EventBus.
 * @returns The current LevelState object, or null if it has not been set yet.
 */
export function useLevelState() {
    const [levelState, setLevelState] = useState<LevelState | null>(null);

    useEffect(() => {
        // Handler for the level state change event
        const handleStateChange = (event: LevelStateChangeEvent) => {
            // We create a new object to ensure React detects the state change
            setLevelState({ ...event.newState });
        };

        // Subscribe to the event when the component mounts
        EventBus.on(GameEvents.LEVEL_STATE_CHANGE, handleStateChange);

        // Unsubscribe from the event when the component unmounts
        return () => {
            EventBus.off(GameEvents.LEVEL_STATE_CHANGE, handleStateChange);
        };
    }, []);

    return levelState;
}
