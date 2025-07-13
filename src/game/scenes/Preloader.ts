import { Scene } from "phaser";
import { ConfigManager } from "../api/ConfigManager";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on("progress", (progress: number) => {
            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + 460 * progress;
        });
    }

    preload() {
        this.load.json("patterns", "data/patterns.json");
        this.load.json("mobs", "data/mobs.json");
        this.load.json("levels", "data/levels.json");

        /*

        this.load.atlas(
            "plants",
            "assets/atlases/plants.png",
            "assets/atlases/plants.json",
        );
        */
    }

    create() {
        this.scene.start(ConfigManager.get().EntryScene);
    }
}

