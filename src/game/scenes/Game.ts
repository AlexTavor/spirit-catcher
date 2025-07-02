import { EventBus } from "../api/EventBus.ts";
import { Scene } from "phaser";
import { ECS } from "../logic/core/ECS.ts";
import { GameDisplay } from "../display/GameDisplay.ts";
import { setSceneType } from "../../ui/hooks/useActiveSceneType.ts";
import { InputSystem } from "../logic/systems/InputSystem.ts";
import { Player } from "../logic/components/Player.ts";
import { Transform } from "../logic/components/Transform.ts";
import { HasBoomerang } from "../logic/components/HasBoomerang.ts";
import { PlayerConfig } from "../logic/components/PlayerConfig.ts";
import { ChargingSystem } from "../logic/systems/ChargingSystem.ts";
import { MovementSystem } from "../logic/systems/MovementSystem.ts";
import { MovementInputSystem } from "../logic/systems/MovementInputSystem.ts";
import { ThrowBoomerangSystem } from "../logic/systems/ThrowBoomerangSystem.ts";
import { BoomerangPhysicsSystem } from "../logic/systems/BoomerangPhysicsSystem.ts";
import { BoundaryCollisionSystem } from "../logic/systems/BoundaryCollisionSystem.ts";
import { FlagCleanupSystem } from "../logic/systems/FlagCleanupSystem.ts";
import { CeilingCollisionBounceSystem } from "../logic/systems/CeilingCollisionBounceSystem.ts";
import { WallCollisionBounceSystem } from "../logic/systems/WallCollisionBounceSystem.ts";
import { PlayerBoomerangCollisionSystem } from "../logic/systems/PlayerBoomerangCollisionSystem.ts";
import { GroundCollisionSystem } from "../logic/systems/GroundCollisionSystem.ts";
import { ConfigManager } from "../api/ConfigManager.ts";

export class Game extends Scene {
    gameDisplay: GameDisplay;
    ecs: ECS;

    destroyQueue: Array<() => void> = [];

    constructor() {
        super("Game");
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        this.ecs?.update(delta);
        this.gameDisplay?.update(delta);
    }

    create() {
        EventBus.emit("current-scene-ready", this);
        setSceneType("game");
        this.ecs = new ECS();
        this.gameDisplay = new GameDisplay(this, this.ecs);

        this.ecs.addSystem(new InputSystem());
        this.ecs.addSystem(new ChargingSystem());
        this.ecs.addSystem(new MovementSystem());
        this.ecs.addSystem(new MovementInputSystem());
        this.ecs.addSystem(new ThrowBoomerangSystem());

        // --- Physics and Collision Pipeline ---

        // 1. Physics moves the boomerang
        this.ecs.addSystem(new BoomerangPhysicsSystem());

        // 2. We detect if the new position is out of bounds
        this.ecs.addSystem(new BoundaryCollisionSystem());
        this.ecs.addSystem(new GroundCollisionSystem());

        // 3. The response systems correct velocity and position
        this.ecs.addSystem(new WallCollisionBounceSystem());
        this.ecs.addSystem(new CeilingCollisionBounceSystem());

        this.ecs.addSystem(new PlayerBoomerangCollisionSystem());

        // 4. The cleanup system removes the temporary flags
        this.ecs.addSystem(new FlagCleanupSystem());

        // --- End of Physics and Collision Pipeline ---

        this.events.on("destroy", this.destroy.bind(this));
        this.createPlayer();
    }

    private createPlayer() {
        const player = this.ecs.addEntity();
        const playerTransform = new Transform();
        playerTransform.pos = {
            x: ConfigManager.get().GameWidth / 2,
            y:
                ConfigManager.get().GameHeight -
                ConfigManager.get().PlayerHeight * 1.5, // Position the player above the ground
        };
        this.ecs.addComponent(player, playerTransform);
        this.ecs.addComponent(player, new Player());
        this.ecs.addComponent(player, new PlayerConfig());
        this.ecs.addComponent(player, new HasBoomerang());
    }

    private destroy() {
        this.events.off("destroy", this.destroy);

        this.destroyQueue.forEach((fn) => fn());
        this.destroyQueue = [];

        this.gameDisplay.destroy();

        this.ecs.clearSystems();
    }
}

