import { System, Entity } from "../core/ECS";
import { GameState } from "../level/GameState";
import { getLevelState } from "../../utils/getLevelState";
import {
    SegDefinition,
    TrackDefinition,
    DifficultyCurveDefinition,
} from "./types";
import {
    SpiritSpawnState,
    SpawnerData,
} from "../spirits/components/SpiritSpawnState";
import { Component } from "../core/ECS";
import { KeyframeUtil } from "./KeyframeUtil";
import { allCurves, allSegs, allTracks } from "./data";
import { ConfigManager } from "../../consts/ConfigManager";
import { ThreatCalculator } from "./ThreatCalculator";

// --- State Management Components ---

export interface ActiveSpawner {
    entity: Entity;
    trackDef: TrackDefinition;
    startTime: number;
}

export class ActiveConductorState extends Component {
    public activeSegs: SegDefinition[] = [];
    public activeSpawners: ActiveSpawner[] = [];
    public difficultyCurve: DifficultyCurveDefinition = allCurves[0];
    public waveTime: number = 0;
    public currentSegIndex: number = -1;
}

// --- The Main System ---

export class WaveConductorSystem extends System {
    public componentsRequired = new Set<Function>();
    private readonly spawningDefaults = {
        spawnX: 0,
        yVelocity: 0,
        spawnXVariance: 0,
        spawnYVariance: 0,
        spawnInterval: 0,
    };

    public update(_entities: Set<Entity>, delta: number): void {
        const lvl = getLevelState(this.ecs);
        if (!lvl) return;

        const conductorState = this.ecs.getComponent(
            this.ecs.world,
            ActiveConductorState,
        );
        // Check if a new wave needs to start
        if (lvl.gameState === GameState.WAVE_STARTING && !lvl.isWaveGenerated) {
            this.startNewWave(conductorState);
            lvl.isWaveGenerated = true;
        }

        if (lvl.gameState !== GameState.WAVE_ACTIVE) {
            return;
        }

        conductorState.waveTime += delta;
        // Update spawner lifecycles (creation/destruction)
        this.updateActiveSpawners(conductorState);
        // Update properties of active spawners based on keyframes
        this.updateSpawnerProperties(conductorState, delta);
    }

    private startNewWave(conductorState: ActiveConductorState): void {
        // --- Reset state for the new wave ---
        conductorState.waveTime = 0;
        conductorState.currentSegIndex = -1;
        conductorState.activeSegs = [];

        // --- Calculate Threat Budget ---
        const config = ConfigManager.get();
        const lvl = getLevelState(this.ecs);
        const waveNumber = lvl?.waveNumber || 0;
        const totalThreatBudget =
            config.BaseThreat + waveNumber * config.ThreatBudgetIncreaseFactor;
        let spentThreat = 0;

        // --- Pre-calculate segment threats for efficiency ---
        const segsWithThreat = allSegs
            .map((seg) => ({
                seg,
                threat: ThreatCalculator.calculateSegThreat(seg),
            }))
            .filter((s) => s.threat > 0); // Exclude zero-threat segments

        if (segsWithThreat.length === 0) return; // No segments to choose from

        // console.log the threat budget and segments
        console.log(
            `Starting wave ${waveNumber} with threat budget: ${totalThreatBudget}`,
            segsWithThreat.map((s) => `${Math.round(s.threat)} ${s.seg.segId}`),
        );

        const minThreat = Math.min(...segsWithThreat.map((s) => s.threat));

        // --- Spend budget on segments ---
        while (totalThreatBudget - spentThreat >= minThreat) {
            const remainingBudget = totalThreatBudget - spentThreat;
            const affordableSegs = segsWithThreat.filter(
                (s) => s.threat <= remainingBudget,
            );

            if (affordableSegs.length === 0) {
                break; // No affordable segments left
            }

            // Select a random affordable segment (ignoring rarity for now)
            const selected =
                affordableSegs[
                    Math.floor(Math.random() * affordableSegs.length)
                ];

            conductorState.activeSegs.push(selected.seg);
            spentThreat += selected.threat;
        }
    }

