/**
 * Defines the possible phases of a wave.
 */

export enum LevelState {
    PRE_GAME, // Game is paused, waiting for first input.
    PRE_WAVE, // The brief moment before a wave's mobs start marching.
    WAVE_STARTING, // Mobs are quick-marching into position.
    WAVE_ACTIVE, // Mobs are descending normally; player can act.
    WAVE_CLEARED, // All mobs from the wave are defeated.
    GAME_WON,
}
