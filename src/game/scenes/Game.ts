import { EventBus } from "../api/EventBus.ts";
import { Scene } from "phaser";
import { ECS } from "../logic/core/ECS.ts";
import { setSceneType } from "../../ui/hooks/useActiveSceneType.ts";
import { ConfigManager } from "../consts/ConfigManager.ts";
import { GameDisplay } from "../display/GameDisplay.ts";
import { BoomerangPhysicsSystem } from "../logic/boomerang/systems/BoomerangPhysicsSystem.ts";
import { BoomerangBoundaryCollisionSystem } from "../logic/boomerang/systems/BoomerangBoundaryCollisionSystem.ts";
import { CeilingCollisionBounceSystem } from "../logic/boomerang/systems/CeilingCollisionBounceSystem.ts";
import { GroundCollisionSystem } from "../logic/boomerang/systems/GroundCollisionSystem.ts";
import { WallCollisionBounceSystem } from "../logic/boomerang/systems/WallCollisionBounceSystem.ts";
import { Transform } from "../logic/core/components/Transform.ts";
import { HasBoomerang } from "../logic/player/components/HasBoomerang.ts";
import { Player } from "../logic/player/components/Player.ts";
import { PlayerBoomerangCollisionSystem } from "../logic/player/systems/PlayerBoomerangCollisionSystem.ts";
import { ThrowBoomerangSystem } from "../logic/player/systems/ThrowBoomerangSystem.ts";
import { FlagCleanupSystem } from "../logic/systems/FlagCleanupSystem.ts";
import { ExplosionSystem } from "../logic/explosion/ExplosionSystem.ts";
import { GroundedBoomerangCleanupSystem } from "../logic/boomerang/systems/GroundedBoomerangCleanupSystem.ts";
import { DragInput } from "../logic/input/DragInput.ts";
import { TimeManager } from "../logic/core/time/TimeManager.ts";
import { UICommandSystem } from "../logic/input/UICommandSystem.ts";
import { GameEvents } from "../consts/GameEvents.ts";
import { BoomerangCleanupSystem } from "../logic/boomerang/systems/BoomerangCleanupSystem.ts";
import { BoomerangNudgeSystem } from "../logic/boomerang/systems/BoomerangNudgeSystem.ts";
import { PlayerPositionUpdateSystem } from "../logic/player/systems/PlayerPositionUpdateSystem.ts";
import { GameTransitionCommandSystem } from "../logic/level/GameTransitionCommandSystem.ts";
import { SpiritInstantiationSystem } from "../logic/spirits/systems/SpiritInstantiationSystem.ts";
import { SpiritLiftSystem } from "../logic/spirits/systems/SpiritLiftSystem.ts";
import { SpiritCeilingCollisionSystem } from "../logic/spirits/systems/SpiritCeilingCollisionSystem.ts";
import { SpiritBoomerangCollisionSystem } from "../logic/spirits/systems/SpiritBoomerangCollisionSystem.ts";
import { LevelUiUpdateSystem } from "../logic/level/LevelUiUpdateSystem.ts";
import { LevelStateUpdateSystem } from "../logic/level/LevelStateUpdateSystem.ts";
import { LevelTransitionSystem } from "../logic/level/LevelTransitionSystem.ts";
import { registerForResize } from "../utils/registerForResize.ts";
import { ActiveModifiersComponent } from "../logic/core/modifiers/ActiveModifiersComponent.ts";
import { ModifierSystem } from "../logic/core/modifiers/ModifierSystem.ts";
import { UpgradesSystem } from "../logic/upgrades/UpgradesSystem.ts";
import { BoomerangNoDragBrakeSystem } from "../logic/boomerang/systems/BoomerangNoDragBrakeSystem.ts";
import {
    ActiveConductorState,
    WaveConductorSystem,
} from "../logic/wave_conductor/WaveConductorSystem.ts";
import { WaveEndDetectorSystem } from "../logic/wave_conductor/WaveEndDetectorSystem.ts";
import { GameLostDetectionSystem } from "../logic/level/GameLostDetectionSystem.ts";
import { DirectForceControllerSystem } from "../logic/boomerang/systems/DirectForceControllerSystem.ts";

