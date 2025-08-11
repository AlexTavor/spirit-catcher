import styled from "@emotion/styled";
import { keyframes, css } from "@emotion/react";
import * as animations from "./UpgradesView.animations";

// --- Keyframes for View Transitions ---
const viewFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const viewFadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

// --- Keyframes for Card Transitions ---
const cardSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const cardSelect = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.15);
  }
  100% {
    transform: translate(-50%, -50%) scale(1.1);
  }
`;

const whiteFlash = keyframes`
  0%, 100% { box-shadow: 0 0 15px rgba(255, 255, 255, 0); }
  50% { box-shadow: 0 0 30px 20px rgba(255, 255, 255, 0.9); }
`;

const fadeOutAndShrink = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
`;

// --- Styled Components ---

type ViewState = "entering" | "visible" | "exiting" | "hidden";

export const Overlay = styled.div<{ viewState: ViewState, isSelected: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
    opacity: 0;
    pointer-events: none;

    ${({ viewState }) =>
        (viewState === "entering" || viewState === "visible") &&
        css`
            opacity: 1;
        `}

    ${({ viewState }) =>
        viewState === "entering" &&
        css`
            animation: ${viewFadeIn} ${animations.VIEW_FADE_IN_DURATION}ms ease-out forwards;
        `}
  
    ${({ viewState, isSelected }) =>
        viewState === "visible" && !isSelected &&
        css`
            pointer-events: auto;
        `}

    ${({ viewState }) =>
        viewState === "exiting" &&
        css`
            animation: ${viewFadeOut} ${animations.VIEW_FADE_OUT_DURATION}ms ease-in forwards;
        `}
`;

export const UpgradesContainer = styled.div`
    display: flex;
    gap: 20px;
    justify-content: center;
    align-items: center;
    width: calc(100% - 40px);
    padding: 20px;
`;

type SelectionState = "selected" | "faded" | "none";

export const UpgradeCard = styled.div<{
    index: number;
    viewState: ViewState;
    selectionState: SelectionState;
}>`
    width: 200px;
    height: 250px;
    background: linear-gradient(145deg, #2c3e50, #34495e);
    border: 2px solid #7f8c8d;
    border-radius: 15px;
    padding: 20px;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    cursor: pointer;
    transition: transform 0.3s, border-color 0.3s;
    opacity: 0;
    transform-origin: center center;

    ${({ viewState, index }) =>
        viewState === "entering" &&
        css`
            animation: ${cardSlideIn} ${animations.CARD_SLIDE_IN_DURATION}ms ease-out forwards;
            animation-delay: ${index * animations.CARD_SLIDE_IN_DELAY_INCREMENT}ms;
        `}
    
    ${({ viewState }) =>
        (viewState === "visible" || viewState === "exiting") &&
        css`
            opacity: 1;
        `}

    &:hover {
        transform: translateY(-10px);
        border-color: #ecf0f1;
    }

    ${({ selectionState }) =>
        selectionState === "faded" &&
        css`
            animation: ${fadeOutAndShrink} ${animations.CARD_FADE_OUT_DURATION}ms ease-out forwards;
        `}

    ${({ selectionState }) =>
        selectionState === "selected" &&
        css`
            animation: 
                ${cardSelect} ${animations.CARD_SELECTION_DURATION}ms forwards, 
                ${whiteFlash} ${animations.CARD_WHITE_FLASH_DURATION}ms ${animations.CARD_WHITE_FLASH_DELAY}ms forwards;
            z-index: 10;
            opacity: 1;
            position: absolute;
            left: 50%;
            top: 50%;
        `}
`;

export const UpgradeTitle = styled.h2`
    font-size: 1.5em;
    margin-bottom: 15px;
    color: #f1c40f;
`;

export const UpgradeDescription = styled.p`
    font-size: 1em;
    color: #ecf0f1;
`;