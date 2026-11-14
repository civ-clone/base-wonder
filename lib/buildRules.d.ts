import { Build } from '@civ-clone/core-city-build/Rules/Build';
import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { Requirement } from '@civ-clone/core-requirement/Requirement';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import { Deriver } from '@civ-clone/core-requirement/RequirementRegistry';
/**
 * A Wonder is built once in the world, and never again, even once it is lost with its city: `<prefix>:city/build/once`.
 *  Both Civilization (`marvel_site`) and Civilization II (OpenCiv2 `civ_can_build_wonder` asks `wonder_city == -1`, richardpenman/civ2@49f26ec)
 *  offer a Wonder only while it has never been built.
 */
export declare const builtOnceRule: (
  prefix: string,
  wonderRegistry?: WonderRegistry,
  cityImprovementRegistry?: CityImprovementRegistry
) => Build;
/**
 * The rule a `requires` entry is played by: a city may build its subject only once each advance and Wonder it requires
 *  is held, by the city's player or, for a `world` entry, by anyone. A Wonder in a `world` entry counts once it has
 *  ever been built, even if it has been lost with its city since (`everBuilt`: Nuclear units and the Manhattan
 *  Project, in both games; OpenCiv2's `civ_can_build_unit` reads `wonder_city[WONDER_MANHATTAN] != -1`). In a `city` or `player` entry it counts only while it stands in that city or the player's
 *  (`isStanding`). Any other relation makes no rule.
 */
export declare const buildRulesFor: (
  entry: Requirement,
  playerResearchRegistry?: PlayerResearchRegistry,
  wonderRegistry?: WonderRegistry,
  cityImprovementRegistry?: CityImprovementRegistry
) => Build[];
/** What a ruleset gives the game's `requirements` to make each `requires` entry's rule with. */
export declare const deriveBuildRules: (
  playerResearchRegistry: PlayerResearchRegistry,
  wonderRegistry: WonderRegistry,
  cityImprovementRegistry?: CityImprovementRegistry
) => Deriver;
