import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import Buildable, {
  BuildableInstance,
} from '@civ-clone/core-city-build/Buildable';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Destroyed from '@civ-clone/core-city/Rules/Destroyed';
import Effect from '@civ-clone/core-rule/Effect';
import High from '@civ-clone/core-rule/Priorities/High';
import Obsolete from '@civ-clone/core-wonder/Rules/Obsolete';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import Wonder from '@civ-clone/core-wonder/Wonder';
import Yield from '@civ-clone/core-yield/Yield';
import { everBuilt } from './wonderHistory';

/**
 * What happens as a city completes a Wonder, as two `BuildingComplete` rules (no ids): the Wonder is registered in
 *  `wonders`, and every other city building the same Wonder has its build revalidated (so it's dropped, its shields
 *  kept); then `wonder:built` is emitted with the Wonder and its city.
 */
export const wonderBuiltRules = (
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  engine: Engine = engineInstance
): BuildingComplete[] => [
  new BuildingComplete(
    new Criterion(
      (cityBuild: CityBuild, built: BuildableInstance): boolean =>
        built instanceof Wonder
    ),
    new Effect((cityBuild: CityBuild, built: BuildableInstance): void => {
      const WonderType = built.constructor as typeof Wonder;

      wonderRegistry.register(built as Wonder);
      cityBuildRegistry
        .filter(
          (cityBuild: CityBuild): boolean =>
            cityBuild.building()?.item() ===
            (WonderType as unknown as typeof Buildable)
        )
        .forEach((cityBuild: CityBuild): void => cityBuild.revalidate());
    })
  ),
  new BuildingComplete(
    new Criterion(
      (cityBuild: CityBuild, built: BuildableInstance): boolean =>
        built instanceof Wonder
    ),
    new Effect((cityBuild: CityBuild, built: BuildableInstance): void => {
      engine.emit('wonder:built', built, cityBuild.city());
    })
  ),
];

/** A city destroyed takes its Wonders out of `wonders` (a `Destroyed` rule, no id): they're lost, never rebuilt. */
export const wonderDestroyedRules = (
  wonderRegistry: WonderRegistry = wonderRegistryInstance
): Destroyed[] => [
  new Destroyed(
    new Criterion((city: City) => wonderRegistry.getByCity(city).length > 0),
    new Effect((city: City) =>
      wonderRegistry
        .getByCity(city)
        .forEach((wonder: Wonder) => wonderRegistry.unregister(wonder))
    )
  ),
];

/**
 * `<prefix>:city/process-yield/drop-built-wonder`, `High`: as a city's `Production` is processed, a build of a Wonder
 *  that has been built since (anywhere, standing or lost) is revalidated, so it's dropped (its shields kept) rather
 *  than completed again. `built once` stops it being chosen and `wonderBuiltRules` drops rivals' builds when it is
 *  completed; this catches a game saved before either.
 */
export const dropBuiltWonderRules = (
  prefix: string,
  Production: typeof Yield,
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): ProcessYield[] => [
  new ProcessYield(
    `${prefix}:city/process-yield/drop-built-wonder`,
    new High(),
    new Criterion(
      (cityYield: Yield): boolean => cityYield instanceof Production
    ),
    new Criterion((cityYield: Yield, city: City): boolean => {
      const Item = cityBuildRegistry.getByCity(city)?.building()?.item();

      return (
        Item !== undefined &&
        Object.prototype.isPrototypeOf.call(Wonder, Item) &&
        everBuilt(
          Item as unknown as typeof Wonder,
          wonderRegistry,
          cityImprovementRegistry
        )
      );
    }),
    new Effect((cityYield: Yield, city: City): void =>
      cityBuildRegistry.getByCity(city).revalidate()
    )
  ),
];

/** An `Obsolete` rule (no id) emitting `wonder:obsolete` with the Wonder and its city. */
export const wonderObsoleteRules = (
  engine: Engine = engineInstance
): Obsolete[] => [
  new Obsolete(
    new Effect((wonder: Wonder, city: City) => {
      engine.emit('wonder:obsolete', wonder, city);
    })
  ),
];
