import React, { useState } from "react";
import styled from "@emotion/styled";
import { LogDisplay } from "./LogDisplay";

const StyledButton = styled.div`
    position: fixed;
    top: 65px; /* Positioned below the existing EditorButton */
    left: 15px;
    z-index: 9999;
    padding: 10px 15px;
    background-color: #333;
    color: white;
    border: 1px solid #888;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    font-family: sans-serif;
    display: flex;
    align-items: center;
    gap: 8px;
    user-select: none;

    &:hover {
        background-color: #555;
    }
`;

export const LogButton: React.FC = () => {
    const [isLogOpen, setLogOpen] = useState(false);

    const toggleLog = () => {
        setLogOpen((prev) => !prev);
    };

    return (
        <>
            <StyledButton onClick={toggleLog}>
                <span>📜</span>
                <span>Logs</span>
            </StyledButton>

            <LogDisplay isOpen={isLogOpen} />
        </>
    );
};