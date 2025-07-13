// src/ui/tooling/pattern-editor/PatternSlot.tsx

import React from "react";
import styled from "@emotion/styled";
import {
    MobDefinition,
    MobDisplayType,
} from "../../game/logic/level/types";

const getSlotColor = (
    mobId: string,
    mobDefs: MobDefinition[],
): string => {
    if (!mobId) return "#4a4a4e"; // Empty slot

    const mobDef = mobDefs.find((m) => m.id === mobId);
    if (!mobDef) return "#ff0000"; // Error color for missing def

    switch (mobDef.displayType) {
        case MobDisplayType.Standard:
            return "#8e5a9a"; // purple
        case MobDisplayType.Strong:
            return "#4a012d"; // dark red
        case MobDisplayType.Resistant:
            return "#5b9bd5"; // blue
        default:
            return "#777";
    }
};

const SlotContainer = styled.div<{ color: string }>`
    width: 100%;
    height: 100%;
    background-color: ${(props) => props.color};
    border: 1px solid #222;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    &:hover {
        filter: brightness(1.2);
    }
`;

interface PatternSlotProps {
    mobId: string;
    mobDefs: MobDefinition[];
    onSlotClick: () => void;
}

export const PatternSlot: React.FC<PatternSlotProps> = ({
    mobId,
    mobDefs,
    onSlotClick,
}) => {
    const color = getSlotColor(mobId, mobDefs);
    const mobDef = mobDefs.find((m) => m.id === mobId);
    return (
        <SlotContainer color={color} onClick={onSlotClick} title={mobDef?.name ?? "Empty"}>
            {mobDef?.name ?? ""}
        </SlotContainer>
    );
};