import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
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
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Criterion from '@civ-clone/core-rule/Criterion';
import Wonder from '@civ-clone/core-wonder/Wonder';
import { playerOwnsWonder } from './hasWonder';

/** Whether `city` has a `CityImprovementType` (or a subclass). */
export const cityHasImprovement = (
  city: City,
  CityImprovementType: typeof CityImprovement,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): boolean =>
  cityImprovementRegistry
    .getByCity(city)
    .some(
      (cityImprovement: CityImprovement): boolean =>
        cityImprovement instanceof CityImprovementType
    );

/** `cityHasImprovement` as a `Criterion` on a city. */
export const hasCityImprovement = (
  CityImprovementType: typeof CityImprovement,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
) =>
  new Criterion((city: City): boolean =>
    cityHasImprovement(city, CityImprovementType, cityImprovementRegistry)
  );

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
export const cityHasImprovementOrWonder = (
  city: City,
  CityImprovementType: typeof CityImprovement,
  WonderType: typeof Wonder,
  {
    cityImprovementRegistry = cityImprovementRegistryInstance,
    wonderRegistry = wonderRegistryInstance,
    playerResearchRegistry = playerResearchRegistryInstance,
    requirementRegistry = requirementRegistryInstance,
  }: ImprovementOrWonderRegistries = {}
): boolean =>
  cityHasImprovement(city, CityImprovementType, cityImprovementRegistry) ||
  playerOwnsWonder(
    city.player(),
    WonderType,
    wonderRegistry,
    playerResearchRegistry,
    requirementRegistry
  );

/** `cityHasImprovementOrWonder` as a `Criterion` on a city. */
export const hasImprovementOrWonder = (
  CityImprovementType: typeof CityImprovement,
  WonderType: typeof Wonder,
  registries: ImprovementOrWonderRegistries = {}
) =>
  new Criterion((city: City): boolean =>
    cityHasImprovementOrWonder(
      city,
      CityImprovementType,
      WonderType,
      registries
    )
  );

export default hasImprovementOrWonder;
