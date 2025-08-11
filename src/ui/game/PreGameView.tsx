import React, { useState } from "react";
import { CommandBus } from "../../game/api/CommandBus";
import { GameCommands } from "../../game/consts/GameCommands";
import { WaveState } from "../../game/logic/level/WaveState";
import { Overlay, TitleText } from "./gameScreen.styles";


export const PreGameView: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);

    const handleStartClick = () => {
        CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {newState:WaveState.PRE_WAVE});
        setIsVisible(false); // Hide the view immediately on click
    };

    return (
        <Overlay isVisible={isVisible} onClick={handleStartClick}>
            <TitleText flash={true}>TAP TO START</TitleText>
        </Overlay>
    );
};