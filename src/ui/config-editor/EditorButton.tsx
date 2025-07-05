import React, { useState } from "react";
import { ConfigEditor } from "./ConfigEditor";
import styled from "@emotion/styled";

const StyledButton = styled.div`
    position: fixed;
    top: 15px;
    left: 15px;
    z-index: 9999; /* Ensure it's on top of other UI */
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

export const EditorButton: React.FC = () => {
    const [isEditorOpen, setEditorOpen] = useState(false);

    const openEditor = () => setEditorOpen(true);
    const closeEditor = () => setEditorOpen(false);

    return (
        <>
            <StyledButton onClick={openEditor}>
                <span>⚙️</span>
                <span>Config</span>
            </StyledButton>

            {isEditorOpen && <ConfigEditor onClose={closeEditor} />}
        </>
    );
};