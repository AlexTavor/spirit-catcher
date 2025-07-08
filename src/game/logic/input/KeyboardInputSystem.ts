import { System } from "../core/ECS";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { MoveIntention } from "./MoveIntention";
import { ConfigManager } from "../../api/ConfigManager";
import { Pos } from "../../../utils/Math";
import { throwPlayerBoomerang } from "../player/utils/throwPlayerBoomerang";
import { IsInputDown } from "./IsInputDown";

export class KeyboardInputSystem extends System {
    public componentsRequired = new Set<Function>();

    private leftKeyDown = false;
    private rightKeyDown = false;
    private readonly leftEdgePos: Pos;
    private readonly rightEdgePos: Pos;

    constructor() {
        super();
        const config = ConfigManager.get();
        const targetY = config.GameHeight;
        this.leftEdgePos = { x: 0, y: targetY };
        this.rightEdgePos = { x: config.GameWidth, y: targetY };

        window.addEventListener("keydown", this.handleKeyDown.bind(this));
        window.addEventListener("keyup", this.handleKeyUp.bind(this));
    }

    public destroy(): void {
        window.removeEventListener("keydown", this.handleKeyDown.bind(this));
        window.removeEventListener("keyup", this.handleKeyUp.bind(this));
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (e.repeat) return;

        switch (e.code) {
            case "ArrowLeft":
                this.leftKeyDown = true;
                break;
            case "ArrowRight":
                this.rightKeyDown = true;
                break;
            case "Space":
                // this.spaceKeyDown = true;
                break;
        }
    }

    private handleKeyUp(e: KeyboardEvent): void {
        switch (e.code) {
            case "ArrowLeft":
                this.leftKeyDown = false;
                break;
            case "ArrowRight":
                this.rightKeyDown = false;
                break;
            case "Space":
                throwPlayerBoomerang(getPlayerEntity(this.ecs), this.ecs);
                break;
        }
    }

    public update(): void {
        const player = getPlayerEntity(this.ecs);
        if (player === -1) return;

        // --- Handle Move Intention ---
        const moveIntention = this.ecs.getComponent(player, MoveIntention);
        let isMoving = false;

        if (this.rightKeyDown) {
            moveIntention.targetPos = this.rightEdgePos;
            isMoving = true;
        } else if (this.leftKeyDown) {
            moveIntention.targetPos = this.leftEdgePos;
            isMoving = true;
        }

        const isInputDown = this.ecs.hasComponent(player, IsInputDown);

        moveIntention.active = isInputDown
            ? moveIntention.active || isMoving
            : isMoving;
    }
}
