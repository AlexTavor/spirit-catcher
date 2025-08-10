import React, { useState, useEffect } from "react";
import { EventBus } from "../../game/api/EventBus";
import { GameEvents, WaveStateChangeEvent } from "../../game/consts/GameEvents";
import { WaveState } from "../../game/logic/level/WaveState";
import { AnimatedMessage } from "./AnimatedMessage";
import { ConfigManager } from "../../game/api/ConfigManager";

/**
 * Acts as a controller that listens for game state changes and renders the
 * appropriate UI message component for the current state.
 */
export const WaveMessageOverlay: React.FC = () => {
    const [activeMessage, setActiveMessage] = useState<{ id: number; state: WaveState; wave: number } | null>(null);

    useEffect(() => {
        const handleStateChange = (data: WaveStateChangeEvent) => {
            // Only show messages for these specific states
            if (data.newState === WaveState.WAVE_STARTING || data.newState === WaveState.WAVE_CLEARED) {
                setActiveMessage({
                    id: Date.now(), // Unique ID to force re-render
                    state: data.newState,
                    wave: data.waveNumber,
                });
            }
        };

        EventBus.on(GameEvents.WAVE_STATE_CHANGE, handleStateChange);

        return () => {
            EventBus.removeListener(GameEvents.WAVE_STATE_CHANGE, handleStateChange);
        };
    }, []);

    if (!activeMessage) {
        return null;
    }

    const onMessageComplete = () => {
        setActiveMessage(null);
    };

    switch (activeMessage.state) {
        case WaveState.WAVE_STARTING:
            return (
                <AnimatedMessage
                    key={activeMessage.id}
                    duration={ConfigManager.get().LevelTransitionDuration}
                    text={`Wave ${activeMessage.wave}`}
                    onComplete={onMessageComplete}
                />
            );
        case WaveState.WAVE_CLEARED:
            return (
                <AnimatedMessage
                    key={activeMessage.id}
                    duration={ConfigManager.get().LevelTransitionDuration}
                    text="Wave Cleared!"
                    onComplete={onMessageComplete}
                />
            );
        default:
            return null;
    }
};