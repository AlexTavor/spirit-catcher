import { GameObjects, Input as PhaserInput } from "phaser";
import { Pos } from "../../../utils/Math";

type TapCallback = (pos: Pos) => void;

export class TapInput {
    private target: GameObjects.GameObject;
    private onDown: TapCallback;
    private onUp: TapCallback;
    private onMove?: TapCallback;

    constructor(
        target: GameObjects.GameObject,
        onDown: TapCallback,
        onUp: TapCallback,
        onMove?: TapCallback,
    ) {
        this.target = target;
        this.onDown = onDown;
        this.onUp = onUp;
        this.onMove = onMove;

        this.target.setInteractive();
        this.target.on("pointerdown", this.handlePointerDown, this);
        this.target.on("pointerup", this.handlePointerUp, this);
        this.target.on("pointerout", this.handlePointerOut, this);
        if (this.onMove) {
            this.target.on("pointermove", this.handlePointerMove, this);
        }
    }

    handlePointerOut(pointer: PhaserInput.Pointer): void {
        this.onUp({ x: pointer.worldX, y: pointer.worldY });
    }

    private handlePointerDown(pointer: PhaserInput.Pointer): void {
        if (!pointer.isDown) return;
        this.onDown({ x: pointer.worldX, y: pointer.worldY });
    }

    private handlePointerUp(pointer: PhaserInput.Pointer): void {
        this.onUp({ x: pointer.worldX, y: pointer.worldY });
    }

    private handlePointerMove(pointer: PhaserInput.Pointer): void {
        if (!pointer.isDown || !this.onMove) return;
        this.onMove({ x: pointer.worldX, y: pointer.worldY });
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
