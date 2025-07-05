import { EventBus } from "../api/EventBus";
import { GameInputEvent } from "../logic/api/GameInputEvent";
import { groundConfig } from "../consts/backgrounds";
import { Pos } from "../../utils/Math";
import { ConfigManager } from "../api/ConfigManager";

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
                        EventBus.emit(GameInputEvent.UP, {
                            pos: this.leftEdgePos,
                            pointerId: Number.MAX_SAFE_INTEGER,
                        });
                    }
                    EventBus.emit(GameInputEvent.DOWN, {
                        pos: this.leftEdgePos,
                        pointerId: Number.MAX_SAFE_INTEGER,
                    });
                }
                break;
            case "ArrowRight":
                if (!this.rightKeyDown) {
                    this.rightKeyDown = true;
                    // If moving left, release it first before starting right
                    if (this.leftKeyDown) {
                        this.leftKeyDown = false;
                        EventBus.emit(GameInputEvent.UP, {
                            pos: this.leftEdgePos,
                            pointerId: Number.MAX_SAFE_INTEGER,
                        });
                    }
                    EventBus.emit(GameInputEvent.DOWN, {
                        pos: this.rightEdgePos,
                        pointerId: Number.MAX_SAFE_INTEGER,
                    });
                }
                break;
            case "Space":
                if (!this.spaceDown) {
                    this.spaceDown = true;
                    EventBus.emit(GameInputEvent.DOWN, {
                        pos: {
                            x: ConfigManager.get().GameWidth / 2,
                            y: 0,
                        },
                        pointerId: Number.MAX_SAFE_INTEGER,
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
                    EventBus.emit(GameInputEvent.UP, {
                        pos: this.leftEdgePos,
                        pointerId: Number.MAX_SAFE_INTEGER,
                    });
                }
                break;
            case "ArrowRight":
                if (this.rightKeyDown) {
                    this.rightKeyDown = false;
                    EventBus.emit(GameInputEvent.UP, {
                        pos: this.leftEdgePos,
                        pointerId: Number.MAX_SAFE_INTEGER,
                    });
                }
                break;
            case "Space":
                if (this.spaceDown) {
                    this.spaceDown = false;
                    EventBus.emit(GameInputEvent.UP, {
                        pos: {
                            x: ConfigManager.get().GameWidth / 2,
                            y: 0,
                        },
                        pointerId: Number.MAX_SAFE_INTEGER,
                    });
                }
                break;
        }
    }

    public update(): void {
        // Continuously fire MOVE event if a key is held down
        if (this.leftKeyDown) {
            EventBus.emit(GameInputEvent.MOVE, {
                pos: this.leftEdgePos,
                pointerId: Number.MAX_SAFE_INTEGER,
            });
        } else if (this.rightKeyDown) {
            EventBus.emit(GameInputEvent.MOVE, {
                pos: this.rightEdgePos,
                pointerId: Number.MAX_SAFE_INTEGER,
            });
        }
    }
}
