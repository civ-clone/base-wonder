import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import Destroyed from '@civ-clone/core-city/Rules/Destroyed';
import Obsolete from '@civ-clone/core-wonder/Rules/Obsolete';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import Yield from '@civ-clone/core-yield/Yield';
/**
 * What happens as a city completes a Wonder, as two `BuildingComplete` rules (no ids): the Wonder is registered in
 *  `wonders`, and every other city building the same Wonder has its build revalidated (so it's dropped, its shields
 *  kept); then `wonder:built` is emitted with the Wonder and its city.
 */
export declare const wonderBuiltRules: (
  cityBuildRegistry?: CityBuildRegistry,
  wonderRegistry?: WonderRegistry,
  engine?: Engine
) => BuildingComplete[];
/** A city destroyed takes its Wonders out of `wonders` (a `Destroyed` rule, no id): they're lost, never rebuilt. */
export declare const wonderDestroyedRules: (
  wonderRegistry?: WonderRegistry
) => Destroyed[];
/**
 * `<prefix>:city/process-yield/drop-built-wonder`, `High`: as a city's `Production` is processed, a build of a Wonder
 *  that has been built since (anywhere, standing or lost) is revalidated, so it's dropped (its shields kept) rather
 *  than completed again. `built once` stops it being chosen and `wonderBuiltRules` drops rivals' builds when it is
 *  completed; this catches a game saved before either.
 */
export declare const dropBuiltWonderRules: (
  prefix: string,
  Production: typeof Yield,
  cityBuildRegistry?: CityBuildRegistry,
  wonderRegistry?: WonderRegistry,
  cityImprovementRegistry?: CityImprovementRegistry
) => ProcessYield[];
/** An `Obsolete` rule (no id) emitting `wonder:obsolete` with the Wonder and its city. */
export declare const wonderObsoleteRules: (engine?: Engine) => Obsolete[];
