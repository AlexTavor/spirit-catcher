import { Events } from "phaser";

/**
 * A dedicated message bus for handling imperative commands.
 * This provides a separate pipeline from the EventBus, which is used
 * for descriptive events.
 * https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter
 */
export const CommandBus = new Events.EventEmitter();
