import React, { useState } from "react";
import styled from "@emotion/styled";
import { useGameData } from "../hooks/useGameData";
import { useUndoableState } from "../hooks/useUndoableState";
import {
    MobDefinition,
    PatternDefinition,
} from "../../game/logic/level/types";
import { PatternGrid } from "./PatternGrid";
import { DataList } from "../tooling/DataList";
import { DataListActionsPanel } from "../tooling/DataListActionsPanel";

// --- Data Structure and Defaults ---

const defaultPatterns: PatternDefinition[] = [];
const defaultMobs: MobDefinition[] = [];

// --- Styled Components ---

const EditorLayout = styled.div`
    position: fixed;
    z-index: 10003; /* Higher than tools container */
    top: 0;
    left: 0;
    display: grid;
    grid-template-columns: 350px 1fr;
    height: 100vh;
    width: 100vw;
    background-color: #222;
`;

const LeftPanel = styled.div`
    display: flex;
    flex-direction: column;
    border-right: 2px solid #111;
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
    margin-left: auto;
    z-index: 10004; /* On top of the editor */
`;

const InfoPanel = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #777;
    font-size: 20px;
`;

// --- Core Editor Component ---

interface EditorCoreProps {
    initialPatterns: PatternDefinition[];
    mobDefs: MobDefinition[];
    onDownload: (data: PatternDefinition[]) => void;
    toggleEditor: () => void;
}

const EditorCore: React.FC<EditorCoreProps> = ({
    initialPatterns,
    mobDefs,
    onDownload,
    toggleEditor,
}) => {
    const {
        state: patterns,
        setState: setPatterns,
        undo,
        redo,
        canUndo,
        canRedo,
        isDirty,
        markAsClean,
    } = useUndoableState(initialPatterns);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    const selectedPattern = selectedIndex !== -1 ? patterns[selectedIndex] : null;

    const handleSave = () => {
        onDownload(patterns);
        markAsClean();
    };

    const handleAddItem = () => {
        const newPattern: PatternDefinition = {
            id: `pattern_${Date.now()}`,
            pattern: [["","","","","","","","", ""]],
        };
        const newPatterns = [...patterns, newPattern];
        setPatterns(newPatterns);
        setSelectedIndex(newPatterns.length - 1);
    };

    const handleDeleteItem = (index: number) => {
        const newPatterns = patterns.filter((_, i) => i !== index);
        // Adjust selection after deletion
        if (index === selectedIndex) {
            setSelectedIndex(-1);
        } else if (index < selectedIndex) {
            setSelectedIndex(selectedIndex - 1);
        }
        setPatterns(newPatterns);
    };

    const handlePatternChange = (
        field: keyof PatternDefinition,
        value: any,
    ) => {
        if (!selectedPattern) return;

        const updatedPattern = { ...selectedPattern, [field]: value };
        const newPatterns = patterns.map((p, index) =>
            index === selectedIndex ? updatedPattern : p,
        );
        setPatterns(newPatterns);
    };

    return (
        <EditorLayout>
            <LeftPanel>
                <Toolbar>
                    <SaveButton
                        onClick={handleSave}
                        disabled={!isDirty}
                        title={
                            isDirty ? "Save changes" : "No changes to save"
                        }
                    >
                        Save & Download
                    </SaveButton>
                </Toolbar>
                <DataList<PatternDefinition>
                    items={patterns}
                    selectedIndex={selectedIndex}
                    onSelectItem={setSelectedIndex}
                    onDeleteItem={handleDeleteItem}
                    renderItem={(pattern:PatternDefinition) => pattern.id}
                    getKey={(pattern:PatternDefinition) => pattern.id}
                >
                    <DataListActionsPanel
                        onAdd={handleAddItem}
                        onUndo={undo}
                        onRedo={redo}
                        canUndo={canUndo}
                        canRedo={canRedo}
                    />
                </DataList>
            </LeftPanel>

            {selectedPattern ? (
                <PatternGrid
                    pattern={selectedPattern}
                    mobDefs={mobDefs}
                    onPatternChange={handlePatternChange}
                />
            ) : (
                <InfoPanel>Select a pattern to edit</InfoPanel>
            )}

            <CloseButton onClick={toggleEditor} title="Close Editor">
                X
            </CloseButton>
        </EditorLayout>
    );
};

// --- Top-Level Loader Component ---

export const PatternEditorTool: React.FC<{ toggleEditor: () => void }> = ({
    toggleEditor,
}) => {
    const {
        data: patternData,
        loading: patternsLoading,
        download: downloadPatterns,
    } = useGameData<PatternDefinition[]>("patterns", defaultPatterns);
    const { data: mobData, loading: mobsLoading } = useGameData<MobDefinition[]>(
        "mobs",
        defaultMobs,
    );

    if (patternsLoading || mobsLoading) {
        return <InfoPanel>Loading Pattern/Mob Data...</InfoPanel>;
    }

    if (!patternData || !mobData) {
        return <InfoPanel>Error: Could not load game data.</InfoPanel>;
    }

    return (
        <EditorCore
            initialPatterns={patternData}
            mobDefs={mobData}
            onDownload={downloadPatterns}
            toggleEditor={toggleEditor}
        />
    );
};