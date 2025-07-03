import { Pos } from "../../../utils/Math";
import { EventBus } from "../../api/EventBus";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { System } from "../core/ECS";
import { IsWalking } from "../player/components/IsWalking";
import { WalkTarget } from "../player/components/WalkTarget";

export const GROUND_EVENTS = {
    DOWN: "GROUND_POINTER_DOWN",
    UP: "GROUND_POINTER_UP",
    MOVE: "GROUND_POINTER_MOVE",
};

export class MovementInputSystem extends System {
    public componentsRequired = new Set<Function>();

    constructor() {
        super();
        EventBus.on(GROUND_EVENTS.DOWN, this.handleDown, this);
        EventBus.on(GROUND_EVENTS.UP, this.handleUp, this);
        EventBus.on(GROUND_EVENTS.MOVE, this.handleMove, this);
    }

    destroy(): void {
        EventBus.removeListener(GROUND_EVENTS.DOWN, this.handleDown, this);
        EventBus.removeListener(GROUND_EVENTS.UP, this.handleUp, this);
        EventBus.removeListener(GROUND_EVENTS.MOVE, this.handleMove, this);
    }

    update() {}

    private handleDown(pos: Pos) {
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        if (!this.ecs.hasComponent(player, IsWalking)) {
            this.ecs.addComponent(player, new IsWalking());
        }

        const walkTarget =
            this.ecs.getComponent(player, WalkTarget) ?? new WalkTarget();
        walkTarget.pos = pos;
        this.ecs.addComponent(player, walkTarget);
    }

    private handleUp() {
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;
        this.ecs.removeComponent(player, IsWalking);
        this.ecs.removeComponent(player, WalkTarget);
    }

    private handleMove(pos: Pos) {
        const player = getPlayerEntity(this.ecs);
        if (player === -1 || !this.ecs.hasComponent(player, IsWalking)) return;

        const walkTarget = this.ecs.getComponent(player, WalkTarget);
        walkTarget.pos = pos;
    }
}
