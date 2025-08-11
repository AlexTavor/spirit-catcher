import { Component } from "../core/ECS";
import { LevelData } from "../spirits/systems/levelData";
import { WaveState } from "./WaveState";

/**
 * A component attached to the world entity that holds the single
 * source of truth for the current state of mob progression.
 */

export class LevelState extends Component {
    public waveState: WaveState = WaveState.PRE_GAME;
    public data: LevelData;
    public waveNumber = 0;
    /** Timer for state-based delays, like time between waves. */
    public stateTimer = 0;

    public spiritsCollected = 0;
    public spiritsMissed = 0;
    public maxSpiritMisses = 100;

    constructor(data: LevelData) {
        super();
        this.data = data;
        this.waveState = WaveState.PRE_GAME;
        this.waveNumber = 0;
        this.stateTimer = 0;
        this.spiritsCollected = 0;
        this.spiritsMissed = 0;
        this.maxSpiritMisses = 100;
    }
}