export class Game extends Scene {
    gameDisplay: GameDisplay;
    ecs: ECS;

    destroyQueue: Array<() => void> = [];

    constructor() {
        super("Game");
    }

    update(time: number, delta: number) {
        const d = TimeManager.timescale() * delta;
        super.update(time, d);
        this.ecs?.update(d);
        this.gameDisplay?.update(d);
    }

    create() {
        EventBus.emit("current-scene-ready", this);
        setSceneType("game");

        const cleanupResize = registerForResize(this);
        this.destroyQueue.push(cleanupResize);

        this.ecs = new ECS();
        this.gameDisplay = new GameDisplay(this, this.ecs);

        this.ecs.addComponent(this.ecs.world, new ActiveModifiersComponent());

        // --- Player Systems ---
        this.ecs.addSystem(new ThrowBoomerangSystem());
        this.ecs.addSystem(new PlayerPositionUpdateSystem());
        //this.ecs.addSystem(new BoomerangNudgeSystem());
        this.ecs.addSystem(new DirectForceControllerSystem());

        // --- Level Direction ---
        this.ecs.addSystem(new GameTransitionCommandSystem());
        this.ecs.addSystem(new UICommandSystem());
        this.ecs.addSystem(new LevelUiUpdateSystem());
        this.ecs.addSystem(new LevelTransitionSystem());

        // --- Wave Systems ---
        this.ecs.addSystem(new WaveConductorSystem());
        this.ecs.addComponent(this.ecs.world, new ActiveConductorState());

        // --- Game Logic Systems ---
        this.ecs.addSystem(new ModifierSystem());
        this.ecs.addSystem(new BoomerangPhysicsSystem());
        this.ecs.addSystem(new BoomerangBoundaryCollisionSystem());
        this.ecs.addSystem(new GroundCollisionSystem());
        this.ecs.addSystem(new WallCollisionBounceSystem());
        this.ecs.addSystem(new CeilingCollisionBounceSystem());
        this.ecs.addSystem(new PlayerBoomerangCollisionSystem());
        this.ecs.addSystem(new ExplosionSystem());
        this.ecs.addSystem(new LevelStateUpdateSystem());
        this.ecs.addSystem(new UpgradesSystem());
        this.ecs.addSystem(new BoomerangNoDragBrakeSystem());
        this.ecs.addSystem(new WaveEndDetectorSystem());
        this.ecs.addSystem(new GameLostDetectionSystem());

        // --- Special Abilities and Effects ---
        // this.ecs.addSystem(new WallExplosionSystem());
        // this.ecs.addSystem(new WallHitBoomerangDuplicatorSystem());

        // --- Spirit Systems ---
        this.ecs.addSystem(new SpiritInstantiationSystem());
        this.ecs.addSystem(new SpiritLiftSystem());
        this.ecs.addSystem(new SpiritCeilingCollisionSystem());
        this.ecs.addSystem(new SpiritBoomerangCollisionSystem());

        // --- Cleanup Systems ---
        this.ecs.addSystem(new GroundedBoomerangCleanupSystem());
        this.ecs.addSystem(new FlagCleanupSystem());
        this.ecs.addSystem(new BoomerangCleanupSystem());

        this.events.on("destroy", this.destroy.bind(this));
        this.createPlayer();

        // --- Input Systems ---
        const dragInput = new DragInput(this.ecs);
        this.destroyQueue.push(() => dragInput.destroy());

        EventBus.emit(GameEvents.GAME_READY, this);
    }

    private createPlayer() {
        const config = ConfigManager.get();
        const player = this.ecs.addEntity();
        const playerTransform = new Transform();
        playerTransform.pos = {
            x: config.GameWidth / 2,
            y: config.GameHeight - config.PlayerHeight * 1.5, // Position the player above the ground
        };
        this.ecs.addComponent(player, playerTransform);
        this.ecs.addComponent(player, new Player());
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

