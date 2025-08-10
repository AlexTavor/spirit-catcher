import React from "react";
import styled from "@emotion/styled";
import { useLevelState } from "../hooks/useLevelState";
import { useCanvasBounds } from "../hooks/useCanvasBounds";

const HealthBarWrapper = styled.div`
    position: absolute;
    height: 6px; /* A thin bar */
    background-color: #333; /* Dark background for contrast */
    pointer-events: none;
    z-index: 100;
    transition: all 0.1s linear; /* Smooth position and width changes */
`;

const HealthBarFill = styled.div`
    height: 100%;
    background: linear-gradient(90deg, #39ff14, #00ff7f); /* Green gradient */
    width: 100%;
    margin: 0 auto; /* Center the bar */
    transition: width 0.2s ease-out; /* Animate width changes */
`;

export const HealthBar: React.FC = () => {
    const levelState = useLevelState();
    const canvasBounds = useCanvasBounds();

    if (!levelState || !canvasBounds) {
        return null;
    }

    const { spiritsMissed, maxSpiritMisses } = levelState;

    // Calculate the percentage of health remaining.
    const healthPercentage = Math.max(
        0,
        1 - spiritsMissed / maxSpiritMisses,
    );

    // Style the wrapper to match the canvas position and dimensions.
    const barStyle = {
        top: `${canvasBounds.y}px`,
        left: `${canvasBounds.x}px`,
        width: `${canvasBounds.width}px`,
    };

    // Style the fill to represent the remaining health percentage.
    const fillStyle = {
        width: `${healthPercentage * 100}%`,
    };

    return (
        <HealthBarWrapper id="health-bar" style={barStyle}>
            <HealthBarFill style={fillStyle} />
        </HealthBarWrapper>
    );
};