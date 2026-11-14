import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import Complete from '@civ-clone/core-science/Rules/Complete';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Wonder from '@civ-clone/core-wonder/Wonder';
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
export declare const greatLibraryRules: (
  { GreatLibrary, holders, counts }: GreatLibraryOptions,
  playerResearchRegistry?: PlayerResearchRegistry,
  wonderRegistry?: WonderRegistry,
  requirementRegistry?: RequirementRegistry
) => Complete[];
export default greatLibraryRules;
