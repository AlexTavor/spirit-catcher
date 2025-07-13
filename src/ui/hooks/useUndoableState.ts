import { useState, useCallback } from "react";

// The state structure for our undo-redo history
interface UndoableState<T> {
    past: T[];
    present: T;
    future: T[];
}

// The object returned by the hook
export interface UndoableControls<T> {
    /** The current state. */
    state: T;
    /** Function to update the state and create a new undo point. */
    setState: (newState: T) => void;
    /** Reverts to the previous state in history. */
    undo: () => void;
    /** Re-applies a state that was undone. */
    redo: () => void;
    /** A boolean indicating if there are states to undo. */
    canUndo: boolean;
    /** A boolean indicating if there are states to redo. */
    canRedo: boolean;
    /** A boolean indicating if the state has changed since the last save. */
    isDirty: boolean;
    /** Resets the dirty flag, typically called after saving. */
    markAsClean: () => void;
}

/**
 * A React hook to manage state with undo/redo functionality.
 *
 * @param initialState The initial state value.
 * @returns An object with the current state and action functions.
 */
export function useUndoableState<T>(initialState: T): UndoableControls<T> {
    const [history, setHistory] = useState<UndoableState<T>>({
        past: [],
        present: initialState,
        future: [],
    });

    const [isDirty, setIsDirty] = useState(false);

    const canUndo = history.past.length > 0;
    const canRedo = history.future.length > 0;

    const undo = useCallback(() => {
        if (!canUndo) {
            return;
        }
        setHistory((currentHistory) => {
            const { past, present, future } = currentHistory;
            const previous = past[past.length - 1];
            const newPast = past.slice(0, past.length - 1);
            return {
                past: newPast,
                present: previous,
                future: [present, ...future],
            };
        });
        setIsDirty(true);
    }, [canUndo]);

    const redo = useCallback(() => {
        if (!canRedo) {
            return;
        }
        setHistory((currentHistory) => {
            const { past, present, future } = currentHistory;
            const next = future[0];
            const newFuture = future.slice(1);
            return {
                past: [...past, present],
                present: next,
                future: newFuture,
            };
        });
        setIsDirty(true);
    }, [canRedo]);

    const setState = useCallback((newState: T) => {
        setHistory((currentHistory) => {
            const { past, present } = currentHistory;
            // Don't add to history if the new state is the same as the present state.
            // This is a simple reference check. For deep objects, consider a deep-equality check if needed.
            if (newState === present) {
                return currentHistory;
            }
            return {
                past: [...past, present],
                present: newState,
                future: [], // New actions clear the redo history
            };
        });
        setIsDirty(true);
    }, []);

    const markAsClean = useCallback(() => {
        setIsDirty(false);
    }, []);

    return {
        state: history.present,
        setState,
        undo,
        redo,
        canUndo,
        canRedo,
        isDirty,
        markAsClean,
    };
}
