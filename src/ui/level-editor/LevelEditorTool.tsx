import React from "react";
import styled from "@emotion/styled";
import { DataList } from "../tooling/DataList";
import { DataListActionsPanel } from "../tooling/DataListActionsPanel";
import { LevelDefinition } from "../../game/logic/level/types";
import {
    LevelsEditorProvider,
    useLevelsEditorActions,
    useLevelsEditorState,
} from "./LevelsEditorProvider";
import { LevelDetailEditor } from "./LevelDetailEditor";
import { GameDataManager } from "../../game/api/GameDataManager";

// --- STYLED COMPONENTS ---

const EditorLayout = styled.div`
    position: fixed;
    z-index: 10003;
    top: 0;
    left: 0;
    display: grid;
    grid-template-columns: 350px 1fr;
    height: 100vh;
    width: 100vw;
    background-color: #222;
    color: white;
    font-family: sans-serif;
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    border-right: 2px solid #111;
    overflow: hidden;
`;

const InfoPanel = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #777;
    font-size: 20px;
`;

const CloseButton = styled.button`
    background-color: #c0392b;
    position: absolute;
    top: 10px;
    right: 10px;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    font-weight: bold;
    cursor: pointer;
    z-index: 10004;
`;

const Toolbar = styled.div`
    padding: 8px;
    background-color: #1a1a1e;
    border-bottom: 1px solid #444;
    text-align: right;
`;

const SaveButton = styled.button`
    padding: 8px 16px;
    font-weight: bold;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    &:disabled {
        background-color: #555;
        cursor: not-allowed;
    }
`;

// --- SELECTION STATE REDUCER ---

type SelectionState = { selectedLevelId?: string; selectedWaveIndex?: number };
type SelectionAction =
    | { type: "SELECT_LEVEL"; payload?: string }
    | { type: "SELECT_WAVE"; payload?: number };

export function selectionReducer(
    state: SelectionState,
    action: SelectionAction,
): SelectionState {
    switch (action.type) {
        case "SELECT_LEVEL":
            // When selecting a new level, always deselect the wave
            return {
                selectedLevelId: action.payload,
                selectedWaveIndex: undefined,
            };
        case "SELECT_WAVE":
            return { ...state, selectedWaveIndex: action.payload };
        default:
            return state;
    }
}

// --- EDITOR UI ---
const EditorCore: React.FC<{
    onSave: (levels: LevelDefinition[]) => void;
    toggleEditor: () => void;
}> = ({ onSave, toggleEditor }) => {
    const { levels, selectedLevelId, isDirty } = useLevelsEditorState();
    const { selectLevel, ...actions } = useLevelsEditorActions();

    const handleAddLevel = () => {
        const newLevel: LevelDefinition = {
            id: `level_${Date.now()}`,
            name: "New Level",
            startHpMultiplier: 1,
            endHpMultiplier: 2,
            startSpeed: 50,
            endSpeed: 100,
            waves: [],
        };
        actions.setLevels([...levels, newLevel]);
    };

    const handleDeleteLevel = (index: number) => {
        const levelToDelete = levels[index];
        actions.setLevels(levels.filter((_, i) => i !== index));
        if (selectedLevelId === levelToDelete.id) {
            selectLevel(undefined);
        }
    };

    return (
        <EditorLayout>
            <Column>
                <Toolbar>
                    <SaveButton
                        onClick={() => onSave(levels)}
                        disabled={!isDirty}
                    >
                        Save & Download
                    </SaveButton>
                </Toolbar>
                <DataList<LevelDefinition>
                    items={levels}
                    selectedIndex={levels.findIndex((l) => l.id === selectedLevelId)}
                    onSelectItem={(index) => selectLevel(levels[index].id)}
                    onDeleteItem={handleDeleteLevel}
                    renderItem={(level) => level.name}
                    getKey={(level) => level.id}
                >
                    <DataListActionsPanel
                        onAdd={handleAddLevel}
                        onUndo={actions.undo}
                        onRedo={actions.redo}
                        canUndo={actions.canUndo}
                        canRedo={actions.canRedo}
                    />
                </DataList>
            </Column>
            <Column>
                {selectedLevelId ? (
                    <LevelDetailEditor />
                ) : (
                    <InfoPanel>Select a level to edit</InfoPanel>
                )}
            </Column>
            <CloseButton onClick={toggleEditor}>X</CloseButton>
        </EditorLayout>
    );
};

// --- MAIN EXPORTED COMPONENT ---
export const LevelEditorTool: React.FC<{ toggleEditor: () => void }> = ({
    toggleEditor,
}) => {
    const levelsArray = GameDataManager.getLevels();
    const patternsArray = GameDataManager.getPatterns();

    const handleSave = (levels: LevelDefinition[]) => {
        GameDataManager.save("levels", levels);
    };

    return (
        <LevelsEditorProvider
            initialLevels={levelsArray}
            allPatterns={patternsArray}
        >
            <EditorCore onSave={handleSave} toggleEditor={toggleEditor} />
        </LevelsEditorProvider>
    );
};