import { Component } from "../core/ECS";
import { GameState } from "./GameState";

/**
 * A component attached to the world entity that holds the single
 * source of truth for the current state of mob progression.
 */

export class LevelState extends Component {
    public gameState: GameState = GameState.PRE_GAME;
    public waveNumber = 0;
    /** Timer for state-based delays, like time between waves. */
    public stateTimer = 0;

    public spiritsCollected = 0;
    public spiritsMissed = 0;
    public maxSpiritMisses = 100;
    public isWaveGenerated = false;

    constructor(maxHealth: number) {
        super();
        this.gameState = GameState.PRE_GAME;
        this.maxSpiritMisses = maxHealth;
    }
}
