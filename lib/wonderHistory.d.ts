import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import Wonder from '@civ-clone/core-wonder/Wonder';
/** `standing`: in a city now. `lost`: built, then lost with its city. `never`: never built. */
export type WonderState = 'standing' | 'lost' | 'never';
export interface IWonderStatus {
  /** The Wonder this is about. */
  type: typeof Wonder;
  state: WonderState;
  /** The Wonder itself: the standing one, the last one lost, or `null` when it was never built. */
  wonder: Wonder | null;
  /** The city it stands in, or the (destroyed) city it was lost with; `null` when it was never built. */
  city: City | null;
  /** Whose it is: the standing city's player (a captor, once its city is taken), or `null` when lost or never built. */
  owner: Player | null;
}
/**
 * Whether `WonderType` has ever been built, by anyone: standing now, or lost with its city since. Cheap enough to ask
 *  from inside `CityBuild#available()`: an index lookup, then (only for a Wonder never built) a look through the
 *  standing Wonders.
 */
export declare const everBuilt: (
  WonderType: typeof Wonder,
  wonderRegistry?: WonderRegistry,
  cityImprovementRegistry?: CityImprovementRegistry
) => boolean;
/**
 * Where `WonderType` is and whose, or that it was lost or never built. A standing Wonder wins over a lost one of the
 *  same type (a game from before Wonders were built once may hold one lost and another built again since). One still
 *  in `wonders` whose city is destroyed is lost (`isStanding`).
 */
export declare const wonderStatus: (
  WonderType: typeof Wonder,
  wonderRegistry?: WonderRegistry,
  cityImprovementRegistry?: CityImprovementRegistry
) => IWonderStatus;
/**
 * Every Wonder ever built, standing or lost, as `wonderStatus` gives it, in `order` (a ruleset's own order of its
 *  Wonders, as its Wonders of the World report lists them). A Wonder not in `order` comes after those that are, in the
 *  order it was first built. Not for a hot path: it looks through every improvement.
 */
export declare const wonderHistory: (
  order?: (typeof Wonder)[],
  wonderRegistry?: WonderRegistry,
  cityImprovementRegistry?: CityImprovementRegistry
) => IWonderStatus[];
export default wonderHistory;
