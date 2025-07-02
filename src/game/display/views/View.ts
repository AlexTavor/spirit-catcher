import { GameObjects, Scene } from "phaser";
import { ECS, Entity } from "../../logic/core/ECS";
import { Transform } from "../../logic/components/Transform";

export abstract class View {
    public readonly entity: Entity;
    public readonly viewContainer: GameObjects.Container;
    protected readonly scene: Scene;
    protected readonly ecs: ECS;

    constructor(scene: Scene, ecs: ECS, entity: Entity) {
        this.scene = scene;
        this.ecs = ecs;
        this.entity = entity;
        this.viewContainer = scene.add.container(0, 0);

        // Immediately update position upon creation
        this.update(0);
    }

    /**
     * Final update method called by GameDisplay. Updates position and
     * calls the subclass's specific update logic.
     * @param delta Time in milliseconds since the last frame.
     */
    public update(delta: number): void {
        const transform = this.ecs.getComponent(this.entity, Transform);
        if (transform) {
            this.viewContainer.setPosition(transform.pos.x, transform.pos.y);
        }

        this.internalUpdate(delta);
    }

    /**
     * Abstract method for subclasses to implement their specific update logic,
     * such as handling animations.
     * @param delta Time in milliseconds since the last frame.
     */
    public abstract internalUpdate(delta: number): void;

    /**
     * Destroys the view's container and all its children.
     */
    public destroy(): void {
        this.viewContainer.destroy();
    }
}
