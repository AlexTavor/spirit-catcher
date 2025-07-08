import { Scene } from "phaser";
import { ECS, Entity } from "../logic/core/ECS";
import { View, ViewContext } from "./core/View";
import { Charging } from "../logic/components/Charging";
import { ChargingView } from "./views/ChargingView";
import { Transform } from "../logic/core/components/Transform";
import { NoiseView } from "./views/NoiseView";
import { Layers } from "./core/Layers";
import { backgroundConfig, groundConfig } from "../consts/backgrounds";
import { PlayerView } from "./views/PlayerView";
import { TapInput } from "./core/TapInput";
import { Pos } from "../../utils/Math";
import { EventBus } from "../api/EventBus";
import { Boomerang } from "../logic/boomerang/components/Boomerang";
import { BoomerangView } from "./views/BoomerangView";
import { ConfigManager } from "../api/ConfigManager";
import { Player } from "../logic/player/components/Player";
import { Explosion } from "../logic/explosion/Explosion";
import { ExplosionView } from "./views/ExplosionView";
import { GameInputEvent } from "../logic/api/GameInputEvent";
import { DynamicGraphics } from "./core/DynamicGraphics";
import { ThumbstickUIView } from "./views/ThumbstickUIView";
import { Mob } from "../logic/mobs/components/Mob";
import { MobView } from "./views/MobView";

// Define a type for a constructable class that extends View
type ConstructableView = new (context: ViewContext, entity: Entity) => View;

export class GameDisplay {
    private scene: Scene;
    private viewRegistry = new Map<Function, ConstructableView>();
    private views = new Map<Entity, Map<Function, View>>();
    private ecs: ECS;
    private tapInput: TapInput;
    private backgroundView: NoiseView;
    private groundView: NoiseView;
    private layers: Layers;
    private dynamicGraphics: DynamicGraphics;
    private readonly viewContext: ViewContext;
    private readonly thumbstickView: ThumbstickUIView;

    constructor(scene: Scene, ecs: ECS) {
        this.ecs = ecs;
        this.scene = scene;
        this.layers = new Layers(scene);
        this.dynamicGraphics = new DynamicGraphics(
            scene,
            this.layers.Foreground,
        );

        this.viewContext = {
            scene: this.scene,
            ecs: this.ecs,
            dynamicGraphics: this.dynamicGraphics,
        };

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

        this.thumbstickView = new ThumbstickUIView(this.viewContext);

        this.registerViewClass(Charging, ChargingView);
        this.registerViewClass(Player, PlayerView);
        this.registerViewClass(Boomerang, BoomerangView);
        this.registerViewClass(Explosion, ExplosionView);
        this.registerViewClass(Mob, MobView);

        this.addInputs();
    }

    addInputs() {
        this.tapInput = new TapInput(
            this.scene.input,
            (pos: Pos, pointerId: number) =>
                EventBus.emit(GameInputEvent.DOWN, { pos, pointerId }),
            (pos: Pos, pointerId: number) =>
                EventBus.emit(GameInputEvent.UP, { pos, pointerId }),
            (pos: Pos, pointerId: number) =>
                EventBus.emit(GameInputEvent.MOVE, { pos, pointerId }),
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

        this.dynamicGraphics.clear();

        this.thumbstickView.update();

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
                        const newView = new ViewClass(this.viewContext, entity);
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

        this.tapInput.destroy();

        this.dynamicGraphics.destroy();
    }
}
