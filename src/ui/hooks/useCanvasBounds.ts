import { useState, useEffect } from "react";
import { EventBus } from "../../game/api/EventBus";
import { GameEvents } from "../../game/consts/GameEvents";

interface CanvasBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function useCanvasBounds(): CanvasBounds | null {
    const [bounds, setBounds] = useState<CanvasBounds | null>(null);

    useEffect(() => {
        const handleResize = (newBounds: CanvasBounds) => {
            setBounds(newBounds);
        };

        EventBus.on(GameEvents.CANVAS_RESIZED, handleResize);

        // A cleanup function to unsubscribe
        return () => {
            EventBus.off(GameEvents.CANVAS_RESIZED, handleResize);
        };
    }, []);

    return bounds;
}
