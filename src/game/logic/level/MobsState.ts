import { Component } from "../core/ECS";
import { LevelState } from "./LevelState";

/**
 * A component attached to the world entity that holds the single
 * source of truth for the current state of mob progression.
 */

export class MobsState extends Component {
    public state: LevelState = LevelState.PRE_GAME;
    public waveNumber = 0;
    /** Timer for state-based delays, like time between waves. */
    public stateTimer = 0;
}
