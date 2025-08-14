import { Component } from "../../core/ECS";
import { PlayerUpgradeType } from "../PlayerUpgradeType";

const AbilitiesTriggeringQuickFalling = [
    PlayerUpgradeType.CAUGHT_RANG_PROJECTILE,
    PlayerUpgradeType.CAUGHT_RANG_EXPLOSION,
];

export class UpgradesState extends Component {
    public upgrades: Partial<Record<PlayerUpgradeType, number>> = {
        [PlayerUpgradeType.CAUGHT_RANG_PROJECTILE]: 0,
        [PlayerUpgradeType.CAUGHT_RANG_EXPLOSION]: 1,
    };

    public get hasQuickFalling(): boolean {
        return AbilitiesTriggeringQuickFalling.some(
            (ability) => this.upgrades[ability] !== undefined,
        );
    }
}
