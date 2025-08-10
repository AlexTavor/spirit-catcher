const STORAGE_KEY = "gameConfig";

// These are the default values, used if nothing is in Local Storage.
const DEFAULTS = {
    // --- Game Config --- //
    GameWidth: 720,
    GameHeight: 1280,
    EntryScene: "Game",
    LevelTransitionDuration: 2000, // ms

    // --- Player Config --- //
    PlayerHeight: 128,
    PlayerWidth: 64,
    PlayerPickupRadius: 100,
    PlayerMovementEaseValue: 0.15, // Smoothing factor for player movement (0 = instant, 1 = no movement)

    // --- Boomerang Config ---
    BoomerangGravity: 50,
    BoomerangGravityScaleByVelocity: 9, // Multiplier for gravity at near-zero X velocity
    BoomerangGravityMaxVel: 200, // The X velocity at which the gravity bonus diminishes to zero
    BoomerangAirDrag: 0.95,
    BoomerangThrowMinForce: 1800,
    BoomerangSpawnOffsetY: 10,
    BoomerangRotationSpeed: 10,
    BoomerangWallBounce: 0.8,
    BoomerangWidth: 32,
    BoomerangHeight: 8,
    BoomerangImpactMaxVelocity: 800, // Max horizontal velocity for impact force calculation
    BoomerangMaxActives: 5, // Maximum number of active boomerangs at once
    BoomerangNudgeMaxDelta: 200, // The drag distance that produces the max nudge.
    BoomerangNudgeImpulse: 1000, // The impulse force applied at the max nudge delta, per second
    BoomerangMaxNudgeVelocity: 1600, // Maximum horizontal velocity applied by nudging

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
    ThumbstickDeadzone: 10, // Pixels

    // --- Mobs Config --- //
    MobWidth: 80,
    MobHeight: 80,
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

