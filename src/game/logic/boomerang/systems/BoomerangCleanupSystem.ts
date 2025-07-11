import { getMobsState } from "../../../utils/getMobsState";
import { System } from "../../core/ECS";
import { LevelState } from "../../level/LevelState";
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
            currentState === LevelState.PRE_WAVE &&
            this.lastKnownState !== LevelState.PRE_WAVE
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
        console.log(`Cleaned up ${boomerangs.length} boomerang(s).`);
    }

    public destroy(): void {
        // Nothing to destroy
    }
}
