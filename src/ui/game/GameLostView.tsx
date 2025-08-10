import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useLevelState } from "../hooks/useLevelState";
import { CommandBus } from "../../game/api/CommandBus";
import { GameCommands } from "../../game/consts/GameCommands";
import { WaveState } from "../../game/logic/level/WaveState";
import { EventBus } from "../../game/api/EventBus";
import { GameEvents, WaveStateChangeEvent } from "../../game/consts/GameEvents";
import { keyframes } from "@emotion/react";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Overlay = styled.div<{ isVisible: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    z-index: 10001;
    cursor: pointer;
    opacity: ${(props) => (props.isVisible ? 1 : 0)};
    animation: ${fadeIn} 0.5s ease-in-out;
    pointer-events: ${(props) => (props.isVisible ? "auto" : "none")};
    transition: opacity 0.3s ease-in-out;
`;

const GameOverText = styled.h1`
    color: #ff4d4d;
    font-size: 8vw;
    font-family: sans-serif;
    font-weight: bold;
    text-shadow: 3px 3px 10px rgba(0, 0, 0, 0.8);
    margin: 0;
`;

const ScoreText = styled.p`
    color: white;
    font-size: 3em;
    font-family: sans-serif;
    margin-top: 20px;
`;

const RestartText = styled.p`
    color: #ccc;
    font-size: 2em;
    font-family: sans-serif;
    margin-top: 40px;
    animation: ${keyframes`
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    `} 2s infinite;
`;

export const GameLostView: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const levelState = useLevelState();

    useEffect(() => {
        const handleStateChange = (data: WaveStateChangeEvent) => {
            if (data.newState === WaveState.GAME_LOST) {
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
            <GameOverText>GAME OVER</GameOverText>
            <ScoreText>
                Total Spirits Collected: {levelState?.spiritsCollected ?? 0}
            </ScoreText>
            <RestartText>Tap to restart</RestartText>
        </Overlay>
    );
};