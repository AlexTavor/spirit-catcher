import { useRef } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { EditorButton } from "./ui/config-editor/EditorButton";
import { LogButton } from "./ui/log/LogButton";
import { VersionDisplay } from "./ui/VersionDisplay";
import { WaveMessageOverlay } from "./ui/game/WaveMessageOverlay";
import { PreGameView } from "./ui/game/PreGameView";

export function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    return (
        <div id="app">
            <div id="game-wrapper">
                <PhaserGame ref={phaserRef} />
                <EditorButton/>
                <LogButton />
                <VersionDisplay/>
                <WaveMessageOverlay/>
                <PreGameView/>
            </div>
        </div>
    );
}
