import React, { useState, useEffect } from "react";
import { EventBus } from "../../game/api/EventBus";
import { GameEvent, MobsStateChangeEvent } from "../../game/consts/GameUIEvent";
import { LevelState } from "../../game/logic/level/LevelState";
import { AnimatedMessage } from "./AnimatedMessage";

/**
 * Acts as a controller that listens for game state changes and renders the
 * appropriate UI message component for the current state.
 */
export const WaveMessageOverlay: React.FC = () => {
    const [activeMessage, setActiveMessage] = useState<{ id: number; state: LevelState; wave: number } | null>(null);

    useEffect(() => {
        const handleStateChange = (data: MobsStateChangeEvent) => {
            // Only show messages for these specific states
            if (data.newState === LevelState.WAVE_STARTING || data.newState === LevelState.WAVE_CLEARED) {
                setActiveMessage({
                    id: Date.now(), // Unique ID to force re-render
                    state: data.newState,
                    wave: data.waveNumber,
                });
            }
        };

        EventBus.on(GameEvent.MOBS_STATE_CHANGE_EVENT, handleStateChange);

        return () => {
            EventBus.removeListener(GameEvent.MOBS_STATE_CHANGE_EVENT, handleStateChange);
        };
    }, []);

    if (!activeMessage) {
        return null;
    }

    const onMessageComplete = () => {
        setActiveMessage(null);
    };

    switch (activeMessage.state) {
        case LevelState.WAVE_STARTING:
            return (
                <AnimatedMessage
                    key={activeMessage.id}
                    text={`Wave ${activeMessage.wave}`}
                    onComplete={onMessageComplete}
                />
            );
        case LevelState.WAVE_CLEARED:
            return (
                <AnimatedMessage
                    key={activeMessage.id}
                    text="Wave Cleared!"
                    onComplete={onMessageComplete}
                />
            );
        default:
            return null;
    }
};