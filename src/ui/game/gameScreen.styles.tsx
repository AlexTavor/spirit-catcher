import { css, keyframes } from "@emotion/react";
import styled from "@emotion/styled";

export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const flash = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

export const fadeInAnimation = css`
  animation: ${flash} 2s infinite;
`;

export const Overlay = styled.div<{ isVisible: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    z-index: 10001;
    cursor: pointer;
    opacity: ${(props) => (props.isVisible ? 1 : 0)};
    animation: ${fadeIn} 0.5s ease-in-out;
    pointer-events: ${(props) => (props.isVisible ? "auto" : "none")};
    transition: opacity 0.3s ease-in-out;
`;

export const TitleText = styled.h1<{flash?: boolean}>`
    color: #ff4d4d;
    font-size: 8vw;
    font-family: sans-serif;
    font-weight: bold;
    text-shadow: 3px 3px 10px rgba(0, 0, 0, 0.8);
    margin: 0;
    ${props => props.flash ? fadeInAnimation : 'none'};
`;

export const ScoreText = styled.p`
    color: white;
    font-size: 3em;
    font-family: sans-serif;
    margin-top: 20px;
`;

export const RestartText = styled.p`
    color: #ccc;
    font-size: 2em;
    font-family: sans-serif;
    margin-top: 40px;
    ${fadeInAnimation}
`;