import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  RequirementRegistry,
  instance as requirementRegistryInstance,
} from '@civ-clone/core-requirement/RequirementRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import BuildPriority from '@civ-clone/core-city-build/Rules/BuildPriority';
import { IBuildable as Buildable } from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Unit from '@civ-clone/core-unit/Unit';
import Wonder from '@civ-clone/core-wonder/Wonder';
import Yield from '@civ-clone/core-yield/Yield';
import { isObsolete } from './obsolete';

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
export const wonderPriority = 1.5;

export const wonderShields = 5;

/**
 * `<prefix>:city/build-priority/wonder`: how much a city on Auto, or a computer player, wants a Wonder. A little, next
 *  to what the city lacks, and only where it makes `minimumShields` or more, the Wonder isn't obsolete or never wanted,
 *  would do something for its player (a ship Wonder needs a ship), and none of the player's other cities is building
 *  it already.
 */
export const wonderPriorityRules = (
  prefix: string,
  {
    Production,
    isShip,
    forShips = [],
    neverWanted = [],
    priority = wonderPriority,
    minimumShields = wonderShields,
  }: WonderPriorityOptions,
  cityRegistry: CityRegistry = cityRegistryInstance,
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  requirementRegistry: RequirementRegistry = requirementRegistryInstance
): BuildPriority[] => [
  new BuildPriority(
    `${prefix}:city/build-priority/wonder`,
    new Criterion((cityBuild: CityBuild, BuildItem: Buildable): boolean =>
      Object.prototype.isPrototypeOf.call(Wonder, BuildItem)
    ),
    new Criterion(
      (cityBuild: CityBuild, BuildItem: Buildable): boolean =>
        !neverWanted.includes(BuildItem as unknown as typeof Wonder) &&
        !isObsolete(
          BuildItem as unknown as typeof Wonder,
          playerResearchRegistry,
          requirementRegistry
        )
    ),
    new Criterion(
      (cityBuild: CityBuild, BuildItem: Buildable): boolean =>
        !forShips.includes(BuildItem as unknown as typeof Wonder) ||
        unitRegistry.getByPlayer(cityBuild.city().player()).some(isShip)
    ),
    new Criterion(
      (cityBuild: CityBuild, BuildItem: Buildable): boolean =>
        !cityRegistry
          .getByPlayer(cityBuild.city().player())
          .some(
            (city: City): boolean =>
              city !== cityBuild.city() &&
              cityBuildRegistry.getByCity(city).building()?.item() === BuildItem
          )
    ),
    new Criterion(
      (cityBuild: CityBuild, BuildItem: Buildable, yields: Yield[]): boolean =>
        yields
          .filter(
            (cityYield: Yield): boolean => cityYield instanceof Production
          )
          .reduce(
            (total: number, cityYield: Yield): number =>
              total + cityYield.value(),
            0
          ) >= minimumShields
    ),
    new Effect((): number => priority)
  ),
];

export default wonderPriorityRules;
