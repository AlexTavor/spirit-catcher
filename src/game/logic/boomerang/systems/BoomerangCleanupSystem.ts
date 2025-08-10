import { getLevelState } from "../../../utils/getLevelState";
import { getPlayerEntity } from "../../../utils/getPlayerEntity";
import { System } from "../../core/ECS";
import { WaveState } from "../../level/WaveState";
import { HasBoomerang } from "../../player/components/HasBoomerang";
import { Boomerang } from "../components/Boomerang";

/**
 * A janitorial system that cleans up leftover boomerangs from the
 * screen upon the transition to a new wave.
 */
export class BoomerangCleanupSystem extends System {
    public componentsRequired = new Set<Function>();
    private lastKnownState: WaveState | null = null;

    public override update(): void {
        const lvl = getLevelState(this.ecs);
        if (!lvl) return;

        const currentState = lvl.waveState;

        // --- STATE CHANGE CHECK ---
        // We only act on the frame the state *changes* to PRE_WAVE.
        if (
            currentState === WaveState.WAVE_CLEARED &&
            this.lastKnownState !== currentState
        ) {
            this.cleanupBoomerangs();
        }

        this.lastKnownState = currentState;
    }

    private cleanupBoomerangs(): void {
        const boomerangs = this.ecs.getEntitiesWithComponent(Boomerang);
        for (const boomerang of boomerangs) {
            this.ecs.removeEntity(boomerang);
        }

        const player = getPlayerEntity(this.ecs);
        if (!this.ecs.hasComponent(player, HasBoomerang)) {
            this.ecs.addComponent(player, new HasBoomerang());
        }

        console.log(`Cleaned up ${boomerangs.length} boomerang(s).`);
    }

    public destroy(): void {
        // Nothing to destroy
    }
}
