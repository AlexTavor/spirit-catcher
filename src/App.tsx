import { useRef } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { VersionDisplay } from "./ui/VersionDisplay";
import { WaveMessageOverlay } from "./ui/game/WaveMessageOverlay";
import { PreGameView } from "./ui/game/PreGameView";
import { ScoreDisplay } from "./ui/game/ScoreDisplay";
import { GameLostView } from "./ui/game/GameLostView";
import { HealthBar } from "./ui/game/HealthBar";
import { GameWonView } from "./ui/game/GameWonView";
import { UpgradesView } from "./ui/game/upgrades/UpgradesView";

export function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    return (
        <div id="app">
            <div id="game-wrapper">
                <PhaserGame ref={phaserRef} />
                {/*<ToolsContainer/>*/}
                <VersionDisplay/>
                <WaveMessageOverlay/>
                <PreGameView/>
                <GameLostView/>
                <GameWonView/>
                <UpgradesView/>
                <HealthBar/>
                <ScoreDisplay/>
            </div>
        </div>
    );
}
