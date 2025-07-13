import React, { useState } from "react";
import styled from "@emotion/styled";
import { PatternEditorTool } from "./PatternEditorTool";

const StyledButton = styled.div`
    position: relative;
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

export const PatternEditorButton: React.FC = () => {
    const [isEditorOpen, setEditorOpen] = useState(false);

    const toggleEditor = () => {
        setEditorOpen((prev) => !prev);
    };

    return (
        <>
            <StyledButton onClick={toggleEditor}>
                <span>🎨</span>
                <span>Patterns</span>
            </StyledButton>

            {isEditorOpen && <PatternEditorTool toggleEditor={toggleEditor} />}
        </>
    );
};