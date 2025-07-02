import { Events } from "phaser";

/**
 * A dedicated message bus for handling events.
 * This provides a separate pipeline from the CommandBus, which is used
 * for imperative commands.
 *
 * The EventBus is used to emit and listen to events that describe changes in the game state,
 * such as player actions, game state changes, or other significant events.
 *
 * It is based on Phaser's EventEmitter.
 *
 * @see https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter
 */
export const EventBus = new Events.EventEmitter();
