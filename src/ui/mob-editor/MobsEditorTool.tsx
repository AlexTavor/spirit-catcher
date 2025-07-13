import React, { useState } from "react";
import styled from "@emotion/styled";
import { DataList } from "../tooling/DataList";
import { DataListActionsPanel } from "../tooling/DataListActionsPanel";
import { useGameData } from "../hooks/useGameData";
import { useUndoableState } from "../hooks/useUndoableState";
import { MobDefinition, MobDisplayType } from "../../game/logic/level/types";

// --- Data Structure and Defaults ---

const defaultMobs: MobDefinition[] = [];

// --- Sub-Components ---

const EditorLayout = styled.div`
    position: fixed;
    z-index: 1;
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
`;

const InfoPanel = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #777;
    font-size: 20px;
`;

const FormWrapper = styled.div`
    padding: 20px;
    background-color: #3a3a3e;
    height: 100%;
    color: #e0e0e0;
    overflow-y: auto;
`;

const FormRow = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
    & > label { font-size: 14px; font-weight: bold; margin-bottom: 6px; }
    & > input, & > select { padding: 8px; background-color: #2a2a2e; border: 1px solid #555; border-radius: 4px; color: #e0e0e0; font-size: 16px; }
`;

interface MobEditorFormProps {
    mob: MobDefinition;
    onChange: (field: keyof MobDefinition, value: any) => void;
}

const MobEditorForm: React.FC<MobEditorFormProps> = ({ mob, onChange }) => (
    <FormWrapper>
        <h2>Edit Mob: {mob.name}</h2>
        <FormRow>
            <label>Name</label>
            <input type="text" value={mob.name} onChange={(e) => onChange("name", e.target.value)} />
        </FormRow>
        <FormRow>
            <label>HP Min</label>
            <input type="number" value={mob.minHp} onChange={(e) => onChange("minHp", parseInt(e.target.value) || 0)} />
        </FormRow>
        <FormRow>
            <label>HP Max</label>
            <input type="number" value={mob.maxHp} onChange={(e) => onChange("maxHp", parseInt(e.target.value) || 0)} />
        </FormRow>
        <FormRow>
            <label>Lift Resistance (0 to 1)</label>
            <input type="number" step="0.1" min="0" max="1" value={mob.liftResistance} onChange={(e) => onChange("liftResistance", parseFloat(e.target.value) || 0)} />
        </FormRow>
        <FormRow>
            <label>Display Type</label>
            <select value={mob.displayType} onChange={(e) => onChange("displayType", e.target.value as MobDisplayType)}>
                {
                    Object.values(MobDisplayType).map((type) => (
                        <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                    ))
                }
            </select>
        </FormRow>
    </FormWrapper>
);

// --- Core Editor Component (receives loaded data) ---

interface EditorCoreProps {
    initialData: MobDefinition[];
    onDownload: (data: MobDefinition[]) => void;
    toggleEditor: () => void;
}

const EditorCore: React.FC<EditorCoreProps> = ({ initialData, onDownload, toggleEditor }) => {
    const { state: mobs, setState: setMobs, undo, redo, canUndo, canRedo, isDirty, markAsClean } = useUndoableState(initialData);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    const selectedMob = selectedIndex !== -1 ? mobs[selectedIndex] : null;

    const handleSave = () => {
        onDownload(mobs);
        markAsClean();
    };

    const handleAddItem = () => {
        const newMob: MobDefinition = { id: `mob_${Date.now()}`, name: "New Mob", minHp: 50, maxHp: 50, liftResistance: 0, displayType: MobDisplayType.Standard };
        const newMobs = [...mobs, newMob];
        setMobs(newMobs);
        setSelectedIndex(newMobs.length - 1);
    };

    const handleDeleteItem = (index: number) => {
        const newMobs = mobs.filter((_, i) => i !== index);
        setSelectedIndex(-1);
        setMobs(newMobs);
    };

    const handleMobChange = (field: keyof MobDefinition, value: any) => {
        if (!selectedMob) return;
        const updatedMob = { ...selectedMob, [field]: value };
        const newMobs = mobs.map((mob, index) => index === selectedIndex ? updatedMob : mob);
        setMobs(newMobs);
    };

    return (
        <EditorLayout>
            <LeftPanel>
                <Toolbar>
                    <SaveButton onClick={handleSave} disabled={!isDirty} title={isDirty ? "Save changes" : "No changes to save"}>
                        Save & Download
                    </SaveButton>
                </Toolbar>
                <DataList<MobDefinition>
                    items={mobs}
                    selectedIndex={selectedIndex}
                    onSelectItem={setSelectedIndex}
                    onDeleteItem={handleDeleteItem}
                    renderItem={(mob) => mob.name}
                    getKey={(mob) => mob.id}
                >
                    <DataListActionsPanel onAdd={handleAddItem} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />
                </DataList>
            </LeftPanel>

            {selectedMob ? (
                <MobEditorForm mob={selectedMob} onChange={handleMobChange} />
            ) : (
                <InfoPanel>Select a mob to edit</InfoPanel>
            )}

            <CloseButton onClick={toggleEditor} title="Close Editor">X</CloseButton>
        </EditorLayout>
    );
};


// --- Top-Level Loader Component ---

export const MobsEditorTool: React.FC<{toggleEditor:()=>void}> = ({toggleEditor}) => {
    const { data: mobData, loading, download } = useGameData<MobDefinition[]>("mobs", defaultMobs);

    if (loading) {
        return <InfoPanel>Loading Mob Data...</InfoPanel>;
    }

    if (!mobData) {
        return <InfoPanel>Error: Could not load mob data.</InfoPanel>;
    }

    return <EditorCore initialData={mobData} onDownload={download} toggleEditor={toggleEditor}/>;
};