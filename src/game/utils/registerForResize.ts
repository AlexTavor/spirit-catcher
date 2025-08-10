import { Scene } from "phaser";
import { GameEvents } from "../consts/GameEvents";
import { EventBus } from "../api/EventBus";

export function registerForResize(scene: Scene): () => void {
    /**
     * Handles the resize event by emitting the canvas bounds.
     */
    const handleResize = () => {
        const bounds = scene.scale.canvasBounds;
        if (bounds) {
            // Emit a plain object to avoid potential issues with Phaser's Rectangle object
            EventBus.emit(GameEvents.CANVAS_RESIZED, {
                x: bounds.x,
                y: bounds.y,
                width: bounds.width,
                height: bounds.height,
            });
        }
    };

    // Subscribe to the scale manager's resize event
    scene.scale.on("resize", handleResize);

    // Emit the initial bounds immediately in case the UI is ready before a resize occurs
    handleResize();

    // Return a cleanup function to be called when the scene is destroyed
    const cleanup = () => {
        scene.scale.off("resize", handleResize);
    };

    return cleanup;
}
