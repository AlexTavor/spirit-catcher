import React, { useState } from "react";
import { ConfigEditorLine } from "./ConfigEditorLine";
import styled from "@emotion/styled";
import { ConfigManager } from "../../game/api/ConfigManager";

// --- Styled Components  ---
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const EditorPanel = styled.div`
    width: 90%;
    max-width: 600px;
    height: 80%;
    background-color: #282c34;
    border-radius: 8px;
    border: 1px solid #666;
    display: flex;
    flex-direction: column;
    color: white;
`;

const Header = styled.div`
    padding: 16px;
    border-bottom: 1px solid #666;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Title = styled.h2`
    margin: 0;
`;

const Button = styled.button`
    padding: 8px 16px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    margin-left: 10px;

    &.apply {
        background-color: #28a745;
        color: white;
    }

    &.abort {
        background-color: #dc3545;
        color: white;
    }
    
    &.export {
        background-color: #007bff;
        color: white;
        width: 100%;
    }
`;

const Content = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 16px;
`;

const Footer = styled.div`
    padding: 16px;
    border-top: 1px solid #666;
`;

// --- Component Logic ---

// Keys to exclude from the editor
const UNEDITABLE_KEYS = ["GameWidth", "GameHeight", "EntryScene"];

interface ConfigEditorProps {
    onClose: () => void;
}

export const ConfigEditor: React.FC<ConfigEditorProps> = ({ onClose }) => {
    const [config, setConfig] = useState(ConfigManager.get());

    const handleValueChange = (key: string, value: string) => {
        const originalValue = ConfigManager.get()[key as keyof typeof config];
        const newValue = typeof originalValue === 'number' ? parseFloat(value) || 0 : value;

        setConfig(prev => ({ ...prev, [key]: newValue }));
    };

    const handleApply = () => {
        ConfigManager.save(config);
        window.location.reload();
    };

    const handleExport = () => {
        const jsonString = JSON.stringify(config, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = "config.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    };

    return (
        <Overlay>
            <EditorPanel>
                <Header>
                    <Title>Config Editor</Title>
                    <div>
                        <Button className="apply" onClick={handleApply}>APPLY</Button>
                        <Button className="abort" onClick={onClose}>ABORT</Button>
                    </div>
                </Header>
                <Content>
                    {Object.entries(config)
                        .filter(([key]) => !UNEDITABLE_KEYS.includes(key)) // Filter out uneditable keys
                        .map(([key, value]) => (
                            <ConfigEditorLine
                                key={key}
                                propKey={key}
                                propValue={value}
                                onChange={handleValueChange}
                            />
                        ))}
                </Content>
                <Footer>
                    <Button className="export" onClick={handleExport}>EXPORT</Button>
                </Footer>
            </EditorPanel>
        </Overlay>
    );
};