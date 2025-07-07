import React from "react";
import styled from "@emotion/styled";

declare const __APP_VERSION__: string;

const Container = styled.div`
    position: fixed;
    top: 10px;
    right: 10px;
    font-size: 12px;
    color: #aaa;
    background-color: rgba(0, 0, 0, 0.4);
    padding: 2px 6px;
    border-radius: 4px;
    z-index: 9999;
    pointer-events: none;
    font-family: monospace;
`;

export const VersionDisplay: React.FC = () => {
    const version =
        typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";

    return <Container>v0.{version}</Container>;
};
