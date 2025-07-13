import React from "react";
import styled from "@emotion/styled";

// --- Styled Components ---

const ListWrapper = styled.div`
    display: flex;
    flex-direction: column;
    background-color: #333;
    border: 1px solid #555;
    border-radius: 8px;
    height: 100%;
    overflow: hidden; /* Ensures children conform to border radius */
`;

const ScrollableList = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 8px;
`;

const DeleteButton = styled.button`
    background-color: #c0392b;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    font-weight: bold;
    cursor: pointer;
    margin-left: auto;
    opacity: 0; /* Hide by default */
    transition: opacity 0.2s ease;
`;

const ItemName = styled.span`
    padding: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const DataListItemContainer = styled.div<{ isSelected: boolean }>`
    display: flex;
    align-items: center;
    padding: 4px;
    padding-left: 12px;
    margin-bottom: 4px;
    border-radius: 4px;
    cursor: pointer;
    background-color: ${(props) => (props.isSelected ? "#4f5b66" : "transparent")};
    color: #f0f0f0;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: ${(props) => (props.isSelected ? "#4f5b66" : "#3e3e42")};

        /* MODIFIED: Target the button by its class name on hover */
        .delete-button {
            opacity: 1;
        }
    }
`;

// --- Component Props and Implementation ---

interface DataListProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    selectedIndex: number;
    onSelectItem: (index: number) => void;
    onDeleteItem: (index: number) => void;
    getKey: (item: T) => string | number;
    children: React.ReactNode;
}

export function DataList<T>({
    items,
    renderItem,
    selectedIndex,
    onSelectItem,
    onDeleteItem,
    getKey,
    children,
}: DataListProps<T>) {
    
    const handleDeleteClick = (
        e: React.MouseEvent<HTMLButtonElement>,
        index: number,
    ) => {
        e.stopPropagation();
        onDeleteItem(index);
    };

    return (
        <ListWrapper>
            <ScrollableList>
                {items.map((item, index) => (
                    <DataListItemContainer
                        key={getKey(item)}
                        isSelected={index === selectedIndex}
                        onClick={() => onSelectItem(index)}
                        title={`Select ${renderItem(item)}`}
                    >
                        <ItemName>{renderItem(item)}</ItemName>
                        <DeleteButton
                            className="delete-button" /* ADDED: Assign a class name */
                            onClick={(e) => handleDeleteClick(e, index)}
                            title={`Delete ${renderItem(item)}`}
                        >
                            X
                        </DeleteButton>
                    </DataListItemContainer>
                ))}
            </ScrollableList>
            
            {children}
        </ListWrapper>
    );
}