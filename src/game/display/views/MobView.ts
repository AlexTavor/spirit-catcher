import { ConfigManager } from "../../api/ConfigManager";
import { Health } from "../../logic/mobs/components/Health";
import { lerpColor } from "../../../utils/Color";
import { Entity } from "../../logic/core/ECS";
import { View, ViewContext } from "../core/View";

export class MobView extends View {
    private background: Phaser.GameObjects.Rectangle;
    private hpText: Phaser.GameObjects.Text;
    private lastKnownHp = -1;

    // Colors for health interpolation
    private readonly FULL_HEALTH_COLOR = 0x8e5a9a;
    private readonly LOW_HEALTH_COLOR = 0x4a012d;

    constructor(context: ViewContext, entity: Entity) {
        super(context, entity);

        const config = ConfigManager.get();
        const size = config.MobWidth; // Assuming mobs are square

        // Create the background square
        this.background = this.context.scene.add.rectangle(
            size / 2,
            size / 2,
            size,
            size,
            this.FULL_HEALTH_COLOR,
        );
        this.viewContainer.add(this.background);

        // Create the HP text object
        this.hpText = this.context.scene.add.text(size / 2, size / 2, "", {
            font: "bold 32px Arial",
            color: "#ffffff",
        });
        this.hpText.setOrigin(0.5, 0.5); // Center the text
        this.viewContainer.add(this.hpText);

        // Initial update
        this.updateHealthDisplay();
    }

    // This is called every frame by the GameDisplay
    public internalUpdate(delta: number): void {
        this.updateHealthDisplay();
    }

    private updateHealthDisplay(): void {
        if (!this.hpText) {
            return;
        }

        const health = this.context.ecs.getComponent(this.entity, Health);
        if (!health) return;

        // Optimize: Only update the text and color if HP has changed
        if (health.hp === this.lastKnownHp) return;

        this.lastKnownHp = health.hp;
        const hpAsInt = Math.ceil(health.hp);
        this.hpText.setText(hpAsInt.toString());

        // Update background color based on health percentage
        const healthPercent = Math.max(0, health.hp / health.maxHp);
        const newColor = lerpColor(
            this.LOW_HEALTH_COLOR,
            this.FULL_HEALTH_COLOR,
            healthPercent,
        );
        this.background.setFillStyle(newColor);
    }
}
