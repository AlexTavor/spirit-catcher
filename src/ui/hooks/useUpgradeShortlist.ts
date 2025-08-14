// src/ui/hooks/useUpgradeShortlist.ts

import { useState, useEffect } from "react";
import { EventBus } from "../../game/api/EventBus";
import { GameEvents } from "../../game/consts/GameEvents";
import { PlayerUpgradeType } from "../../game/logic/upgrades/PlayerUpgradeType";

// This hook no longer needs direct access to the ECS or its helper utils.

/**
 * A React hook that provides the current shortlist of upgrades to be presented to the player.
 * It listens for changes from the game engine.
 * @returns An array of PlayerUpgradeType, representing the current shortlist.
 */
export function useUpgradeShortlist(): PlayerUpgradeType[] {
    // Initialize state with an empty array.
    const [shortlist, setShortlist] = useState<PlayerUpgradeType[]>([]);

    useEffect(() => {
        // The payload of our event should be the new shortlist.
        // Let's define the handler to expect this.
        const handleStateChange = (newShortlist: PlayerUpgradeType[]) => {
            // Create a new array to ensure React detects the state change
            setShortlist([...newShortlist]);
        };

        // Subscribe to the event when the component mounts
        EventBus.on(GameEvents.UPGRADE_SHORTLIST_CHANGED, handleStateChange);

        // Unsubscribe from the event when the component unmounts
        return () => {
            EventBus.off(
                GameEvents.UPGRADE_SHORTLIST_CHANGED,
                handleStateChange,
            );
        };
    }, []); // Empty dependency array means this effect runs only once on mount.

    return shortlist;
}
