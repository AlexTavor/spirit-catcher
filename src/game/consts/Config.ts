export class Config {
    // --- Game Config --- //
    public static readonly GameWidth = 720;
    public static readonly GameHeight = 1280;
    public static readonly EntryScene = "Game"; // "GameEditorTools"

    // --- Player Config --- //
    public static readonly PlayerHeight = 128; // Height of the player
    public static readonly PlayerWidth = 64; // Width of the player

    // --- Boomerang Config ---
    public static readonly BoomerangGravity = 300; // Downward acceleration in pixels/sec^2
    public static readonly BoomerangHomingForce = 12; // A scaling factor for the homing effect
    public static readonly BoomerangAirDrag = 0.5; // Linear drag to prevent infinite velocity
    public static readonly BoomerangThrowMinYVelocity = 200; // Speed at 0% charge
    public static readonly BoomerangThrowMaxYVelocity = 2000; // Speed at 100% charge
    public static readonly BoomerangThrowXVelocityScale = 2.5; // Horizontal speed multiplier
    public static readonly BoomerangSpawnOffsetY = 10; // Extra space above player's head
    public static readonly BoomerangRotationSpeed = 10; // Radians per second for boomerang rotation
    public static readonly BoomerangRestitution = 0.8; // Bounciness factor (0-1)
    public static readonly PlayerPickupRadius = 100; // Radius around the player to detect boomerang pickup
}
