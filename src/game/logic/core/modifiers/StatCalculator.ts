import { ECS, Entity } from "../ECS";
import { ActiveModifiersComponent } from "./ActiveModifiersComponent";
import { ModifierEffect, ModifierEffectType } from "./types";

/**
 * A static utility class for calculating the final value of a stat after applying modifiers.
 */
export class StatCalculator {
    /**
     * Calculates the effective value of a stat for a given entity by applying all
     * relevant active modifiers to a provided base value.
     *
     * @param ecs The ECS instance.
     * @param entity The entity whose stat is being calculated.
     * @param statType The identifier of the stat to calculate (e.g., "WalkSpeed").
     * @param baseValue The initial, unmodified value of the stat.
     * @returns The final stat value after all modifiers have been applied.
     */
    public static getEffectiveStat(
        ecs: ECS,
        entity: Entity,
        statType: string,
        baseValue: number,
    ): number {
        let currentValue = baseValue;

        const modifiersComponent = ecs.getComponent(
            entity,
            ActiveModifiersComponent,
        );

        // If the entity has no modifiers component or no active modifiers, return the base value.
        if (!modifiersComponent || modifiersComponent.modifiers.length === 0) {
            return currentValue;
        }

        // Collect all effects that are relevant to the specified stat type.
        const relevantEffects: ModifierEffect[] = [];
        for (const modifier of modifiersComponent.modifiers) {
            for (const effect of modifier.effects) {
                if (effect.stat === statType) {
                    relevantEffects.push(effect);
                }
            }
        }

        if (relevantEffects.length === 0) {
            return currentValue;
        }

        // Sort effects to ensure a deterministic order of application.
        //    - FLAT_ADDITIVE effects are applied first.
        //    - PERCENT_MULTIPLICATIVE effects are applied second.
        //    - Within each type, effects are sorted by their 'order' property (lower first).
        relevantEffects.sort((a, b) => {
            const typeOrderA =
                a.type === ModifierEffectType.FLAT_ADDITIVE ? 1 : 2;
            const typeOrderB =
                b.type === ModifierEffectType.FLAT_ADDITIVE ? 1 : 2;

            if (typeOrderA !== typeOrderB) {
                return typeOrderA - typeOrderB;
            }
            return (a.order ?? 0) - (b.order ?? 0);
        });

        // Apply flat additive bonuses.
        for (const effect of relevantEffects) {
            if (effect.type === ModifierEffectType.FLAT_ADDITIVE) {
                currentValue += effect.value;
            }
        }

        // Apply percent multiplicative bonuses.
        for (const effect of relevantEffects) {
            if (effect.type === ModifierEffectType.PERCENT_MULTIPLICATIVE) {
                // Assumes value is like 1.1 for +10% or 0.9 for -10%.
                currentValue *= effect.value;
            }
        }

        return currentValue;
    }
}
