import React, { useReducer, useEffect, useMemo, createContext, useContext } from "react";
import { LevelDefinition, PatternDefinition } from "../../game/logic/level/types";
import { useUndoableState } from "../hooks/useUndoableState";
import { selectionReducer } from "./LevelEditorTool";

interface ILevelsEditorState {
    levels: LevelDefinition[];
    selectedLevelId?: string;
    selectedWaveIndex?: number;
    canUndo: boolean;
    canRedo: boolean;
    isDirty: boolean;
}

interface ILevelsEditorActions {
    setLevels: (levels: LevelDefinition[]) => void;
    undo: () => void;
    redo: () => void;
    markAsClean: () => void;
    selectLevel: (id?: string) => void;
    selectWave: (index?: number) => void;
    canUndo: boolean;
    canRedo: boolean;
}

// --- CONTEXT CREATION ---
export const StaticDataContext = createContext<PatternDefinition[] | null>(null);
export const LevelsEditorStateContext = createContext<ILevelsEditorState | null>(null);
export const LevelsEditorActionsContext = createContext<ILevelsEditorActions | null>(null);

// Custom hooks for easy context consumption
export const useStaticData = () => useContext(StaticDataContext)!;
export const useLevelsEditorState = () => useContext(LevelsEditorStateContext)!;
export const useLevelsEditorActions = () => useContext(LevelsEditorActionsContext)!;

// --- PROVIDER COMPONENT ---
export const LevelsEditorProvider: React.FC<{
    children: React.ReactNode;
    initialLevels: LevelDefinition[];
    allPatterns: PatternDefinition[];
}> = ({ children, initialLevels, allPatterns }) => {
    const { state: levels, setState: setLevels, ...undoControls } = useUndoableState(initialLevels);
    const [selection, dispatchSelection] = useReducer(selectionReducer, {});

    useEffect(() => {
        setLevels(initialLevels);
        undoControls.markAsClean();
    }, [initialLevels]);

    const actions = useMemo(() => ({
        setLevels,
        ...undoControls,
        selectLevel: (id?: string) => dispatchSelection({ type: "SELECT_LEVEL", payload: id }),
        selectWave: (index?: number) => dispatchSelection({ type: "SELECT_WAVE", payload: index }),
    }), [setLevels, undoControls]);

    const state = {
        levels,
        selectedLevelId: selection.selectedLevelId,
        selectedWaveIndex: selection.selectedWaveIndex,
        canUndo: undoControls.canUndo,
        canRedo: undoControls.canRedo,
        isDirty: undoControls.isDirty,
    };

    return (
        <StaticDataContext.Provider value={allPatterns}>
            <LevelsEditorStateContext.Provider value={state}>
                <LevelsEditorActionsContext.Provider value={actions}>
                    {children}
                </LevelsEditorActionsContext.Provider>
            </LevelsEditorStateContext.Provider>
        </StaticDataContext.Provider>
    );
};
