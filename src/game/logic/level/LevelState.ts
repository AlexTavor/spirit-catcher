import { Component } from "../core/ECS";
import { WaveState } from "./WaveState";

/**
 * A component attached to the world entity that holds the single
 * source of truth for the current state of mob progression.
 */

export class LevelState extends Component {
    public waveState: WaveState = WaveState.PRE_GAME;
    public waveNumber = 0;
    /** Timer for state-based delays, like time between waves. */
    public stateTimer = 0;

    public spiritsCollected = 0;
    public spiritsMissed = 0;
    public maxSpiritMisses = 100;
}
