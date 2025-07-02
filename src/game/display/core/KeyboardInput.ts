import { EventBus } from "../../api/EventBus";
import { GameUIEvent } from "../../consts/GameUIEvent";
import { GROUND_EVENTS } from "../../logic/systems/MovementInputSystem";
import { groundConfig } from "../../consts/backgrounds";
import { Pos } from "../../../utils/Math";
import { ConfigManager } from "../../api/ConfigManager";

export class KeyboardInput {
    private leftKeyDown = false;
    private rightKeyDown = false;
    private spaceDown = false;

    private readonly groundY: number;
    private readonly leftEdgePos: Pos;
    private readonly rightEdgePos: Pos;

    constructor() {
        this.groundY =
            ConfigManager.get().GameHeight - groundConfig().height / 2;
        this.leftEdgePos = { x: 0, y: this.groundY };
        this.rightEdgePos = {
            x: ConfigManager.get().GameWidth,
            y: this.groundY,
        };

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
                if (!this.leftKeyDown) {
                    this.leftKeyDown = true;
                    // If moving right, release it first before starting left
                    if (this.rightKeyDown) {
                        this.rightKeyDown = false;
                        EventBus.emit(GROUND_EVENTS.UP);
                    }
                    EventBus.emit(GROUND_EVENTS.DOWN, this.leftEdgePos);
                }
                break;
            case "ArrowRight":
                if (!this.rightKeyDown) {
                    this.rightKeyDown = true;
                    // If moving left, release it first before starting right
                    if (this.leftKeyDown) {
                        this.leftKeyDown = false;
                        EventBus.emit(GROUND_EVENTS.UP);
                    }
                    EventBus.emit(GROUND_EVENTS.DOWN, this.rightEdgePos);
                }
                break;
            case "Space":
                if (!this.spaceDown) {
                    this.spaceDown = true;
                    EventBus.emit(GameUIEvent.TAP_START, {
                        x: ConfigManager.get().GameWidth / 2,
                        y: 0,
                    });
                }
                break;
        }
    }

    private handleKeyUp(e: KeyboardEvent): void {
        switch (e.code) {
            case "ArrowLeft":
                if (this.leftKeyDown) {
                    this.leftKeyDown = false;
                    EventBus.emit(GROUND_EVENTS.UP);
                }
                break;
            case "ArrowRight":
                if (this.rightKeyDown) {
                    this.rightKeyDown = false;
                    EventBus.emit(GROUND_EVENTS.UP);
                }
                break;
            case "Space":
                if (this.spaceDown) {
                    this.spaceDown = false;
                    EventBus.emit(GameUIEvent.TAP_END);
                }
                break;
        }
    }

    public update(): void {
        // Continuously fire MOVE event if a key is held down
        if (this.leftKeyDown) {
            EventBus.emit(GROUND_EVENTS.MOVE, this.leftEdgePos);
        } else if (this.rightKeyDown) {
            EventBus.emit(GROUND_EVENTS.MOVE, this.rightEdgePos);
        }
    }
}
