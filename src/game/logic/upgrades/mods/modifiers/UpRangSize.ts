import {
    ModifierDefinition,
    ModifierEffect,
    ModifierStackingBehavior,
} from "../../../core/modifiers/types";
import { UpRangSizeEffect } from "../effects/UpRangSizeEffect";

export class UpRangSize implements ModifierDefinition {
    type: string = "upRangSize";
    defaultDurationMs: number = -1; // Permanent effect
    effects: readonly ModifierEffect[] = [new UpRangSizeEffect()];
    stackingBehavior: ModifierStackingBehavior =
        ModifierStackingBehavior.INDEPENDENT_STACKING;
    displayName?: string | undefined;
}
