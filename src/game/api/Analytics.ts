import { Events } from "phaser";

/**
 * A dedicated message bus for handling analytics events.
 * This provides a separate pipeline from the EventBus, which is used
 * for descriptive events.
 */
export const Analytics = new Events.EventEmitter();
