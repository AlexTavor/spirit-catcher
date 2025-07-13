import { CommandBus } from "../../api/CommandBus";
import { ConfigManager } from "../../api/ConfigManager";
import { GameCommands } from "../../consts/GameCommands";
import { getMobsState } from "../../utils/getMobsState";
import { Transform } from "../core/components/Transform";
import { System } from "../core/ECS";
import { Mob } from "../mobs/components/Mob";
import { LevelState } from "./LevelState";

/**
 * Checks if all on-screen mobs have been cleared and fires a command
 * to quick-march the next group of mobs for the current wave.
 */
export class WaveAdvanceSystem extends System {
    public componentsRequired = new Set<Function>();

    public override update(): void {
        const mobsState = getMobsState(this.ecs);
        const config = ConfigManager.get();

        // This system only runs when a wave is active.
        if (!mobsState || mobsState.state !== LevelState.WAVE_ACTIVE) {
            return;
        }

        const mobs = this.ecs.getEntitiesWithComponents([Mob, Transform]);

        // If no mobs exist at all, the LevelDirectorSystem will handle the
        // final WAVE_CLEARED state. This system should do nothing.
        if (mobs.length === 0) {
            return;
        }

        // Check if any mob has a positive y-coordinate (is on-screen).
        const isAnyMobOnScreen = mobs.some((mobEntity) => {
            const transform = this.ecs.getComponent(mobEntity, Transform);
            return transform.pos.y >= config.MobHeight;
        });

        // If mobs exist, but none are on-screen, command the wave to advance.
        if (!isAnyMobOnScreen) {
            CommandBus.emit(GameCommands.ADVANCE_WAVE_COMMAND);
        }
    }

    public destroy(): void {}
}
