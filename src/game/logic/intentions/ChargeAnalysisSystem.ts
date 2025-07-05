import { System } from "../core/ECS";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { ChargeIntention } from "./ChargeIntention";
import { InputState } from "../core/input/InputStateComponent";
import { ConfigManager } from "../../api/ConfigManager";
import { groundConfig } from "../../consts/backgrounds";
import { Geom } from "phaser";
import { Transform } from "../components/Transform";
import { HasBoomerang } from "../player/components/HasBoomerang";

export class ChargeAnalysisSystem extends System {
    public componentsRequired = new Set<Function>();
    private readonly groundY: number;
    private readonly config = ConfigManager.get();

    constructor() {
        super();
        this.groundY = this.config.GameHeight - groundConfig().height;
    }

    update() {
        const player = getPlayerEntity(this.ecs);
        if (player === -1 || !this.ecs.hasComponent(player, HasBoomerang)) {
            // If player doesn't exist or has no boomerang, ensure intention is off
            const playerEntity = getPlayerEntity(this.ecs);
            if (playerEntity !== -1) {
                this.ecs.getComponent(playerEntity, ChargeIntention).active =
                    false;
            }
            return;
        }

        const inputState = this.ecs.getComponent(this.ecs.world, InputState);
        const chargeIntention = this.ecs.getComponent(player, ChargeIntention);
        const playerTransform = this.ecs.getComponent(player, Transform);

        const playerBounds = new Geom.Rectangle(
            playerTransform.pos.x,
            playerTransform.pos.y,
            this.config.PlayerWidth,
            this.config.PlayerHeight,
        );

        let isCharging = false;
        // Check if any active pointer qualifies as a "charge" action
        for (const pointer of inputState.pointers) {
            if (pointer.isDown) {
                const isChargeTap =
                    pointer.currentPos.y < this.groundY ||
                    Geom.Rectangle.Contains(
                        playerBounds,
                        pointer.currentPos.x,
                        pointer.currentPos.y,
                    );

                if (isChargeTap) {
                    isCharging = true;
                    break; // Found one, no need to check others
                }
            }
        }

        chargeIntention.active = isCharging;
    }

    public destroy(): void {}
}
