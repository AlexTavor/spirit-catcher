import { ECS, Entity } from "../logic/core/ECS";
import { Player } from "../logic/player/components/Player";

let player: number = -1;

export function getPlayerEntity(ecs: ECS): Entity {
    if (player !== -1) {
        return player;
    }

    const players = ecs.getEntitiesWithComponent(Player);
    if (players.length === 0) return -1;
    const playerEntity = players[0];
    player = playerEntity;
    return playerEntity;
}
