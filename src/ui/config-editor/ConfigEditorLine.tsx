import styled from "@emotion/styled";
import React from "react";

const LineWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 4px;
    border-bottom: 1px solid #444;
`;

const Label = styled.label`
    font-family: monospace;
    font-size: 16px;
    color: #eee;
`;

const Input = styled.input`
    width: 150px;
    padding: 6px;
    background-color: #111;
    border: 1px solid #555;
    border-radius: 4px;
    color: #fff;
    font-size: 16px;
    text-align: right;
`;

interface ConfigEditorLineProps {
    propKey: string;
    propValue: string | number;
    onChange: (key: string, value: string) => void;
}

export const ConfigEditorLine: React.FC<ConfigEditorLineProps> = ({
    propKey,
    propValue,
    onChange,
}) => {
    return (
        <LineWrapper>
            <Label>{propKey}</Label>
            <Input
                type="text"
                value={propValue}
                onChange={(e) => onChange(propKey, e.target.value)}
            />
        </LineWrapper>
    );
};