import { Scene } from "phaser";
import { ECS, Entity } from "../logic/core/ECS";
import { View } from "./views/View";
import { Charging } from "../logic/components/Charging";
import { ChargingView } from "./views/ChargingView";
import { Transform } from "../logic/components/Transform";
import { NoiseView } from "./views/NoiseView";
import { Layers } from "./core/Layers";
import { backgroundConfig, groundConfig } from "../consts/backgrounds";
import { PlayerView } from "./views/PlayerView";
import { TapInput } from "./core/TapInput";
import { Pos } from "../../utils/Math";
import { EventBus } from "../api/EventBus";
import { GROUND_EVENTS } from "../logic/systems/MovementInputSystem";
import { GameUIEvent } from "../consts/GameUIEvent";
import { Boomerang } from "../logic/boomerang/components/Boomerang";
import { BoomerangView } from "./views/BoomerangView";
import { KeyboardInput } from "./core/KeyboardInput";
import { ConfigManager } from "../api/ConfigManager";
import { Player } from "../logic/player/components/Player";
import { Explosion } from "../logic/explosion/Explosion";
import { ExplosionView } from "./views/ExplosionView";

// Define a type for a constructable class that extends View
type ConstructableView = new (scene: Scene, ecs: ECS, entity: Entity) => View;

export class GameDisplay {
    private scene: Scene;
    private viewRegistry = new Map<Function, ConstructableView>();
    private views = new Map<Entity, Map<Function, View>>();
    private ecs: ECS;
    private groundInput: TapInput;
    private backgroundInput: TapInput;
    private backgroundView: NoiseView;
    private keyboardInput: KeyboardInput;
    private groundView: NoiseView;
    private layers: Layers;

    constructor(scene: Scene, ecs: ECS) {
        this.ecs = ecs;
        this.scene = scene;
        this.layers = new Layers(scene);

        this.backgroundView = new NoiseView(scene, this.layers.Background, {
            ...backgroundConfig(),
            depth: -100,
        });

        const groundConfigData = groundConfig();
        this.groundView = new NoiseView(scene, this.layers.Ground, {
            ...groundConfigData,
            position: {
                x: groundConfigData.width / 2,
                y: ConfigManager.get().GameHeight - groundConfigData.height / 2,
            },
        });

        this.keyboardInput = new KeyboardInput();

        this.registerViewClass(Charging, ChargingView);
        this.registerViewClass(Player, PlayerView);
        this.registerViewClass(Boomerang, BoomerangView);
        this.registerViewClass(Explosion, ExplosionView);

        this.addInputs();
    }

    addInputs() {
        this.groundInput = new TapInput(
            this.groundView.image,
            (pos: Pos) => EventBus.emit(GROUND_EVENTS.DOWN, pos),
            (pos: Pos) => EventBus.emit(GROUND_EVENTS.UP, pos),
            (pos: Pos) => EventBus.emit(GROUND_EVENTS.MOVE, pos),
        );

        this.backgroundInput = new TapInput(
            this.backgroundView.image,
            (pos: Pos) => {
                EventBus.emit(GameUIEvent.TAP_START, pos);
            },
            (pos: Pos) => {
                EventBus.emit(GameUIEvent.TAP_END, pos);
            },
            (_pos: Pos) => {
                // Handle background tap move if needed
            },
        );
    }

    public registerViewClass(
        componentClass: Function,
        viewClass: ConstructableView,
    ): void {
        this.viewRegistry.set(componentClass, viewClass);
    }

    public update(delta: number): void {
        const ecs = this.ecs;

        this.keyboardInput.update();

        const renderableEntities = new Set(
            ecs.getEntitiesWithComponent(Transform),
        );

        // Pass 1: Create new views and update existing ones for renderable entities
        for (const entity of renderableEntities) {
            let entityViews = this.views.get(entity);

            // Check registry to see what views *should* exist
            for (const [
                componentClass,
                ViewClass,
            ] of this.viewRegistry.entries()) {
                if (ecs.hasComponent(entity, componentClass)) {
                    // This component requires a view. Ensure it exists.
                    if (!entityViews) {
                        entityViews = new Map<Function, View>();
                        this.views.set(entity, entityViews);
                    }
                    if (!entityViews.has(componentClass)) {
                        const newView = new ViewClass(this.scene, ecs, entity);
                        entityViews.set(componentClass, newView);
                    }
                }
            }

            // Update all active views for this entity
            if (entityViews) {
                for (const view of entityViews.values()) {
                    view.update(delta);
                }
            }
        }

        // Pass 2: Clean up views that should no longer exist
        for (const [entity, entityViews] of this.views.entries()) {
            if (!renderableEntities.has(entity)) {
                // Entity is no longer renderable, destroy all its views
                for (const view of entityViews.values()) {
                    view.destroy();
                }
                this.views.delete(entity);
                continue;
            }

            // Entity is still renderable, check for removed components
            for (const componentClass of entityViews.keys()) {
                if (!ecs.hasComponent(entity, componentClass)) {
                    entityViews.get(componentClass)!.destroy();
                    entityViews.delete(componentClass);
                }
            }
        }
    }

    public destroy(): void {
        for (const entityViews of this.views.values()) {
            for (const view of entityViews.values()) {
                view.destroy();
            }
        }
        this.views.clear();
        this.viewRegistry.clear();

        this.backgroundView.destroy();
        this.groundView.destroy();

        this.backgroundInput.destroy();
        this.groundInput.destroy();
        this.keyboardInput.destroy();
    }
}
