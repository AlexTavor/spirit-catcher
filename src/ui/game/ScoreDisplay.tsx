import React from "react";
import styled from "@emotion/styled";
import { useLevelState } from "../hooks/useLevelState";

const ScoreContainer = styled.div`
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 2.5em;
    font-family: sans-serif;
    font-weight: bold;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
    z-index: 1000;
    pointer-events: none;
`;

/**
 * A UI component that displays the number of spirits collected.
 * It uses the useLevelState hook to get the latest score.
 */
export const ScoreDisplay: React.FC = () => {
    const levelState = useLevelState();

    // Don't render anything if the level state is not yet available
    if (!levelState) {
        return null;
    }

    return (
        <ScoreContainer>
            {levelState.spiritsCollected}
        </ScoreContainer>
    );
};
