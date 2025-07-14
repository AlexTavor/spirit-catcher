/**
 * Defines how a modifier's value is applied to a base stat.
 */
export enum ModifierEffectType {
    /** Adds the effect's value to the base stat. Processed first. */
    FLAT_ADDITIVE = "FLAT_ADDITIVE",
    /** Multiplies the stat by the effect's value. Processed after flat bonuses. */
    PERCENT_MULTIPLICATIVE = "PERCENT_MULTIPLICATIVE",
}

/**
 * Determines how multiple applications of the same modifier type on a single entity are handled.
 */
export enum ModifierStackingBehavior {
    /** The new modifier's duration replaces the old one. */
    REFRESH_DURATION = "REFRESH_DURATION",
    /** Multiple instances of the modifier can exist independently. Their effects will be summed. */
    INDEPENDENT_STACKING = "INDEPENDENT_STACKING",
    /** Only one instance of this modifier can be active at a time. Subsequent applications are ignored. */
    NO_STACK = "NO_STACK",
}

/**
 * Represents a single effect that a modifier applies, e.g., "+10% to WalkSpeed".
 */
export interface ModifierEffect {
    /** * The stat this effect targets.
     * This is a string to allow game-specific enums to be used.
     */
    readonly stat: string;
    /** How the value is applied (e.g., additive, multiplicative). */
    readonly type: ModifierEffectType;
    /** The numerical value of the modification. */
    readonly value: number;
    /**
     * The order of application for effects of the same type.
     * Lower numbers are applied first.
     */
    readonly order?: number;
}

/**
 * The static definition of a modifier type.
 * This is the blueprint from which active modifiers are created.
 * These would typically be stored in a central file (e.g., `modifierDefinitions.ts`).
 */
export interface ModifierDefinition {
    /** A unique identifier for this type of modifier. */
    readonly type: string;
    /** The default duration of the modifier in milliseconds. */
    readonly defaultDurationMs: number;
    /** The collection of effects this modifier applies. */
    readonly effects: ReadonlyArray<ModifierEffect>;
    /** How this modifier behaves when applied multiple times. */
    readonly stackingBehavior: ModifierStackingBehavior;
    /** Optional display name for UI purposes. */
    readonly displayName?: string;
}

/**
 * Represents an instance of a modifier that is currently active on an entity.
 */
export interface ActiveModifier {
    type: string;
    timeRemaining: number; // Time left in milliseconds

    /** A copy of the effects from the definition. */
    effects: ModifierEffect[];
    /** The stacking behavior, copied from the definition. */
    stackingBehavior: ModifierStackingBehavior;
}
