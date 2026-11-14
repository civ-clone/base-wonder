import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import BuildPriority from '@civ-clone/core-city-build/Rules/BuildPriority';
import Unit from '@civ-clone/core-unit/Unit';
import Wonder from '@civ-clone/core-wonder/Wonder';
import Yield from '@civ-clone/core-yield/Yield';
export interface WonderPriorityOptions {
  /** The yield a city's shields are. */
  Production: typeof Yield;
  /** Whether a unit is a ship, for the Wonders that only help ships. */
  isShip: (unit: Unit) => boolean;
  /** Wonders that only help ships, so do nothing for a player with none. */
  forShips?: (typeof Wonder)[];
  /** Wonders that do a player more harm than good. */
  neverWanted?: (typeof Wonder)[];
  /** How much the Wonder is wanted. */
  priority?: number;
  /** The fewest shields a city must make to want one. */
  minimumShields?: number;
}
/** civ1-wonder's numbers (civ-clone/web-renderer#194). */
export declare const wonderPriority = 1.5;
export declare const wonderShields = 5;
/**
 * `<prefix>:city/build-priority/wonder`: how much a city on Auto, or a computer player, wants a Wonder. A little, next
 *  to what the city lacks, and only where it makes `minimumShields` or more, the Wonder isn't obsolete or never wanted,
 *  would do something for its player (a ship Wonder needs a ship), and none of the player's other cities is building
 *  it already.
 */
export declare const wonderPriorityRules: (
  prefix: string,
  {
    Production,
    isShip,
    forShips,
    neverWanted,
    priority,
    minimumShields,
  }: WonderPriorityOptions,
  cityRegistry?: CityRegistry,
  cityBuildRegistry?: CityBuildRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  unitRegistry?: UnitRegistry,
  requirementRegistry?: RequirementRegistry
) => BuildPriority[];
export default wonderPriorityRules;
