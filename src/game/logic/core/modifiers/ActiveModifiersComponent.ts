import { Component } from "../ECS";
import {
    ActiveModifier,
    ModifierDefinition,
    ModifierStackingBehavior,
} from "./types";

/**
 * A component that holds and manages all active modifiers for an entity.
 * It includes logic for adding, removing, and querying modifiers.
 */
export class ActiveModifiersComponent extends Component {
    public modifiers: ActiveModifier[] = [];

    /**
     * Adds a new modifier to the entity or updates an existing one based on stacking rules.
     * @param definition The static definition of the modifier to add.
     */
    public addModifier(definition: ModifierDefinition): void {
        const existingModifierIndex = this.modifiers.findIndex(
            (m) => m.type === definition.type,
        );

        if (existingModifierIndex !== -1) {
            // An instance of this modifier type already exists.
            const existingModifier = this.modifiers[existingModifierIndex];

            switch (definition.stackingBehavior) {
                case ModifierStackingBehavior.REFRESH_DURATION:
                    existingModifier.timeRemaining =
                        definition.defaultDurationMs;
                    break;

                case ModifierStackingBehavior.INDEPENDENT_STACKING:
                    // Add a completely new instance.
                    this.modifiers.push(this.createActiveModifier(definition));
                    break;

                case ModifierStackingBehavior.NO_STACK:
                    // Do nothing; the existing modifier is not affected.
                    break;
            }
        } else {
            // No existing modifier of this type; add a new one.
            this.modifiers.push(this.createActiveModifier(definition));
        }
    }

    /**
     * Removes all active modifiers from the entity.
     */
    public reset(): void {
        this.modifiers = [];
    }

    /**
     * Removes all instances of a specific modifier type.
     * @param modifierType The type identifier of the modifier to remove.
     */
    public removeModifier(modifierType: string): void {
        this.modifiers = this.modifiers.filter((m) => m.type !== modifierType);
    }

    /**
     * Checks if the entity has at least one active modifier of a given type.
     * @param modifierType The type identifier to check for.
     * @returns True if the modifier is active, false otherwise.
     */
    public hasModifier(modifierType: string): boolean {
        return this.modifiers.some((m) => m.type === modifierType);
    }

    /**
     * Creates a new ActiveModifier instance from a definition.
     * @param definition The modifier's static definition.
     * @param expirationTime The calculated expiration timestamp.
     * @returns A new ActiveModifier object.
     */
    private createActiveModifier(
        definition: ModifierDefinition,
    ): ActiveModifier {
        return {
            type: definition.type,
            timeRemaining: definition.defaultDurationMs,
            effects: [...definition.effects],
            stackingBehavior: definition.stackingBehavior,
        };
    }
}

