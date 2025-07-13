import React, { useState } from "react";
import styled from "@emotion/styled";
import { ConfigEditorButton } from "./config-editor/ConfigEditorButton";
import { LogButton } from "./log/LogButton";
import { MobsEditorButton } from "./mob-editor/MobsEditorButton";
import { PatternEditorButton } from "./pattern-editor/PatternEditorButton";
import { LevelEditorButton } from "./level-editor/LevelEditorButton";

// --- The Main Tools Container ---

const Container = styled.div`
    position: fixed;
    top: 15px;
    left: 15px;
    z-index: 10002; 
    background-color: #2a2a2e;
    border-radius: 8px;
    border: 1px solid #555;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 15px;
    cursor: pointer;
    background-color: #333;
`;

const Title = styled.h3`
    margin: 0;
    padding: 0 10px;
    color: #e0e0e0;
    font-family: sans-serif;
    font-size: 16px;
    font-weight: bold;
`;

const ToggleIcon = styled.span<{ isExpanded: boolean }>`
    color: #e0e0e0;
    font-size: 14px;
    transition: transform 0.3s ease-in-out;
    transform: ${(props) => (props.isExpanded ? "rotate(90deg)" : "rotate(0deg)")};
`;

const Content = styled.div<{ isExpanded: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: ${(props) => (props.isExpanded ? "10px" : "0 10px")};
    max-height: ${(props) => (props.isExpanded ? "500px" : "0")};
    opacity: ${(props) => (props.isExpanded ? 1 : 0)};
    overflow: hidden;
    transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, padding 0.3s ease-in-out;
`;


export const ToolsContainer: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpansion = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <Container>
            <Header onClick={toggleExpansion}>
                <ToggleIcon isExpanded={isExpanded}>▶</ToggleIcon>
                <Title>🛠️ Tools</Title>
            </Header>
            <Content isExpanded={isExpanded}>
                <ConfigEditorButton />
                <LogButton />
                <MobsEditorButton />
                <PatternEditorButton/>
                <LevelEditorButton/>
            </Content>
        </Container>
    );
};