// src/ui/game/upgrades/UpgradesView.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLevelState } from "../../hooks/useLevelState";
import { GameState } from "../../../game/logic/level/GameState";
import { CommandBus } from "../../../game/api/CommandBus";
import { GameCommands } from "../../../game/consts/GameCommands";
import { PlayerUpgradeType } from "../../../game/logic/upgrades/PlayerUpgradeType";
import { allUpgradeDefinitions } from "../../../game/logic/upgrades/data";
import { useUpgradeShortlist } from "../../hooks/useUpgradeShortlist";
import {
  Overlay,
  UpgradeCard,
  UpgradeDescription,
  UpgradesContainer,
  UpgradeTitle,
} from "./UpgradesView.styles";
import * as animations from "./UpgradesView.animations";

type ViewState = "entering" | "visible" | "exiting" | "hidden";

export const UpgradesView: React.FC = () => {
  const levelState = useLevelState();
  const shortlist = useUpgradeShortlist(); // <- dynamic shortlist from engine
  const [viewState, setViewState] = useState<ViewState>("hidden");
  const [selectedUpgrade, setSelectedUpgrade] = useState<PlayerUpgradeType | null>(null);

  // Enrich shortlist items with definitions (title/description)
  const upgradeCards = useMemo(() => {
    const defsByType = new Map(allUpgradeDefinitions.map(d => [d.type, d]));
    return shortlist
      .map(type => defsByType.get(type))
      .filter((d): d is NonNullable<typeof d> => !!d);
  }, [shortlist]);

  // Open when entering upgrade state; reset selection
  useEffect(() => {
    if (levelState?.gameState === GameState.UPGRADE_PLAYER && viewState === "hidden") {
      setSelectedUpgrade(null);
      setViewState("entering");
    }
  }, [levelState, viewState]);

  // Transition entering -> visible after entry animation
  useEffect(() => {
    if (viewState === "entering") {
      const t = setTimeout(
        () => setViewState("visible"),
        animations.TOTAL_ENTRY_ANIMATION_DURATION,
      );
      return () => clearTimeout(t);
    }
  }, [viewState]);

  const handleSelectUpgrade = (type: PlayerUpgradeType) => {
    if (viewState !== "visible") return;

    setSelectedUpgrade(type);
    CommandBus.emit(GameCommands.UPGRADE_PLAYER, { type });

    // let selection anim play, then resume gameplay
    setTimeout(() => {
      setViewState("exiting");
      CommandBus.emit(GameCommands.TRANSITION_TO_STATE, {
        newState: GameState.WAVE_STARTING,
      });
    }, animations.TOTAL_SELECTION_ANIMATION_DURATION);

    // hide overlay after exit
    setTimeout(() => setViewState("hidden"), animations.TOTAL_EXIT_TRANSITION_DURATION);
  };

  if (viewState === "hidden") return null;

  return (
    <Overlay viewState={viewState} isSelected={!!selectedUpgrade}>
      <UpgradesContainer>
        {upgradeCards.map((def, index) => {
          let selectionState: "selected" | "faded" | "none" = "none";
          if (selectedUpgrade) {
            selectionState = selectedUpgrade === def.type ? "selected" : "faded";
          }
          return (
            <UpgradeCard
              key={def.type}
              index={index}
              viewState={viewState}
              selectionState={selectionState}
              onClick={() => handleSelectUpgrade(def.type)}
            >
              <UpgradeTitle>{def.title}</UpgradeTitle>
              <UpgradeDescription>{def.description}</UpgradeDescription>
            </UpgradeCard>
          );
        })}
      </UpgradesContainer>
    </Overlay>
  );
};
