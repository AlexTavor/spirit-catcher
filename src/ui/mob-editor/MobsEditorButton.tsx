import React, { useState } from "react";
import styled from "@emotion/styled";
import { MobsEditorTool } from "./MobsEditorTool";

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

export const MobsEditorButton: React.FC = () => {
    const [isEditorOpen, setEditorOpen] = useState(false);

    // This button currently acts as a toggle to open the editor.
    // A browser refresh would be needed to close it.
    // For a better UX, a "close" function could be passed to MobsEditorTool.
    const toggleEditor = () => {
        setEditorOpen((prev) => !prev);
    };

    return (
        <>
            <StyledButton onClick={toggleEditor}>
                <span>👾</span>
                <span>Mobs</span>
            </StyledButton>

            {isEditorOpen && <MobsEditorTool toggleEditor={toggleEditor}/>}
        </>
    );
};