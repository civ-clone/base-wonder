import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Criterion from '@civ-clone/core-rule/Criterion';
import Wonder from '@civ-clone/core-wonder/Wonder';
/** Whether `city` has a `CityImprovementType` (or a subclass). */
export declare const cityHasImprovement: (
  city: City,
  CityImprovementType: typeof CityImprovement,
  cityImprovementRegistry?: CityImprovementRegistry
) => boolean;
/** `cityHasImprovement` as a `Criterion` on a city. */
export declare const hasCityImprovement: (
  CityImprovementType: typeof CityImprovement,
  cityImprovementRegistry?: CityImprovementRegistry
) => Criterion<[city: City]>;
export interface ImprovementOrWonderRegistries {
  cityImprovementRegistry?: CityImprovementRegistry;
  wonderRegistry?: WonderRegistry;
  playerResearchRegistry?: PlayerResearchRegistry;
  requirementRegistry?: RequirementRegistry;
}
/**
 * Whether `city` has `CityImprovementType`, or its player owns a standing `WonderType` that isn't obsolete
 *  (`playerOwnsWonder`): a Wonder that acts as the improvement in every one of its owner's cities. One test, so a city
 *  with both counts once (Civilization II's Granary or Pyramids, Cathedral or Michelangelo's, City Walls or the Great
 *  Wall and the rest test them together, as OpenCiv2's `city_can_build_improvement`, `city_calc_trade_happiness` and
 *  `unit_defense_strength` do, richardpenman/civ2@49f26ec).
 */
export declare const cityHasImprovementOrWonder: (
  city: City,
  CityImprovementType: typeof CityImprovement,
  WonderType: typeof Wonder,
  {
    cityImprovementRegistry,
    wonderRegistry,
    playerResearchRegistry,
    requirementRegistry,
  }?: ImprovementOrWonderRegistries
) => boolean;
/** `cityHasImprovementOrWonder` as a `Criterion` on a city. */
export declare const hasImprovementOrWonder: (
  CityImprovementType: typeof CityImprovement,
  WonderType: typeof Wonder,
  registries?: ImprovementOrWonderRegistries
) => Criterion<[city: City]>;
export default hasImprovementOrWonder;
