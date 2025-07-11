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
import { Transform } from "../logic/core/components/Transform.ts";
import { HasBoomerang } from "../logic/player/components/HasBoomerang.ts";
import { Player } from "../logic/player/components/Player.ts";
import { PlayerBoomerangCollisionSystem } from "../logic/player/systems/PlayerBoomerangCollisionSystem.ts";
import { ThrowBoomerangSystem } from "../logic/player/systems/ThrowBoomerangSystem.ts";
import { ChargingSystem } from "../logic/systems/ChargingSystem.ts";
import { FlagCleanupSystem } from "../logic/systems/FlagCleanupSystem.ts";
import { ExplosionSystem } from "../logic/explosion/ExplosionSystem.ts";
import { WallExplosionSystem } from "../logic/explosion/WallExplosionSystem.ts";
import { MoveIntention } from "../logic/input/MoveIntention.ts";
import { WallHitBoomerangDuplicatorSystem } from "../logic/wall-hit-duplicator/WallHitBoomerangDuplicatorSystem.ts";
import { GroundedBoomerangCleanupSystem } from "../logic/boomerang/systems/GroundedBoomerangCleanupSystem.ts";
import { KeyboardInputSystem } from "../logic/input/KeyboardInputSystem.ts";
import { LevelDirectorSystem } from "../logic/level/LevelDirectorSystem.ts";
import { BoomerangMobCollisionSystem } from "../logic/mobs/systems/BoomerangMobCollisionSystem.ts";
import { MobDeathHandlerSystem } from "../logic/mobs/systems/MobDeathHandlerSystem.ts";
import { DragMoveSystem } from "../logic/input/DragMoveSystem.ts";
import { MobSteppedDescentSystem } from "../logic/mobs/systems/MobSteppedDescentSystem.ts";
import { TimeManager } from "../logic/core/time/TimeManager.ts";
import { WaveManagerSystem } from "../logic/level/WaveManagerSystem.ts";
import { UICommandSystem } from "../logic/input/UICommandSystem.ts";
import { MobsQuickMarchSystem } from "../logic/mobs/systems/MobsQuickmarchSystem.ts";
import { GameEvent } from "../consts/GameUIEvent.ts";

export class Game extends Scene {
    gameDisplay: GameDisplay;
    ecs: ECS;

    destroyQueue: Array<() => void> = [];

    constructor() {
        super("Game");
    }

    update(time: number, delta: number) {
        const d = TimeManager.get() * delta;
        super.update(time, d);
        this.ecs?.update(d);
        this.gameDisplay?.update(d);
    }

    create() {
        EventBus.emit("current-scene-ready", this);
        setSceneType("game");
        this.ecs = new ECS();
        this.gameDisplay = new GameDisplay(this, this.ecs);

        // --- Pointer Input ---
        //this.ecs.addSystem(new ThumbstickInputSystem());
        this.ecs.addSystem(new DragMoveSystem());

        // --- Keyboard Input ---
        this.ecs.addSystem(new KeyboardInputSystem());

        // --- Player Intention Systems ---
        //this.ecs.addSystem(new MoveIntentionSystem());

        // --- Player Systems ---
        this.ecs.addSystem(new ChargingSystem());
        //this.ecs.addSystem(new MovementSystem());
        this.ecs.addSystem(new ThrowBoomerangSystem());

        // --- Level Direction ---
        this.ecs.addSystem(new LevelDirectorSystem());
        this.ecs.addSystem(new WaveManagerSystem());
        this.ecs.addSystem(new UICommandSystem());

        // --- Game Logic Systems ---
        this.ecs.addSystem(new BoomerangPhysicsSystem());
        this.ecs.addSystem(new BoundaryCollisionSystem());
        this.ecs.addSystem(new GroundCollisionSystem());
        this.ecs.addSystem(new WallCollisionBounceSystem());
        this.ecs.addSystem(new CeilingCollisionBounceSystem());
        this.ecs.addSystem(new PlayerBoomerangCollisionSystem());
        this.ecs.addSystem(new ExplosionSystem());

        // --- Special Abilities and Effects ---
        this.ecs.addSystem(new WallExplosionSystem());
        this.ecs.addSystem(new WallHitBoomerangDuplicatorSystem());

        // --- Mob Systems ---
        this.ecs.addSystem(new BoomerangMobCollisionSystem());
        this.ecs.addSystem(new MobDeathHandlerSystem());
        this.ecs.addSystem(new MobSteppedDescentSystem());
        this.ecs.addSystem(new MobsQuickMarchSystem());

        // --- Cleanup Systems ---
        this.ecs.addSystem(new GroundedBoomerangCleanupSystem());
        this.ecs.addSystem(new FlagCleanupSystem());

        this.events.on("destroy", this.destroy.bind(this));
        this.createPlayer();

        EventBus.emit(GameEvent.GAME_READY, this);
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
    }

    private destroy() {
        this.events.off("destroy", this.destroy);

        this.destroyQueue.forEach((fn) => fn());
        this.destroyQueue = [];

        this.gameDisplay.destroy();

        this.ecs.clearSystems();
    }
}

