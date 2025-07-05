import { GameObjects, Input as PhaserInput } from "phaser";
import { Pos } from "../../../utils/Math";

/**
 * The callback for tap events, now including the pointer's unique ID.
 */
type TapCallback = (pos: Pos, pointerId: number) => void;

export class TapInput {
    private target: GameObjects.GameObject | PhaserInput.InputPlugin;
    private onDown: TapCallback;
    private onUp: TapCallback;
    private onMove?: TapCallback;

    constructor(
        target: GameObjects.GameObject | PhaserInput.InputPlugin,
        onDown: TapCallback,
        onUp: TapCallback,
        onMove?: TapCallback,
    ) {
        this.target = target;
        this.onDown = onDown;
        this.onUp = onUp;
        this.onMove = onMove;

        if (this.target instanceof GameObjects.GameObject) {
            this.target.setInteractive();
        }

        this.target.on("pointerdown", this.handlePointerDown, this);
        this.target.on("pointerup", this.handlePointerUp, this);
        this.target.on("pointerout", this.handlePointerOut, this);
        if (this.onMove) {
            this.target.on("pointermove", this.handlePointerMove, this);
        }
    }

    private handlePointerDown(pointer: PhaserInput.Pointer): void {
        if (!pointer.isDown) return;
        this.onDown({ x: pointer.worldX, y: pointer.worldY }, pointer.id);
    }

    private handlePointerUp(pointer: PhaserInput.Pointer): void {
        this.onUp({ x: pointer.worldX, y: pointer.worldY }, pointer.id);
    }

    /**
     * Treats a pointer leaving the object area as an 'up' event.
     */
    private handlePointerOut(pointer: PhaserInput.Pointer): void {
        this.onUp({ x: pointer.worldX, y: pointer.worldY }, pointer.id);
    }

    private handlePointerMove(pointer: PhaserInput.Pointer): void {
        if (!pointer.isDown || !this.onMove) return;
        this.onMove({ x: pointer.worldX, y: pointer.worldY }, pointer.id);
    }

    public destroy(): void {
        if (this.target) {
            this.target.off("pointerdown", this.handlePointerDown, this);
            this.target.off("pointerup", this.handlePointerUp, this);
            this.target.off("pointerout", this.handlePointerOut, this);
            if (this.onMove) {
                this.target.off("pointermove", this.handlePointerMove, this);
            }
        }
    }
}
