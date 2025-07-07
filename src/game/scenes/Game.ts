import { EventBus } from "../api/EventBus.ts";
import { Scene } from "phaser";
import { ECS } from "../logic/core/ECS.ts";
import { setSceneType } from "../../ui/hooks/useActiveSceneType.ts";
import { ConfigManager } from "../api/ConfigManager.ts";
import { GameDisplay } from "../display/GameDisplay.ts";
import { BoomerangPhysicsSystem } from "../logic/boomerang/systems/BoomerangPhysicsSystem.ts";
import { BoundaryCollisionSystem } from "../logic/boomerang/systems/BoundaryCollisionSystem.ts";
import { CeilingCollisionBounceSystem } from "../logic/boomerang/systems/CeilingCollisionBounceSystem.ts";
import { GroundCollisionSystem } from "../logic/boomerang/systems/GroundCollisionSystem.ts";
import { WallCollisionBounceSystem } from "../logic/boomerang/systems/WallCollisionBounceSystem.ts";
import { Transform } from "../logic/components/Transform.ts";
import { HasBoomerang } from "../logic/player/components/HasBoomerang.ts";
import { Player } from "../logic/player/components/Player.ts";
import { MovementSystem } from "../logic/player/systems/MovementSystem.ts";
import { PlayerBoomerangCollisionSystem } from "../logic/player/systems/PlayerBoomerangCollisionSystem.ts";
import { ThrowBoomerangSystem } from "../logic/player/systems/ThrowBoomerangSystem.ts";
import { ChargingSystem } from "../logic/systems/ChargingSystem.ts";
import { FlagCleanupSystem } from "../logic/systems/FlagCleanupSystem.ts";
import { InputSystem } from "../logic/core/input/InputSystem.ts";
import { ExplosionSystem } from "../logic/explosion/ExplosionSystem.ts";
import { WallExplosionSystem } from "../logic/explosion/WallExplosionSystem.ts";
import { MoveIntention } from "../logic/intentions/MoveIntention.ts";
import { ChargeIntention } from "../logic/intentions/ChargeIntention.ts";
import { MoveIntentionSystem } from "../logic/intentions/MoveIntentionSystem.ts";
import { ChargeIntentionSystem } from "../logic/intentions/ChargeIntentionSystem.ts";
import { MovementAnalysisSystem } from "../logic/intentions/MovementAnalysisSystem.ts";
import { ChargeAnalysisSystem } from "../logic/intentions/ChargeAnalysisSystem.ts";
import { InputClassifierSystem } from "../logic/intentions/InputClassifierSystem.ts";

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
        this.ecs.addSystem(new InputClassifierSystem());
        this.ecs.addSystem(new MovementAnalysisSystem());
        this.ecs.addSystem(new ChargeAnalysisSystem());
        this.ecs.addSystem(new MoveIntentionSystem());
        this.ecs.addSystem(new ChargeIntentionSystem());
        this.ecs.addSystem(new ChargingSystem());
        this.ecs.addSystem(new MovementSystem());
        this.ecs.addSystem(new ThrowBoomerangSystem());

        this.ecs.addSystem(new BoomerangPhysicsSystem());
        this.ecs.addSystem(new BoundaryCollisionSystem());
        this.ecs.addSystem(new GroundCollisionSystem());
        this.ecs.addSystem(new WallCollisionBounceSystem());
        this.ecs.addSystem(new CeilingCollisionBounceSystem());
        this.ecs.addSystem(new PlayerBoomerangCollisionSystem());
        this.ecs.addSystem(new ExplosionSystem());
        this.ecs.addSystem(new WallExplosionSystem());
        this.ecs.addSystem(new FlagCleanupSystem());

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
        this.ecs.addComponent(player, new HasBoomerang());
        this.ecs.addComponent(player, new MoveIntention());
        this.ecs.addComponent(player, new ChargeIntention());
    }

    private destroy() {
        this.events.off("destroy", this.destroy);

        this.destroyQueue.forEach((fn) => fn());
        this.destroyQueue = [];

        this.gameDisplay.destroy();

        this.ecs.clearSystems();
    }
}

