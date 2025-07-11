import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

const fadeIn = keyframes`
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

const fadeOut = keyframes`
  from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
`;

const MessageContainer = styled.div<{ isVisible: boolean }>`
    position: fixed;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 6vw;
    font-family: sans-serif;
    font-weight: bold;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
    text-align: center;
    z-index: 10000;
    pointer-events: none;
    animation: ${(props) => (props.isVisible ? fadeIn : fadeOut)} 0.4s ease-out forwards;
`;

interface AnimatedMessageProps {
    text: string;
    duration?: number; // Total time to show the message in ms
    onComplete: () => void; // Callback when animation is finished
}

export const AnimatedMessage: React.FC<AnimatedMessageProps> = ({ text, duration = 4000, onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            // Call onComplete after the fade-out animation finishes
            setTimeout(onComplete, 400);
        }, duration - 400); // Start fade-out before total duration ends

        return () => clearTimeout(timer);
    }, [duration, onComplete]);

    return (
        <MessageContainer isVisible={isVisible}>
            {text}
        </MessageContainer>
    );
};