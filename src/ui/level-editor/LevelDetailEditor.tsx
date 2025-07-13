import React from "react";
import styled from "@emotion/styled";
import { WavesEditor } from "./WavesEditor";
import { useLevelsEditorState, useLevelsEditorActions, useStaticData } from "./LevelsEditorProvider";
import { LevelDefinition, WaveDefinition } from "../../game/logic/level/types";

// --- Styled Components ---

const DetailLayout = styled.div`
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
    overflow: hidden;
    background-color: #2a2a2e;
`;

const FormContainer = styled.div`
    padding: 16px;
    background-color: #333;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    border-bottom: 2px solid #111;
`;

const FormField = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    & > label {
        font-size: 14px;
        font-weight: bold;
        color: #ccc;
    }
    & > input {
        padding: 8px;
        background-color: #222;
        border: 1px solid #555;
        border-radius: 4px;
        color: #e0e0e0;
        font-size: 16px;
    }
`;

// --- Main Component ---

export const LevelDetailEditor: React.FC = () => {
    const { levels, selectedLevelId } = useLevelsEditorState();
    const { setLevels } = useLevelsEditorActions();
    const allPatterns = useStaticData();

    const level = React.useMemo(
        () => levels.find((l) => l.id === selectedLevelId),
        [levels, selectedLevelId],
    );

    if (!level) {
        return null; // Should be handled by parent, but as a safeguard
    }

    const handleLevelChange = (updatedLevel: LevelDefinition) => {
        setLevels(
            levels.map((l:LevelDefinition) => (l.id === updatedLevel.id ? updatedLevel : l)),
        );
    };

    const handleFieldChange = (
        field: keyof LevelDefinition,
        value: any,
    ) => {
        handleLevelChange({ ...level, [field]: value });
    };

    const handleWavesChange = (newWaves: WaveDefinition[]) => {
        handleLevelChange({ ...level, waves: newWaves });
    };

    return (
        <DetailLayout>
            <FormContainer>
                <FormField>
                    <label>Level Name</label>
                    <input
                        value={level.name}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                    />
                </FormField>
                <FormField>
                    <label>Start HP Multiplier</label>
                    <input
                        type="number"
                        step="0.1"
                        value={level.startHpMultiplier}
                        onChange={(e) =>
                            handleFieldChange(
                                "startHpMultiplier",
                                parseFloat(e.target.value) || 1,
                            )
                        }
                    />
                </FormField>
                <FormField>
                    <label>End HP Multiplier</label>
                    <input
                        type="number"
                        step="0.1"
                        value={level.endHpMultiplier}
                        onChange={(e) =>
                            handleFieldChange(
                                "endHpMultiplier",
                                parseFloat(e.target.value) || 1,
                            )
                        }
                    />
                </FormField>
                <FormField>
                    <label>Start Speed</label>
                    <input
                        type="number"
                        value={level.startSpeed}
                        onChange={(e) =>
                            handleFieldChange(
                                "startSpeed",
                                parseInt(e.target.value) || 50,
                            )
                        }
                    />
                </FormField>
                <FormField>
                    <label>End Speed</label>
                    <input
                        type="number"
                        value={level.endSpeed}
                        onChange={(e) =>
                            handleFieldChange(
                                "endSpeed",
                                parseInt(e.target.value) || 50,
                            )
                        }
                    />
                </FormField>
            </FormContainer>

            <WavesEditor
                waves={level.waves}
                allPatterns={allPatterns}
                onWavesChange={handleWavesChange}
            />
        </DetailLayout>
    );
};