import { Component } from "../../core/ECS";
import { PlayerUpgradeType } from "../PlayerUpgradeType";

/**
 * A component attached to the world entity that holds the current
 * shortlist of three upgrades offered to the player.
 */
export class UpgradesShortlistState extends Component {
    public shortlist: PlayerUpgradeType[] = [];
}
