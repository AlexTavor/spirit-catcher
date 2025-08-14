import { CommandBus } from "../../../api/CommandBus";
import { ConfigManager } from "../../../consts/ConfigManager";
import {
    GameCommands,
    UpgradePlayerPayload,
} from "../../../consts/GameCommands";
import { PlayerUpgradeType } from "../PlayerUpgradeType";
import { getLevelState } from "../../../utils/getLevelState";
import { Entity, System } from "../../core/ECS";
import { ActiveModifiersComponent } from "../../core/modifiers/ActiveModifiersComponent";
import { UpRangSize } from "../mods/modifiers/UpRangSize";
import { getUpgradesState } from "../../../utils/getUpgradesState";

export class UpgradeSystem extends System {
    public componentsRequired: Set<Function> = new Set<Function>();

    constructor() {
        super();
        CommandBus.on(GameCommands.UPGRADE_PLAYER, this.addUpdgrade, this);

        CommandBus.on(
            GameCommands.RESET_UPGRADES,
            this.handleResetUpgrades,
            this,
        );
    }
    handleResetUpgrades() {
        // Reset all active modifiers on the player
        const mods = this.ecs.getComponent(
            this.ecs.world,
            ActiveModifiersComponent,
        );
        mods.reset();

        // Reset the level state to default values
        const lvl = getLevelState(this.ecs);
        lvl.maxSpiritMisses = ConfigManager.get().MaxHealth;
    }

    addUpdgrade(payload: UpgradePlayerPayload): void {
        const upgradesState = getUpgradesState(this.ecs);
        if (!upgradesState.upgrades[payload.type]) {
            upgradesState.upgrades[payload.type] = 0;
        }
        upgradesState.upgrades[payload.type]!++;

        switch (payload.type) {
            case PlayerUpgradeType.UP_RANG_SIZE: {
                // Handle upgrading the boomerang size
                const mods = this.ecs.getComponent(
                    this.ecs.world,
                    ActiveModifiersComponent,
                );
                if (!mods) {
                    throw new Error(
                        "ActiveModifiersComponent not found on world entity",
                    );
                }
                mods.addModifier(new UpRangSize());
                break;
            }
            case PlayerUpgradeType.UP_MAX_HEALTH: {
                // Handle upgrading the max health
                const lvl = getLevelState(this.ecs);
                const up = ConfigManager.get().MaxHealth * 0.1;
                lvl.maxSpiritMisses += up;
                break;
            }
            case PlayerUpgradeType.HEAL: {
                // Handle healing the player
                const lvl = getLevelState(this.ecs);
                const up = ConfigManager.get().MaxHealth * 0.5;
                lvl.spiritsMissed = Math.max(0, lvl.spiritsMissed - up);
                break;
            }
        }
    }

    public update(_entities: Set<Entity>, _delta: number): void {
        // This system does not need to update entities directly.
        // It only listens for commands to apply modifiers.
        // Any logic related to applying modifiers is handled in the command handler.
    }

    public destroy(): void {
        CommandBus.off(GameCommands.UPGRADE_PLAYER, this.addUpdgrade, this);

        CommandBus.off(
            GameCommands.RESET_UPGRADES,
            this.handleResetUpgrades,
            this,
        );
    }
}
