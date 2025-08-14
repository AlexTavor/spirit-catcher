// src/game/logic/upgrades/systems/UpgradeShortlistSystem.ts

import { EventBus } from "../../../api/EventBus";
import { GameEvents, WaveStateChangeEvent } from "../../../consts/GameEvents";
import { MathUtils } from "../../../../utils/Math";
import { System } from "../../core/ECS";
import { GameState } from "../../level/GameState";
import { allUpgradeDefinitions } from "../data";
import { PlayerUpgradeType } from "../PlayerUpgradeType";
import { getUpgradesShortlistState } from "../../../utils/getUpgradesShortlistState";
import { getUpgradesState } from "../../../utils/getUpgradesState";

export class UpgradeShortlistSystem extends System {
    public componentsRequired = new Set<Function>();

    constructor() {
        super();
        EventBus.on(GameEvents.WAVE_STATE_CHANGE, this.handleStateChange, this);
    }

    public override destroy(): void {
        EventBus.removeListener(
            GameEvents.WAVE_STATE_CHANGE,
            this.handleStateChange,
            this,
        );
    }

    private handleStateChange(data: WaveStateChangeEvent): void {
        if (data.newState === GameState.UPGRADE_PLAYER) {
            this.generateShortlist();
        }
    }

    private generateShortlist(): void {
        const upgradesState = getUpgradesState(this.ecs);
        const shortlistState = getUpgradesShortlistState(this.ecs);

        // Filter for upgrades that haven't reached their max level.
        const availableUpgrades = allUpgradeDefinitions.filter((def) => {
            if (def.maxLevel === -1) return true; // Infinite levels
            const currentLevel = upgradesState.upgrades[def.type] || 0;
            return currentLevel < def.maxLevel;
        });

        // Calculate dynamic weights for the available upgrades.
        const dynamicWeights: { [key: string]: number } = {};
        for (const upgrade of availableUpgrades) {
            const currentLevel = upgradesState.upgrades[upgrade.type] || 0;
            // The higher the level, the lower the chance to be picked again.
            dynamicWeights[upgrade.type] = upgrade.weight / (currentLevel + 1);
        }

        // Select 3 unique upgrades based on their dynamic weights.
        const shortlist: PlayerUpgradeType[] = [];
        const numToSelect = Math.min(3, Object.keys(dynamicWeights).length);

        for (let i = 0; i < numToSelect; i++) {
            const selectedType = MathUtils.weightedRandString(dynamicWeights);
            if (selectedType) {
                shortlist.push(selectedType as PlayerUpgradeType);
                // Remove from pool to prevent duplicate selection.
                delete dynamicWeights[selectedType];
            }
        }

        // Update state and notify listeners.
        shortlistState.shortlist = shortlist;
        EventBus.emit(
            GameEvents.UPGRADE_SHORTLIST_CHANGED,
            shortlistState.shortlist,
        );
    }

    public update(): void {
        // This system is entirely event-driven.
    }
}
