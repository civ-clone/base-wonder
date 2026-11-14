import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Player from '@civ-clone/core-player/Player';
import Wonder from '@civ-clone/core-wonder/Wonder';
import { isStanding } from './isStanding';

// Whether a Wonder stands, was lost, or was never built, worked out from the two registries a game already saves, so
//  nothing new is saved:
//
// - `wonders` holds each Wonder while it stands (a ruleset's `BuildingComplete` registers it, `wonderDestroyedRules`
//   unregisters it with its city). A captured city's Wonder stays, and its owner is the captor. One completed in a
//   city already destroyed stays too, and is lost all the same (`isStanding`).
// - `cityImprovements` holds every Wonder ever built, as every improvement is registered when it is created; one lost
//   with its city stays, flagged `destroyed()`.
//
// Both Civilization (v474.05's `marvel_site`) and Civilization II (`game.wonder_city`, OpenCiv2 `city_acquire_wonder`
//  sets it, `city_delete` marks a lost one -2) keep one entry for each Wonder: never built, the city holding it, or
//  lost. What reads "never built" reads `everBuilt`; what reads the city's owner reads `wonderStatus`, for which a lost
//  Wonder is nobody's.
//
// Whether a standing Wonder is of a type is `instanceof`; whether one was ever built also asks
//  `cityImprovements.getByType`, which is by exact constructor: a plugin's subclass of a Wonder, once lost, counts only
//  as itself.

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

const isOfType =
  (WonderType: typeof Wonder) =>
  (wonder: Wonder): boolean =>
    wonder instanceof WonderType;

/**
 * Whether `WonderType` has ever been built, by anyone: standing now, or lost with its city since. Cheap enough to ask
 *  from inside `CityBuild#available()`: an index lookup, then (only for a Wonder never built) a look through the
 *  standing Wonders.
 */
export const everBuilt = (
  WonderType: typeof Wonder,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): boolean =>
  cityImprovementRegistry.getByType(WonderType, true).length > 0 ||
  wonderRegistry.some(isOfType(WonderType));

/**
 * Where `WonderType` is and whose, or that it was lost or never built. A standing Wonder wins over a lost one of the
 *  same type (a game from before Wonders were built once may hold one lost and another built again since). One still
 *  in `wonders` whose city is destroyed is lost (`isStanding`).
 */
export const wonderStatus = (
  WonderType: typeof Wonder,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): IWonderStatus => {
  const ofType = wonderRegistry.filter(isOfType(WonderType)),
    standing = ofType.find(isStanding);

  if (standing) {
    return {
      type: WonderType,
      state: 'standing',
      wonder: standing,
      city: standing.city(),
      owner: standing.city().player(),
    };
  }

  // Completed after its city was destroyed, a Wonder isn't flagged `destroyed()` with the city's improvements, but is
  //  registered among them all the same, so `getByType` finds it; `ofType` holds it too, should it not be.
  const lost = (cityImprovementRegistry.getByType(WonderType, true).pop() ??
    ofType.pop()) as Wonder | undefined;

  if (lost) {
    return {
      type: WonderType,
      state: 'lost',
      wonder: lost,
      city: lost.city(),
      owner: null,
    };
  }

  return {
    type: WonderType,
    state: 'never',
    wonder: null,
    city: null,
    owner: null,
  };
};

/**
 * Every Wonder ever built, standing or lost, as `wonderStatus` gives it, in `order` (a ruleset's own order of its
 *  Wonders, as its Wonders of the World report lists them). A Wonder not in `order` comes after those that are, in the
 *  order it was first built. Not for a hot path: it looks through every improvement.
 */
export const wonderHistory = (
  order: (typeof Wonder)[] = [],
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): IWonderStatus[] => {
  const types: (typeof Wonder)[] = [];

  [...cityImprovementRegistry.entries(), ...wonderRegistry.entries()].forEach(
    (improvement: CityImprovement): void => {
      if (!(improvement instanceof Wonder)) {
        return;
      }

      const WonderType = improvement.constructor as typeof Wonder;

      if (!types.includes(WonderType)) {
        types.push(WonderType);
      }
    }
  );

  const rank = (WonderType: typeof Wonder): number => {
    const index = order.indexOf(WonderType);

    return index === -1 ? order.length : index;
  };

  return types
    .map((WonderType: typeof Wonder, index: number) => ({ WonderType, index }))
    .sort(
      (a, b) => rank(a.WonderType) - rank(b.WonderType) || a.index - b.index
    )
    .map(
      ({ WonderType }): IWonderStatus =>
        wonderStatus(WonderType, wonderRegistry, cityImprovementRegistry)
    );
};

export default wonderHistory;
