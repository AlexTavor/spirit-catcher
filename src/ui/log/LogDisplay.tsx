import React, { useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { useAnalyticsLog, LogEntry } from "../hooks/useAnalyticsLog";

// --- Styled Components ---

const LogContainer = styled.div`
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    max-height: 250px;
    overflow-y: auto; // Ensures the container is scrollable
    background-color: rgba(0, 0, 0, 0.6);
    color: #a7f3d0;
    font-family: "Courier New", Courier, monospace;
    font-size: 14px;
    padding: 10px;
    box-sizing: border-box;
    z-index: 999;
    pointer-events: none;
`;

const LogLine = styled.div`
    margin-bottom: 4px;
    line-height: 1.2;
`;

const Timestamp = styled.span`
    color: #6ee7b7;
    margin-right: 12px;
`;

// --- Component Logic ---

interface LogDisplayProps {
    isOpen: boolean;
}

export const LogDisplay: React.FC<LogDisplayProps> = ({ isOpen }) => {
    const logs = useAnalyticsLog();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // When logs update, scroll the container to the bottom
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    if (!isOpen) {
        return null;
    }

    return (
        <LogContainer ref={scrollRef}>
            {logs.map((log: LogEntry, index: number) => (
                <LogLine key={`${log.timestamp.toISOString()}-${index}`}>
                    <Timestamp>{log.timestamp.toLocaleTimeString()}</Timestamp>
                    <span>{log.text}</span>
                </LogLine>
            ))}
        </LogContainer>
    );
};