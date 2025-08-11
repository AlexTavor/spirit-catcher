import { ConfigManager } from "../../consts/ConfigManager";
import { getPlayerEntity } from "../../utils/getPlayerEntity";
import { ViewContext } from "../core/View";
import { DragState } from "../../logic/input/DragState";
import { Pos } from "../../../utils/Math";
import { GameObjects } from "phaser";
import { IsInputDown } from "../../logic/input/IsInputDown";

export class ThumbstickUIView {
    private context: ViewContext;

    // --- Style & Layout ---
    private readonly BASE_Y_OFFSET = -50;
    private readonly DEAD_ZONE_RADIUS = 30;
    private readonly ARROW_SIZE = 25;
    private readonly ARROW_OFFSET_X = 50;

    private readonly INACTIVE_COLOR = 0xaaaaaa;
    private readonly INACTIVE_ALPHA = 0.5;
    private readonly ACTIVE_COLOR = 0xffffff;
    private readonly ACTIVE_ALPHA = 0.9;

    private position: Pos;

    constructor(context: ViewContext) {
        this.context = context;
        const config = ConfigManager.get();
        this.position = {
            x: config.GameWidth / 2,
            y: config.GameHeight + this.BASE_Y_OFFSET,
        };
    }

    public update(): void {
        const player = getPlayerEntity(this.context.ecs);
        if (player === -1) return;

        const isInputDown = this.context.ecs.hasComponent(player, IsInputDown);
        const dragState = this.context.ecs.getComponent(player, DragState);

        if (!isInputDown || !dragState) return;

        const delta = dragState.currentX - dragState.startX;

        const isMovingRight = delta > 2;
        const isMovingLeft = delta < -2;
        const isMoving = isMovingLeft || isMovingRight;

        this.position.x = dragState.startX;

        this.context.dynamicGraphics.draw(
            this.position.x,
            this.position.y,
            (g) => {
                g.fillStyle(
                    isMoving ? this.INACTIVE_COLOR : this.ACTIVE_COLOR,
                    isMoving ? this.INACTIVE_ALPHA : this.ACTIVE_ALPHA,
                );
                g.fillCircle(0, 0, this.DEAD_ZONE_RADIUS);

                // Left Arrow
                const leftColor = isMovingLeft
                    ? this.ACTIVE_COLOR
                    : this.INACTIVE_COLOR;
                const leftAlpha = isMovingLeft
                    ? this.ACTIVE_ALPHA
                    : this.INACTIVE_ALPHA;
                this.drawArrow(
                    g,
                    -this.ARROW_OFFSET_X,
                    leftColor,
                    leftAlpha,
                    true,
                );

                // Right Arrow
                const rightColor = isMovingRight
                    ? this.ACTIVE_COLOR
                    : this.INACTIVE_COLOR;
                const rightAlpha = isMovingRight
                    ? this.ACTIVE_ALPHA
                    : this.INACTIVE_ALPHA;
                this.drawArrow(
                    g,
                    this.ARROW_OFFSET_X,
                    rightColor,
                    rightAlpha,
                    false,
                );
            },
        );
    }

    private drawArrow(
        g: GameObjects.Graphics,
        offsetX: number,
        color: number,
        alpha: number,
        isLeft: boolean,
    ): void {
        const direction = isLeft ? -1 : 1;
        const x1 = offsetX + direction * this.ARROW_SIZE;
        const y1 = 0;
        const x2 = offsetX;
        const y2 = -this.ARROW_SIZE;
        const x3 = offsetX;
        const y3 = this.ARROW_SIZE;

        g.fillStyle(color, alpha);
        g.fillTriangle(x1, y1, x2, y2, x3, y3);
    }

    public destroy(): void {
        // Nothing to destroy, as it uses the shared DynamicGraphics.
    }
}
