import { ConfigManager } from "../../../api/ConfigManager";
import { Component, Entity } from "../../core/ECS";

/**
 * A component that tracks impact damage cooldowns for a mob.
 * This prevents a single boomerang from applying impact damage multiple times
 * as it passes through the mob in a single throw.
 */
export class HitCooldowns extends Component {
    // A map of [boomerangId, expirationTimestamp]
    private cooldowns = new Map<Entity, number>();
    private readonly cooldownDuration: number;

    constructor() {
        super();
        this.cooldownDuration =
            ConfigManager.get().BoomerangHitCooldownMs ?? 250;
    }

    /**
     * Checks if a specific boomerang is currently on cooldown for this mob.
     * If the cooldown has expired, it is automatically removed.
     * @param boomerangId The entity ID of the boomerang to check.
     * @returns True if the boomerang is on cooldown, false otherwise.
     */
    public isOnCooldown(boomerangId: Entity): boolean {
        if (!this.cooldowns.has(boomerangId)) {
            return false;
        }

        const expirationTime = this.cooldowns.get(boomerangId)!;
        const now = Date.now();

        if (now >= expirationTime) {
            // Cooldown has expired, so remove it and report not on cooldown.
            this.cooldowns.delete(boomerangId);
            return false;
        }

        // Cooldown is still active.
        return true;
    }

    /**
     * Puts a specific boomerang on cooldown for this mob.
     * @param boomerangId The entity ID of the boomerang that just applied impact damage.
     */
    public setCooldown(boomerangId: Entity): void {
        const expirationTime = Date.now() + this.cooldownDuration;
        this.cooldowns.set(boomerangId, expirationTime);
    }
}
