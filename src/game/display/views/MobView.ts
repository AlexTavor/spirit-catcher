import { ConfigManager } from "../../api/ConfigManager";
import { Health } from "../../logic/mobs/components/Health";
import { lerpColor } from "../../../utils/Color";
import { Entity } from "../../logic/core/ECS";
import { View, ViewContext } from "../core/View";
import { LiftResistance } from "../../logic/mobs/components/LiftResistance";

export class MobView extends View {
    private background: Phaser.GameObjects.Rectangle;
    private hpText: Phaser.GameObjects.Text;
    private lastKnownHp = -1;

    // --- Color Definitions ---
    // Standard Mobs (Purple/Red)
    private readonly FULL_HEALTH_COLOR = 0x8e5a9a;
    private readonly LOW_HEALTH_COLOR = 0x4a012d;

    // Resistant Mobs (Blue)
    private readonly FULL_HEALTH_BLUE_COLOR = 0x5b9bd5;
    private readonly LOW_HEALTH_BLUE_COLOR = 0x1f3852;

    constructor(context: ViewContext, entity: Entity) {
        super(context, entity);
        const config = ConfigManager.get();
        const size = config.MobWidth;

        this.background = this.context.scene.add.rectangle(
            size / 2,
            size / 2,
            size,
            size,
            this.FULL_HEALTH_COLOR,
        );
        this.viewContainer.add(this.background);

        this.hpText = this.context.scene.add.text(size / 2, size / 2, "", {
            font: "bold 32px Arial",
            color: "#ffffff",
        });
        this.hpText.setOrigin(0.5, 0.5);
        this.viewContainer.add(this.hpText);

        this.updateHealthDisplay();
    }

    public internalUpdate(_delta: number): void {
        this.updateHealthDisplay();
    }

    private updateHealthDisplay(): void {
        if (!this.hpText) {
            return;
        }

        const health = this.context.ecs.getComponent(this.entity, Health);
        if (!health) return;

        // Optimize: Only update if HP has changed
        if (health.hp === this.lastKnownHp) return;

        this.lastKnownHp = health.hp;
        const hpAsInt = Math.ceil(health.hp);
        this.hpText.setText(hpAsInt.toString());

        // Determine background color based on resistance and health
        const liftResistance = this.context.ecs.getComponent(
            this.entity,
            LiftResistance,
        );
        const healthPercent = Math.max(0, health.hp / health.maxHp);
        let newColor: number;

        if (liftResistance && liftResistance.resistance > 0) {
            // Mob has resistance, use the blue color scale.
            newColor = lerpColor(
                this.LOW_HEALTH_BLUE_COLOR,
                this.FULL_HEALTH_BLUE_COLOR,
                healthPercent,
            );
        } else {
            // No resistance, use the standard purple/red color scale.
            newColor = lerpColor(
                this.LOW_HEALTH_COLOR,
                this.FULL_HEALTH_COLOR,
                healthPercent,
            );
        }

        this.background.setFillStyle(newColor);
    }
}
