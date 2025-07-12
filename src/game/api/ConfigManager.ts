const STORAGE_KEY = "gameConfig";

// These are the default values, used if nothing is in Local Storage.
const DEFAULTS = {
    // --- Game Config --- //
    GameWidth: 720,
    GameHeight: 1280,
    EntryScene: "Game",

    // --- Player Config --- //
    PlayerHeight: 128,
    PlayerWidth: 64,
    PlayerPickupRadius: 100,
    ChargeMaxLevel: 100, // Maximum charge level
    ChargeRate: 50, // Rate at which the charge level increases
    WalkSpeed: 1000, // Pixels per second
    PlayerMovementEaseValue: 0.15, // Smoothing factor for player movement (0 = instant, 1 = no movement)
    MaxMana: 80, // Maximum mana for the player
    ManaRegenPerSecond: 10, // Mana regenerated per second

    // --- Boomerang Config ---
    BoomerangGravity: 500,
    BoomerangHomingForce: 32,
    BoomerangAirDrag: 0.95,
    BoomerangThrowMinForce: 200,
    BoomerangThrowMaxForce: 2000,
    BoomerangSpawnOffsetY: 10,
    BoomerangRotationSpeed: 10,
    BoomerangWallBounce: 0.8,
    BoomerangWidth: 32,
    BoomerangHeight: 8,
    BoomerangImpactMaxVelocity: 800, // Max horizontal velocity for impact force calculation
    BoomerangMaxActives: 5, // Maximum number of active boomerangs at once

    // --- Explosion Config ---
    ExplosionBaseDuration: 300, // ms
    ExplosionDurationPerForce: 700, // ms
    ExplosionForceToSizeRatio: 250, // pixels per unit of force
    ExplosionShockwaveColor: 0xffffff,
    ExplosionShockwaveWidth: 4, // pixels
    CamShakeBaseIntensity: 0.01,
    CamShakeDuration: 150, // ms

    // --- Wall Hit Duplicate Boomerang Config ---
    WallHitDuplicateRangChance: 0.5, // 1 = always duplicate, 0 = never duplicate
    WallHitDuplicateMinForce: 0.5, // Minimum force to duplicate the boomerang
    WallHitAngleVariance: 0.3, // Variance in angle when duplicating boomerang

    // --- Input Config --- //
    ThumbstickDeadzone: 40, // Pixels

    // --- Mobs Config --- //
    MobDescentSpeed: 100, // Pixels per second
    OverkillMinForce: 0.5, // Minimum force to trigger overkill
    MobWidth: 80,
    MobHeight: 80,

    // --- Mob Collision Config --- //
    MobCollisionDamageFactor: 100, // Multiplies normalized force to get damage
    MobCollisionMobLift: 2, // How many pixels a mob is knocked up on hit
    MobCollisionRangUpKick: 0, // Upward velocity applied to boomerang on hit
    MobCollisionReflectFactor: 0.8, // How much velocity is preserved on reflection (e.g., 0.8 = 80%)
    MobCollisionMaxImpactForce: 2000, // The velocity magnitude used to normalize impact force to 0-1
    MobStepInterval: 5000, // Time between steps in milliseconds
    MobStepDuration: 250, // Duration of each step animation in milliseconds
    MobStepHeight: 20, // Height of each step in pixels

    // --- Boomerang Mob Interaction ---
    BoomerangDamageThreshold: 400, // The velocity a boomerang must exceed to be considered a "hard hit" for damage.
    BoomerangDpsDamage: 30, // Damage per second applied by a boomerang in sustained, low-velocity contact.
    BoomerangContinuousLiftForce: 450, // Upward force (pixels/sec) applied by a boomerang in sustained, low-velocity contact. Must be > BoomerangGravity to have a net upward effect.
    BoomerangMaxImpulseLift: 15, // The maximum one-time lift impulse (in pixels) from a hard hit. This is applied when impact force is at its lowest; a max-force hit gives 0 lift.
    BoomerangHitCooldownMs: 60, // The cooldown in milliseconds after a hard hit before the same mob can take impact damage again.
    BoomerangBounceThreshold: 200, // The velocity a boomerang must exceed to bounce off a mob. Set lower than the damage threshold to allow for non-damaging, strategic bounces.
    BoomerangMobBounceFactor: 0.9, // A multiplier for the boomerang's velocity after bouncing off a mob. A value less than 1.0 represents some energy loss on impact.

    // --- Stomp Config --- //
    StompManaCost: 50, // Mana cost for the stomp action
    StompForce: 5000, // Downward force applied to all boomerangs when stomped
};

export type ConfigType = typeof DEFAULTS;

export class ConfigManager {
    private static activeConfig: ConfigType | null = null;

    /**
     * Loads the configuration from Local Storage or sets it from the defaults.
     * This is called automatically by get() on its first run.
     */
    private static load(): void {
        const storedConfig = localStorage.getItem(STORAGE_KEY);
        let loadedConfig = {};

        if (storedConfig) {
            try {
                loadedConfig = JSON.parse(storedConfig);
            } catch (e) {
                console.error(
                    "Failed to parse stored config, using defaults.",
                    e,
                );
            }
        }
        // Merge defaults with loaded config to ensure all keys are present
        this.activeConfig = { ...DEFAULTS, ...loadedConfig };
    }

    /**
     * Returns the currently active configuration object.
     * If the config hasn't been loaded yet, this will trigger the initial load.
     * @returns The active configuration.
     */
    public static get(): ConfigType {
        if (this.activeConfig === null) {
            this.load();
        }
        return this.activeConfig as ConfigType;
    }

    /**
     * Saves a new configuration to Local Storage and updates the active config.
     * @param newConfig The configuration object to save.
     */
    public static save(newConfig: ConfigType): void {
        try {
            const jsonString = JSON.stringify(newConfig, null, 2);
            localStorage.setItem(STORAGE_KEY, jsonString);
            this.activeConfig = newConfig;
        } catch (e) {
            console.error("Failed to save config to Local Storage.", e);
        }
    }

    /**
     * Clears the configuration from Local Storage and resets the active config to defaults.
     */
    public static clear(): void {
        localStorage.removeItem(STORAGE_KEY);
        this.activeConfig = null; // Reset to force reload on next get()
        this.load(); // Load defaults again
    }
}
