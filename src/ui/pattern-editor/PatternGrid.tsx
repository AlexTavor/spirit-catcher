import React, {
    useState,
    useLayoutEffect,
    useRef,
} from "react";
import styled from "@emotion/styled";
import {
    MobDefinition,
    PatternDefinition,
} from "../../game/logic/level/types";
import { ConfigManager } from "../../game/api/ConfigManager";
import { PatternSlot } from "./PatternSlot";

const PatternEditorWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: #3a3a3e;
`;

// --- Name Editor Components ---
const NameEditorWrapper = styled.div`
    padding: 15px 20px;
    background-color: #2a2a2e;
    border-bottom: 1px solid #444;
    display: flex;
    flex-direction: column;
    gap: 5px;
`;

const NameLabel = styled.label`
    font-size: 14px;
    font-weight: bold;
    color: #ccc;
`;

const NameInput = styled.input`
    padding: 8px;
    background-color: #222;
    border: 1px solid #555;
    border-radius: 4px;
    color: #e0e0e0;
    font-size: 16px;
    width: 100%;
`;


// --- Grid Components ---
const GridWrapper = styled.div`
    flex-grow: 1;
    overflow: hidden;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const GridContainer = styled.div<{
    scale: number;
}>`
    display: grid;
    gap: 2px;
    transform-origin: center center;
    transform: scale(${(props) => props.scale});
    /* Grid columns and rows are now inline styles */
`;

// --- Row Control Components ---
const RowControls = styled.div`
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    padding: 10px;
    gap: 10px;
    background-color: #2a2a2e;
    border-top: 1px solid #444;
`;

const ControlButton = styled.button`
    background-color: #555;
    color: white;
    border: 1px solid #777;
    border-radius: 4px;
    padding: 5px 15px;
    cursor: pointer;
    &:hover {
        background-color: #666;
    }
`;

interface PatternGridProps {
    pattern: PatternDefinition;
    mobDefs: MobDefinition[];
    onPatternChange: (field: keyof PatternDefinition, value: any) => void;
}

export const PatternGrid: React.FC<PatternGridProps> = ({
    pattern,
    mobDefs,
    onPatternChange,
}) => {
    const config = ConfigManager.get();
    const cols = Math.floor(config.GameWidth / config.MobWidth);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useLayoutEffect(() => {
        const calculateAndSetScale = () => {
            if (!wrapperRef.current) return;
            
            const gap = 2;
            const numRows = pattern.pattern.length;
            if (numRows === 0) return;

            const contentWidth = cols * (config.MobWidth + gap);
            const contentHeight = numRows * (config.MobHeight + gap);

            const availableWidth = wrapperRef.current.clientWidth;
            const availableHeight = wrapperRef.current.clientHeight;
            
            const scaleX = availableWidth / contentWidth;
            const scaleY = availableHeight / contentHeight;

            const newScale = Math.min(1, scaleX, scaleY);
            setScale(newScale);
        };
        
        calculateAndSetScale(); // Initial calculation
        
        window.addEventListener("resize", calculateAndSetScale);
        return () => window.removeEventListener("resize", calculateAndSetScale);

    }, [pattern, cols, config.MobWidth, config.MobHeight]);


    const handleSlotClick = (rowIndex: number, colIndex: number) => {
        const mobCycleOrder = ["", ...mobDefs.map((m) => m.id)];
        const currentMobId = pattern.pattern[rowIndex]?.[colIndex] ?? "";
        const currentIndex = mobCycleOrder.indexOf(currentMobId);
        const nextIndex = (currentIndex + 1) % mobCycleOrder.length;
        const newMobId = mobCycleOrder[nextIndex];

        const newGrid = pattern.pattern.map((row, rIdx) => {
            if (rIdx === rowIndex) {
                const newRow = [...row];
                newRow[colIndex] = newMobId;
                return newRow;
            }
            return row;
        });
        onPatternChange("pattern", newGrid);
    };

    const addRow = () => {
        const newRow = Array(cols).fill("");
        onPatternChange("pattern", [...pattern.pattern, newRow]);
    };

    const removeRow = () => {
        if (pattern.pattern.length > 1) {
            onPatternChange("pattern", pattern.pattern.slice(0, -1));
        }
    };

    return (
        <PatternEditorWrapper>
            <NameEditorWrapper>
                <NameLabel>Pattern Name (ID)</NameLabel>
                <NameInput
                    type="text"
                    value={pattern.id}
                    onChange={(e) => onPatternChange("id", e.target.value)}
                />
            </NameEditorWrapper>
            <GridWrapper ref={wrapperRef}>
                <GridContainer
                    scale={scale}
                    style={{
                        gridTemplateColumns: `repeat(${cols}, ${config.MobWidth}px)`,
                        gridAutoRows: `${config.MobHeight}px`,
                    }}
                >
                    {pattern.pattern.map((row, rowIndex) =>
                        Array.from({ length: cols }).map((_, colIndex) => (
                            <PatternSlot
                                key={`${rowIndex}-${colIndex}`}
                                mobId={row[colIndex] ?? ""}
                                mobDefs={mobDefs}
                                onSlotClick={() =>
                                    handleSlotClick(rowIndex, colIndex)
                                }
                            />
                        )),
                    )}
                </GridContainer>
            </GridWrapper>
            <RowControls>
                <ControlButton onClick={addRow}>+ Add Row</ControlButton>
                <ControlButton onClick={removeRow}>- Remove Row</ControlButton>
            </RowControls>
        </PatternEditorWrapper>
    );
};