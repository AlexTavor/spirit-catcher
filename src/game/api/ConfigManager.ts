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

    // --- Boomerang Config ---
    BoomerangGravity: 300,
    BoomerangHomingForce: 12,
    BoomerangAirDrag: 0.5,
    BoomerangThrowMinYVelocity: 200,
    BoomerangThrowMaxYVelocity: 2000,
    BoomerangThrowXVelocityScale: 2.5,
    BoomerangSpawnOffsetY: 10,
    BoomerangRotationSpeed: 10,
    BoomerangRestitution: 0.8,
};

type ConfigType = typeof DEFAULTS;

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
}
