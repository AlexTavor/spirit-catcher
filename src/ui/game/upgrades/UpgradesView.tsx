import React, { useEffect, useState } from "react";
import { useLevelState } from "../../hooks/useLevelState";
import { GameState } from "../../../game/logic/level/GameState";
import { CommandBus } from "../../../game/api/CommandBus";
import { GameCommands, PlayerUpgradeType } from "../../../game/consts/GameCommands";
import { Overlay, UpgradeCard, UpgradeDescription, UpgradesContainer, UpgradeTitle } from "./UpgradesView.styles";
import * as animations from "./UpgradesView.animations";

const upgradeOptions = [
    {
        type: PlayerUpgradeType.UP_RANG_SIZE,
        title: "Bigger 'Rang",
        description: "Increases the size of your boomerang.",
    },
    {
        type: PlayerUpgradeType.UP_MAX_HEALTH,
        title: "More Health",
        description: "Increases your maximum health.",
    },
    {
        type: PlayerUpgradeType.HEAL,
        title: "Heal",
        description: "Restores 50% of your maximum health.",
    },
];

type ViewState = "entering" | "visible" | "exiting" | "hidden";

export const UpgradesView: React.FC = () => {
    const levelState = useLevelState();
    const [viewState, setViewState] = useState<ViewState>("hidden");
    const [selectedUpgrade, setSelectedUpgrade] = useState<PlayerUpgradeType | null>(null);

    // Effect to control the view's lifecycle based on game state
    useEffect(() => {
        if (levelState?.gameState === GameState.UPGRADE_PLAYER && viewState === "hidden") {
            setSelectedUpgrade(null);
            setViewState("entering");
        }
    }, [levelState, viewState]);

    // Effect to transition from 'entering' to 'visible'
    useEffect(() => {
        if (viewState === "entering") {
            const timer = setTimeout(() => {
                setViewState("visible");
            }, animations.TOTAL_ENTRY_ANIMATION_DURATION);
            return () => clearTimeout(timer);
        }
    }, [viewState]);

    const handleSelectUpgrade = (type: PlayerUpgradeType) => {
        if (viewState !== "visible") return;

        setSelectedUpgrade(type);
        CommandBus.emit(GameCommands.UPGRADE_PLAYER, { type });

        setTimeout(() => {
            setViewState("exiting");
            CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {
                newState: GameState.WAVE_STARTING,
            });
        }, animations.TOTAL_SELECTION_ANIMATION_DURATION);

        setTimeout(() => {
            setViewState("hidden");
        }, animations.TOTAL_EXIT_TRANSITION_DURATION);
    };

    if (viewState === "hidden") {
        return null;
    }

    return (
        <Overlay viewState={viewState} isSelected={!!selectedUpgrade}>
            <UpgradesContainer>
                {upgradeOptions.map((upgrade, index) => {
                    let selectionState: "selected" | "faded" | "none" = "none";
                    if (selectedUpgrade) {
                        selectionState = selectedUpgrade === upgrade.type ? "selected" : "faded";
                    }
                    return (
                        <UpgradeCard
                            key={upgrade.type}
                            index={index}
                            viewState={viewState}
                            selectionState={selectionState}
                            onClick={() => handleSelectUpgrade(upgrade.type)}
                        >
                            <UpgradeTitle>{upgrade.title}</UpgradeTitle>
                            <UpgradeDescription>{upgrade.description}</UpgradeDescription>
                        </UpgradeCard>
                    );
                })}
            </UpgradesContainer>
        </Overlay>
    );
};