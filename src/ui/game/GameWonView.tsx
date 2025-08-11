import React, { useState, useEffect } from "react";
import { useLevelState } from "../hooks/useLevelState";
import { CommandBus } from "../../game/api/CommandBus";
import { GameCommands } from "../../game/consts/GameCommands";
import { WaveState } from "../../game/logic/level/WaveState";
import { EventBus } from "../../game/api/EventBus";
import { GameEvents, WaveStateChangeEvent } from "../../game/consts/GameEvents";
import { Overlay, TitleText, ScoreText, RestartText } from "./gameScreen.styles";

export const GameWonView: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const levelState = useLevelState();

    useEffect(() => {
        const handleStateChange = (data: WaveStateChangeEvent) => {
            if (data.newState === WaveState.GAME_WON) {
                setIsVisible(true);
            }
        };

        EventBus.on(GameEvents.WAVE_STATE_CHANGE, handleStateChange);

        return () => {
            EventBus.removeListener(
                GameEvents.WAVE_STATE_CHANGE,
                handleStateChange,
            );
        };
    }, []);

    const handleRestartClick = () => {
        CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {
            newState: WaveState.PRE_GAME,
        });
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <Overlay isVisible={isVisible} onClick={handleRestartClick}>
            <TitleText flash={true}>GLORIOUS VICTORY!</TitleText>
            <ScoreText>
                Total Spirits Collected: {levelState?.spiritsCollected ?? 0}
            </ScoreText>
            <RestartText>Tap to play another one</RestartText>
        </Overlay>
    );
};