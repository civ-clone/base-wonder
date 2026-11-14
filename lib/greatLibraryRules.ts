import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  RequirementRegistry,
  instance as requirementRegistryInstance,
} from '@civ-clone/core-requirement/RequirementRegistry';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import Advance from '@civ-clone/core-science/Advance';
import Complete from '@civ-clone/core-science/Rules/Complete';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Wonder from '@civ-clone/core-wonder/Wonder';
import { isObsolete } from './obsolete';
import { standingOfType } from './obsoleteRules';

export interface GreatLibraryOptions {
  /** The Wonder that gives the advances. */
  GreatLibrary: typeof Wonder;
  /** How many players must have an advance, the one completing it included, before the owner is given it. */
  holders: number;
  /** Which players' research counts towards `holders` (default: everyone's). */
  counts?: (playerResearch: PlayerResearch) => boolean;
}

/**
 * The Great Library's `Complete` rule (no id): as anyone completes an advance, the owner of a standing, unobsolete
 *  `GreatLibrary` who doesn't have it yet is given it once `holders` players have it. Civilization's needs 3, Civilization
 *  II's 2 other than the owner (OpenCiv2 `civ_give_advance`, richardpenman/civ2@49f26ec, counts civilizations 1 to 7).
 */
export const greatLibraryRules = (
  { GreatLibrary, holders, counts = (): boolean => true }: GreatLibraryOptions,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  requirementRegistry: RequirementRegistry = requirementRegistryInstance
): Complete[] => {
  const ownerResearch = (): PlayerResearch => {
    const [owningPlayer] = wonderRegistry
      .filter(standingOfType(GreatLibrary))
      .map((greatLibrary: Wonder): Player => greatLibrary.city().player());

    return playerResearchRegistry.getByPlayer(owningPlayer);
  };

  return [
    new Complete(
      new Criterion(
        (): boolean =>
          wonderRegistry.some(standingOfType(GreatLibrary)) &&
          !isObsolete(GreatLibrary, playerResearchRegistry, requirementRegistry)
      ),
      new Criterion(
        (playerResearch: PlayerResearch, completedResearch: Advance): boolean =>
          !ownerResearch().completed(completedResearch.sourceClass())
      ),
      new Criterion(
        (playerResearch: PlayerResearch, completedResearch: Advance): boolean =>
          playerResearchRegistry.filter(
            (playerResearch: PlayerResearch): boolean =>
              counts(playerResearch) &&
              playerResearch.completed(completedResearch.sourceClass())
          ).length >= holders
      ),
      new Effect(
        (playerResearch: PlayerResearch, completedResearch: Advance): void =>
          ownerResearch().addAdvance(completedResearch.sourceClass())
      )
    ),
  ];
};

export default greatLibraryRules;
