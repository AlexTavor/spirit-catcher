import { CommandBus } from "../../api/CommandBus";
import { ConfigManager } from "../../consts/ConfigManager";
import {
    GameCommands,
    PlayerUpgradeType,
    UpgradePlayerPayload,
} from "../../consts/GameCommands";
import { getLevelState } from "../../utils/getLevelState";
import { Entity, System } from "../core/ECS";
import { ActiveModifiersComponent } from "../core/modifiers/ActiveModifiersComponent";
import { UpRangSize } from "./modifiers/UpRangSize";

export class UpgradesSystem extends System {
    public componentsRequired: Set<Function> = new Set<Function>();

    constructor() {
        super();
        CommandBus.on(
            GameCommands.UPGRADE_PLAYER,
            this.handleApplyModifier,
            this,
        );

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

    handleApplyModifier(payload: UpgradePlayerPayload): void {
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
        CommandBus.off(
            GameCommands.UPGRADE_PLAYER,
            this.handleApplyModifier,
            this,
        );

        CommandBus.off(
            GameCommands.RESET_UPGRADES,
            this.handleResetUpgrades,
            this,
        );
    }
}
