import { getMobsState } from "../../../utils/getMobsState";
import { getPlayerEntity } from "../../../utils/getPlayerEntity";
import { System } from "../../core/ECS";
import { LevelState } from "../../level/LevelState";
import { HasBoomerang } from "../../player/components/HasBoomerang";
import { Boomerang } from "../components/Boomerang";

/**
 * A janitorial system that cleans up leftover boomerangs from the
 * screen upon the transition to a new wave.
 */
export class BoomerangCleanupSystem extends System {
    public componentsRequired = new Set<Function>();
    private lastKnownState: LevelState | null = null;

    public override update(): void {
        const mobsState = getMobsState(this.ecs);
        if (!mobsState) return;

        const currentState = mobsState.state;

        // --- STATE CHANGE CHECK ---
        // We only act on the frame the state *changes* to PRE_WAVE.
        if (
            currentState === LevelState.WAVE_STARTING &&
            this.lastKnownState !== LevelState.WAVE_STARTING
        ) {
            this.cleanupBoomeangs();
        }

        this.lastKnownState = currentState;
    }

    private cleanupBoomeangs(): void {
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
