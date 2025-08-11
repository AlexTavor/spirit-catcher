/**
 * Defines the possible states of the game.
 */

export enum GameState {
    PRE_GAME, // Game is paused, waiting for first input.
    PRE_WAVE, // The brief moment before a wave starts.
    WAVE_STARTING, // Wave is starting, showing notification.
    WAVE_ACTIVE, // Mobs are descending normally; player can act.
    WAVE_CLEARED, // All mobs from the wave are defeated.
    GAME_WON,
    GAME_LOST,
    UPGRADE_PLAYER, // Player is in the upgrade menu.
}
