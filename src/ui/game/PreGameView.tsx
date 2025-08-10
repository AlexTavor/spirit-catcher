import React, { useState } from "react";
import styled from "@emotion/styled";
import { CommandBus } from "../../game/api/CommandBus";
import { GameCommands } from "../../game/consts/GameCommands";
import { WaveState } from "../../game/logic/level/WaveState";

const Overlay = styled.div<{ isVisible: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 10001;
    cursor: pointer;
    opacity: ${(props) => (props.isVisible ? 1 : 0)};
    transition: opacity 0.3s ease-in-out;
    pointer-events: ${(props) => (props.isVisible ? "auto" : "none")};
`;

const StartText = styled.div`
    color: white;
    font-size: 3.5vw; /* Responsive font size */
    font-family: sans-serif;
    font-weight: bold;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
    text-align: center;
`;

export const PreGameView: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);

    const handleStartClick = () => {
        CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {newState:WaveState.PRE_WAVE});
        setIsVisible(false); // Hide the view immediately on click
    };

    return (
        <Overlay isVisible={isVisible} onClick={handleStartClick}>
            <StartText>TAP TO START</StartText>
        </Overlay>
    );
};