    private updateActiveSpawners(conductorState: ActiveConductorState): void {
        if (conductorState.activeSegs.length === 0) return;
        // Determine which segment should be active
        let cumulativeTime = 0;
        let segIndex = -1;
        for (let i = 0; i < conductorState.activeSegs.length; i++) {
            const seg = conductorState.activeSegs[i];
            const duration = seg.duration * 1000; // Convert to milliseconds
            if (conductorState.waveTime < cumulativeTime + duration) {
                segIndex = i;
                break;
            }
            cumulativeTime += duration;
        }

        // If the active segment has changed, manage spawners
        if (segIndex !== conductorState.currentSegIndex) {
            // Destroy old spawners
            for (const spawner of conductorState.activeSpawners) {
                if (this.ecs.hasEntity(spawner.entity)) {
                    this.ecs.removeEntity(spawner.entity);
                }
            }
            conductorState.activeSpawners = [];
            // Create new spawners for the current segment
            if (segIndex !== -1) {
                const currentSeg = conductorState.activeSegs[segIndex];
                for (const trackId of currentSeg.trackIds) {
                    const trackDef = allTracks.find(
                        (t) => t.trackId === trackId,
                    );
                    if (trackDef) {
                        const spawnerEntity = this.ecs.addEntity();
                        this.ecs.addComponent(
                            spawnerEntity,
                            new SpiritSpawnState(this.spawningDefaults),
                        );
                        conductorState.activeSpawners.push({
                            entity: spawnerEntity,
                            trackDef: trackDef,
                            startTime: cumulativeTime,
                        });
                    }
                }
            }
            conductorState.currentSegIndex = segIndex;
        }
    }

    private updateSpawnerProperties(
        conductorState: ActiveConductorState,
        delta: number,
    ): void {
        const curve = conductorState.difficultyCurve;
        if (!curve) return;

        const masterVolume = KeyframeUtil.calculateValue(
            curve.masterVolume,
            conductorState.waveTime / 1000,
        );
        for (const spawner of conductorState.activeSpawners) {
            const spawnState = this.ecs.getComponent(
                spawner.entity,
                SpiritSpawnState,
            );
            if (!spawnState) continue;

            spawnState.updateTimer(delta);

            const timeInTrack =
                (conductorState.waveTime - spawner.startTime) / 1000;
            const props = spawner.trackDef.properties;

            // Calculate each property based on its keyframes
            const data: SpawnerData = {
                spawnX: KeyframeUtil.calculateValue(props.spawnX, timeInTrack),
                yVelocity: KeyframeUtil.calculateValue(
                    props.yVelocity,
                    timeInTrack,
                ),
                spawnXVariance: KeyframeUtil.calculateValue(
                    props.spawnXVariance,
                    timeInTrack,
                ),
                spawnYVariance: KeyframeUtil.calculateValue(
                    props.spawnYVariance,
                    timeInTrack,
                ),
                spawnInterval: 0, // This will be calculated last
            };
            // Calculate dynamic spawn interval
            const baseInterval = KeyframeUtil.calculateValue(
                props.spawnInterval,
                timeInTrack,
            );
            const trackVolume = KeyframeUtil.calculateValue(
                props.trackVolume,
                timeInTrack,
            );
            const waveMultiplier =
                1 +
                (getLevelState(this.ecs)?.waveNumber || 0) *
                    ConfigManager.get().WaveNumberSpawnMultiplier;

            const combinedVolume = masterVolume * trackVolume;

            if (combinedVolume <= 0) {
                // Set a practically infinite interval to stop spawning.
                data.spawnInterval = Number.MAX_SAFE_INTEGER;
            } else {
                const finalVolume = combinedVolume * waveMultiplier;
                data.spawnInterval = baseInterval / finalVolume;
            }

            // Increase yVelocity based on wave number
            data.yVelocity +=
                (getLevelState(this.ecs)?.waveNumber || 0) *
                ConfigManager.get().WaveNumberYVelocityIncrease;

            // Update the component's data
            spawnState.data = data;
        }
    }

    public destroy(): void {
        // Cleanup if necessary
    }
}
