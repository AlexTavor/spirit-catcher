import React, { useState } from "react";
import styled from "@emotion/styled";

const EditorWrapper = styled.div`
    display: flex;
    gap: 16px;
    height: 100%;
    width: 100%;
    background-color: #3a3a3e;
    padding: 16px;
    color: #e0e0e0;
    font-family: sans-serif;
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    background-color: #2a2a2e;
    border-radius: 8px;
    border: 1px solid #222;
    overflow: hidden;
`;

const Header = styled.h2`
    margin: 0;
    padding: 12px 16px;
    font-size: 18px;
    background-color: #333;
    border-bottom: 1px solid #222;
`;

const List = styled.div`
    flex-grow: 1;
    padding: 8px;
    overflow-y: auto;
`;

const Item = styled.div<{ isSelected?: boolean }>`
    padding: 10px 12px;
    background-color: ${(props) => (props.isSelected ? "#4f5b66" : "#404044")};
    border-radius: 5px;
    margin-bottom: 6px;
    cursor: pointer;
    user-select: none;
    border: 1px solid ${(props) => (props.isSelected ? "#777" : "#333")};
    transition: background-color 0.2s ease, border-color 0.2s ease;

    &:hover {
        background-color: #555;
    }
`;

const ButtonPanel = styled.div`
    display: flex;
    gap: 8px;
    padding: 8px;
    border-top: 1px solid #222;
    background-color: #333;
`;

const ActionButton = styled.button`
    flex-grow: 1;
    padding: 10px;
    font-size: 14px;
    font-weight: bold;
    color: #e0e0e0;
    background-color: #4f5b66;
    border: 1px solid #666;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover:not(:disabled) {
        background-color: #6a737b;
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

// --- Component Definition ---

// Using the original, more flexible props interface
export interface CompositionEditorProps<TItem, TPaletteItem> {
    paletteItems: TPaletteItem[];
    compositionItems: TItem[];
    onCompositionChange: (newComposition: TItem[]) => void;
    renderPaletteItem: (item: TPaletteItem) => React.ReactNode;
    renderCompositionItem: (item: TItem) => React.ReactNode;
    paletteItemToCompositionItem: (paletteItem: TPaletteItem) => TItem;
    idAccessor: (item: TItem | TPaletteItem) => string;
}

export function CompositionEditor<TItem, TPaletteItem>({
    paletteItems,
    compositionItems,
    onCompositionChange,
    renderPaletteItem,
    renderCompositionItem,
    paletteItemToCompositionItem,
    idAccessor,
}: CompositionEditorProps<TItem, TPaletteItem>) {
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    const handlePaletteItemClick = (item: TPaletteItem) => {
        const newItem = paletteItemToCompositionItem(item);
        onCompositionChange([...compositionItems, newItem]);
    };

    const handleWaveItemClick = (index: number) => {
        setSelectedIndex(index);
    };

    const handleMoveUp = () => {
        if (selectedIndex > 0) {
            const newItems = [...compositionItems];
            [newItems[selectedIndex - 1], newItems[selectedIndex]] = [
                newItems[selectedIndex],
                newItems[selectedIndex - 1],
            ];
            onCompositionChange(newItems);
            setSelectedIndex(selectedIndex - 1);
        }
    };

    const handleMoveDown = () => {
        if (selectedIndex !== -1 && selectedIndex < compositionItems.length - 1) {
            const newItems = [...compositionItems];
            [newItems[selectedIndex + 1], newItems[selectedIndex]] = [
                newItems[selectedIndex],
                newItems[selectedIndex + 1],
            ];
            onCompositionChange(newItems);
            setSelectedIndex(selectedIndex + 1);
        }
    };

    const handleDelete = () => {
        if (selectedIndex !== -1) {
            const newItems = compositionItems.filter(
                (_, index) => index !== selectedIndex,
            );
            onCompositionChange(newItems);
            setSelectedIndex(-1);
        }
    };

    const canDelete = selectedIndex !== -1;
    const canMoveUp = selectedIndex > 0;
    const canMoveDown =
        selectedIndex !== -1 && selectedIndex < compositionItems.length - 1;

    return (
        <EditorWrapper>
            <Column>
                <Header>Palette</Header>
                <List>
                    {paletteItems.map((item) => (
                        <Item
                            key={idAccessor(item)}
                            onClick={() => handlePaletteItemClick(item)}
                        >
                            {renderPaletteItem(item)}
                        </Item>
                    ))}
                </List>
            </Column>

            <Column>
                <Header>Wave</Header>
                <List>
                    {compositionItems.map((item, index) => (
                        <Item
                            key={`${idAccessor(item)}-${index}`}
                            isSelected={index === selectedIndex}
                            onClick={() => handleWaveItemClick(index)}
                        >
                            {renderCompositionItem(item)}
                        </Item>
                    ))}
                </List>
                <ButtonPanel>
                    <ActionButton onClick={handleMoveUp} disabled={!canMoveUp}>
                        Up
                    </ActionButton>
                    <ActionButton onClick={handleMoveDown} disabled={!canMoveDown}>
                        Down
                    </ActionButton>
                    <ActionButton onClick={handleDelete} disabled={!canDelete}>
                        Delete
                    </ActionButton>
                </ButtonPanel>
            </Column>
        </EditorWrapper>
    );
}