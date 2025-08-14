import {
    ModifierEffect,
    ModifierEffectType,
} from "../../../core/modifiers/types";
import { ModifiableStat } from "../ModifiableStat";

export class UpRangSizeEffect implements ModifierEffect {
    stat: string = ModifiableStat.BOOMERANG_SIZE;
    type: ModifierEffectType = ModifierEffectType.PERCENT_MULTIPLICATIVE;
    value: number = 1.2; // Increase boomerang size by 20%
    order?: number | undefined;
}
