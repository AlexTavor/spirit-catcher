import { useRef } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { VersionDisplay } from "./ui/VersionDisplay";
import { WaveMessageOverlay } from "./ui/game/WaveMessageOverlay";
import { PreGameView } from "./ui/game/PreGameView";
import { ToolsContainer } from "./ui/ToolsContainer";

export function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    return (
        <div id="app">
            <div id="game-wrapper">
                <PhaserGame ref={phaserRef} />
                <ToolsContainer/>
                <VersionDisplay/>
                <WaveMessageOverlay/>
                <PreGameView/>
            </div>
        </div>
    );
}
