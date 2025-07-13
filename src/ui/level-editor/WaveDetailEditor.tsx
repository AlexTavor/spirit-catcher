import styled from "@emotion/styled";
import { PatternDefinition, WaveDefinition } from "../../game/logic/level/types";

// --- Styled Components ---

const DetailEditorPanel = styled.div`
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 16px;
    height: 100%;
    background-color: #333;
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

const CompositionWrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;
    border-radius: 8px;
    background-color: #2a2a2e;
    overflow: hidden;
`;

const CompositionHeader = styled.h4`
    margin: 0;
    padding: 10px 12px;
    font-size: 14px;
    background-color: #222;
    border-bottom: 1px solid #111;
`;

const CompositionInnerLayout = styled.div`
    display: flex;
    gap: 8px;
    padding: 8px;
    flex-grow: 1;
    min-height: 0;
`;

const CompositionColumn = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
`;

const CompositionList = styled.div`
    flex-grow: 1;
    padding: 8px;
    overflow-y: auto;
    background-color: #222;
    border-radius: 5px;
`;

const CompositionItem = styled.div`
    padding: 8px;
    background-color: #404044;
    border-radius: 5px;
    margin-bottom: 6px;
    cursor: pointer;
    user-select: none;
    font-size: 14px;
    &:hover {
        background-color: #555;
    }
`;

// --- Pattern Composition Sub-Component ---

function PatternCompositionEditor({
    palette,
    composition,
    onCompositionChange,
}: {
    palette: PatternDefinition[];
    composition: string[];
    onCompositionChange: (newComposition: string[]) => void;
}) {
    const handleAdd = (patternId: string) => {
        onCompositionChange([...composition, patternId]);
    };
    const handleRemove = (index: number) => {
        onCompositionChange(composition.filter((_, i) => i !== index));
    };

    return (
        <CompositionWrapper>
            <CompositionHeader>Wave Patterns</CompositionHeader>
            <CompositionInnerLayout>
                <CompositionColumn>
                    <CompositionHeader>Available Patterns</CompositionHeader>
                    <CompositionList>
                        {palette.map((p) => (
                            <CompositionItem
                                key={p.id}
                                onClick={() => handleAdd(p.id)}
                            >
                                {p.id}
                            </CompositionItem>
                        ))}
                    </CompositionList>
                </CompositionColumn>
                <CompositionColumn>
                    <CompositionHeader>Patterns in this Wave</CompositionHeader>
                    <CompositionList>
                        {composition.map((pId, index) => (
                            <CompositionItem
                                key={`${pId}-${index}`}
                                onClick={() => handleRemove(index)}
                            >
                                {pId}
                            </CompositionItem>
                        ))}
                    </CompositionList>
                </CompositionColumn>
            </CompositionInnerLayout>
        </CompositionWrapper>
    );
}

// --- Main Wave Detail Editor ---

export function WaveDetailEditor({
    wave,
    allPatterns,
    onWaveChange,
}: {
    wave: WaveDefinition;
    allPatterns: PatternDefinition[];
    onWaveChange: (newWave: WaveDefinition) => void;
}) {
    const handleNameChange = (newName: string) => {
        onWaveChange({ ...wave, name: newName });
    };

    const handlePatternsChange = (newPatternIds: string[]) => {
        onWaveChange({ ...wave, patternIds: newPatternIds });
    };

    return (
        <DetailEditorPanel>
            <FormField>
                <label>Wave Name</label>
                <input
                    type="text"
                    value={wave.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                />
            </FormField>
            <PatternCompositionEditor
                palette={allPatterns}
                composition={wave.patternIds}
                onCompositionChange={handlePatternsChange}
            />
        </DetailEditorPanel>
    );
}