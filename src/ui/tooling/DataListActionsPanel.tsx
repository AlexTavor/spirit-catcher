import React from "react";
import styled from "@emotion/styled";

const ActionsContainer = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    padding: 8px;
    background-color: #2a2a2e;
    border-top: 1px solid #444;
`;

const ActionButton = styled.button`
    padding: 8px 16px;
    font-size: 14px;
    font-weight: bold;
    color: #e0e0e0;
    background-color: #3c3c42;
    border: 1px solid #555;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover:not(:disabled) {
        background-color: #4a4a52;
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

interface DataListActionsPanelProps {
    /** Callback function to add a new item. */
    onAdd?: () => void;
    /** Callback function to trigger an undo action. */
    onUndo?: () => void;
    /** Callback function to trigger a redo action. */
    onRedo?: () => void;
    /** Whether the undo action is currently possible. */
    canUndo: boolean;
    /** Whether the redo action is currently possible. */
    canRedo: boolean;
}

export const DataListActionsPanel: React.FC<DataListActionsPanelProps> = ({
    onAdd,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
}) => {
    return (
        <ActionsContainer>
            {onAdd ? <ActionButton onClick={onAdd} title="Add New Item">
                + Add
            </ActionButton> : null}
            {onUndo ? <ActionButton onClick={onUndo} disabled={!canUndo} title="Undo">
                ↶ Undo
            </ActionButton> : null}
            {onRedo ? <ActionButton onClick={onRedo} disabled={!canRedo} title="Redo">
                Redo ↷
            </ActionButton> : null}
        </ActionsContainer>
    );
};