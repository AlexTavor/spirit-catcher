import { CommandBus } from "../../../api/CommandBus";
import { ConfigManager } from "../../../api/ConfigManager";
import { GameCommands } from "../../../consts/GameCommands";
import { Transform } from "../../core/components/Transform";
import { ECS } from "../../core/ECS";
import { HasBoomerang } from "../components/HasBoomerang";

export function throwPlayerBoomerang(player: number, ecs: ECS) {
    if (!ecs.hasComponent(player, HasBoomerang)) {
        return; // Player ain't got no boomerang to throw
    }

    const transform = ecs.getComponent(player, Transform);
    const config = ConfigManager.get();

    // Fire throw boomerang command
    CommandBus.emit(GameCommands.ThrowBoomerangCommand, {
        chargeLevel: 1,
        maxChargeLevel: 1,
        playerId: player,
        target: { x: transform.pos.x, y: 0 },
        from: {
            x: transform.pos.x,
            y:
                transform.pos.y -
                config.PlayerHeight / 2 -
                config.BoomerangSpawnOffsetY,
        },
    });
}
