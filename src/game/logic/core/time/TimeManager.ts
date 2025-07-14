import { Events } from "phaser";

/**
 * A self-contained, static manager for controlling the game's time scale.
 * It encapsulates its own event emitter and provides subscribe/unsubscribe methods.
 */
export class TimeManager {
    /**
     * The event key for time scale changes.
     */
    public static readonly TIME_SCALE_CHANGED = "TIME_SCALE_CHANGED";

    /**
     * The internal event emitter. Kept private to control the API surface.
     */
    private static readonly events = new Events.EventEmitter();

    private static timeScale = 1.0;

    /**
     * Gets the current time scale.
     * @returns The current time scale (1.0 is normal speed, 0.0 is paused).
     */
    public static timescale(): number {
        return this.timeScale;
    }

    /**
     * Sets a new time scale.
     * @param newScale The new time scale to apply. Must be a non-negative number.
     */
    public static set(newScale: number): void {
        const newTimeScale = Math.max(0, newScale);
        if (this.timeScale === newTimeScale) {
            return;
        }
        this.timeScale = newTimeScale;
        this.events.emit(this.TIME_SCALE_CHANGED, this.timeScale);
    }

    /**
     * Subscribes to a time-related event.
     * @param event The event key to listen for (e.g., TimeManager.TIME_SCALE_CHANGED).
     * @param callback The function to execute when the event is emitted.
     * @param context The context to invoke the callback with.
     */
    public static subscribe(
        event: string,
        callback: (...args: any[]) => void,
        context?: any,
    ) {
        this.events.on(event, callback, context);
    }

    /**
     * Unsubscribes from a time-related event.
     * @param event The event key to stop listening to.
     * @param callback The function that was originally subscribed.
     * @param context The context that was originally provided.
     */
    public static unsubscribe(
        event: string,
        callback: (...args: any[]) => void,
        context?: any,
    ) {
        this.events.off(event, callback, context);
    }

    /**
     * Pauses the game by setting the time scale to 0.
     */
    public static pause(): void {
        this.set(0);
    }

    /**
     * Resumes the game by setting the time scale to 1.0.
     */
    public static resume(): void {
        this.set(1);
    }
}
