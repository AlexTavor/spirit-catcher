import { ConfigManager } from "../../api/ConfigManager";
import { Health } from "../../logic/mobs/components/Health";
import { lerpColor } from "../../../utils/Color";
import { Entity } from "../../logic/core/ECS";
import { View, ViewContext } from "../core/View";
import { MobDisplayType } from "../../logic/level/types";
import { MobDefinitionComponent } from "../../logic/mobs/components/MobDefinitionComponent";

export class MobView extends View {
    private background: Phaser.GameObjects.Rectangle;
    private hpText: Phaser.GameObjects.Text;
    private lastKnownHp = -1;

    // --- Color Definitions ---
    private readonly FULL_HEALTH_STANDARD_COLOR = 0x8e5a9a;
    private readonly LOW_HEALTH_STANDARD_COLOR = 0x4a012d;

    private readonly FULL_HEALTH_RESISTANT_COLOR = 0x5b9bd5;
    private readonly LOW_HEALTH_RESISTANT_COLOR = 0x1f3852;

    private readonly FULL_HEALTH_STRONG_COLOR = 0xbd5b5b;
    private readonly LOW_HEALTH_STRONG_COLOR = 0x521f1f;

    constructor(context: ViewContext, entity: Entity) {
        super(context, entity);
        const config = ConfigManager.get();
        const size = config.MobWidth;

        this.background = this.context.scene.add.rectangle(
            size / 2,
            size / 2,
            size,
            size,
            this.FULL_HEALTH_STANDARD_COLOR,
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
        const definition = this.context.ecs.getComponent(
            this.entity,
            MobDefinitionComponent,
        );

        if (!health || !definition) return;

        // Optimize: Only update if HP has changed
        if (health.hp === this.lastKnownHp) return;
        this.lastKnownHp = health.hp;

        const hpAsInt = Math.ceil(health.hp);
        this.hpText.setText(hpAsInt.toString());

        // Determine background color based on DisplayType and health
        const healthPercent = Math.max(0, health.hp / health.maxHp);
        let highColor: number;
        let lowColor: number;

        switch (definition.displayType) {
            case MobDisplayType.Resistant:
                highColor = this.FULL_HEALTH_RESISTANT_COLOR;
                lowColor = this.LOW_HEALTH_RESISTANT_COLOR;
                break;
            case MobDisplayType.Strong:
                highColor = this.FULL_HEALTH_STRONG_COLOR;
                lowColor = this.LOW_HEALTH_STRONG_COLOR;
                break;
            case MobDisplayType.Standard:
            default:
                highColor = this.FULL_HEALTH_STANDARD_COLOR;
                lowColor = this.LOW_HEALTH_STANDARD_COLOR;
                break;
        }

        const newColor = lerpColor(lowColor, highColor, healthPercent);
        this.background.setFillStyle(newColor);
    }
}
