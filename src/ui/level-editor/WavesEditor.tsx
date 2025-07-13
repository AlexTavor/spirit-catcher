import React, { useState } from "react";
import styled from "@emotion/styled";
import { DataList } from "../tooling/DataList";
import { DataListActionsPanel } from "../tooling/DataListActionsPanel";
import { PatternDefinition, WaveDefinition } from "../../game/logic/level/types";
import { WaveDetailEditor } from "./WaveDetailEditor";

// --- Styled Components ---

const EditorLayout = styled.div`
    display: grid;
    grid-template-columns: 350px 1fr;
    height: 100%;
    overflow: hidden;
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    border-right: 2px solid #222;
    overflow: hidden;
    background-color: #333;
`;

const InfoPanel = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #777;
    font-size: 18px;
`;

// --- Main Component ---

export const WavesEditor: React.FC<{
    waves: WaveDefinition[];
    allPatterns: PatternDefinition[];
    onWavesChange: (newWaves: WaveDefinition[]) => void;
}> = ({ waves, allPatterns, onWavesChange }) => {
    const [selectedId, setSelectedId] = useState<string | undefined>();

    const handleAddWave = () => {
        const newWave: WaveDefinition = {
            id: `wave_${Date.now()}`,
            name: "New Wave",
            patternIds: [],
        };
        onWavesChange([...waves, newWave]);
        // Automatically select the newly created wave
        setSelectedId(newWave.id);
    };

    const handleDeleteWave = (index: number) => {
        const waveIdToDelete = waves[index]?.id;
        onWavesChange(waves.filter((_, i) => i !== index));

        // If the deleted wave was selected, clear the selection
        if (selectedId === waveIdToDelete) {
            setSelectedId(undefined);
        }
    };

    const handleWaveChange = (updatedWave: WaveDefinition) => {
        onWavesChange(
            waves.map((w) => (w.id === updatedWave.id ? updatedWave : w)),
        );
    };

    const selectedWave = waves.find((w) => w.id === selectedId);
    const selectedIndex = selectedWave ? waves.indexOf(selectedWave) : -1;

    const actionsPanel = (
        <DataListActionsPanel
            onAdd={handleAddWave}
            canUndo={false}
            canRedo={false}
        />
    );

    return (
        <EditorLayout>
            <Column>
                <DataList<WaveDefinition>
                    items={waves}
                    selectedIndex={selectedIndex}
                    onSelectItem={(index) => setSelectedId(waves[index]?.id)}
                    onDeleteItem={handleDeleteWave}
                    renderItem={(wave) => wave.name}
                    getKey={(wave) => wave.id}
                >
                    {actionsPanel}
                </DataList>
            </Column>
            <Column>
                {selectedWave ? (
                    <WaveDetailEditor
                        key={selectedWave.id}
                        wave={selectedWave}
                        allPatterns={allPatterns}
                        onWaveChange={handleWaveChange}
                    />
                ) : (
                    <InfoPanel>Select a wave to edit its patterns</InfoPanel>
                )}
            </Column>
        </EditorLayout>
    );
};