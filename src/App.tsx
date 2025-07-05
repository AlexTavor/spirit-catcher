import { useRef } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { EditorButton } from "./ui/config-editor/EditorButton";
import { LogButton } from "./ui/log/LogButton";

export function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    return (
        <div id="app">
            <div id="game-wrapper">
                <PhaserGame ref={phaserRef} />
                <EditorButton/>
                <LogButton />
            </div>
        </div>
    );
}
