import {
  Action,
  hasMovesLeft,
  isNeighbouringTile,
} from '@civ-clone/core-unit/Rules/Action';
import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import BuildItem from '@civ-clone/core-city-build/BuildItem';
import Buildable from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import HelpBuildWonder from '@civ-clone/base-unit-action-help-build-wonder/HelpBuildWonder';
import Tile from '@civ-clone/core-world/Tile';
import TradeMissions from '@civ-clone/base-unit-trait-trade-missions/TradeMissions';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import Wonder from '@civ-clone/core-wonder/Wonder';
import WonderHelped from '@civ-clone/base-unit-action-help-build-wonder/Rules/WonderHelped';
import Yield from '@civ-clone/core-yield/Yield';
import { traitCriterion } from '@civ-clone/core-unit/traits';

/**
 * `<prefix>:unit/action/help-build-wonder`: a unit that `TradeMissions`, with moves left, next to one of its player's
 *  cities building a Wonder (from whichever city it comes), may help build it.
 */
export const helpBuildWonderActionRules = (
  prefix: string,
  cityRegistry: CityRegistry = cityRegistryInstance,
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): Action[] => [
  new Action(
    `${prefix}:unit/action/help-build-wonder`,
    isNeighbouringTile,
    hasMovesLeft,
    traitCriterion(TradeMissions),
    new Criterion(
      (unit: Unit, to: Tile): boolean =>
        cityRegistry.getByTile(to)?.player() === unit.player()
    ),
    new Criterion((unit: Unit, to: Tile): boolean => {
      const building = cityBuildRegistry
        .getByCity(cityRegistry.getByTile(to)!)
        .building();

      return (
        building !== null &&
        Object.prototype.isPrototypeOf.call(Wonder, building.item())
      );
    }),
    new Effect(
      (unit: Unit, to: Tile, from: Tile = unit.tile()): UnitAction =>
        new HelpBuildWonder(
          from,
          to,
          unit,
          cityRegistry.getByTile(to)!,
          ruleRegistry
        ) as UnitAction
    )
  ),
];

/**
 * `<prefix>:unit/wonder-helped/add-production`: the unit adds what it cost to build to the city's build, as
 *  `Production`. Nothing caps it: the shields stay if the city switches production.
 */
export const wonderHelpedRules = (
  prefix: string,
  Production: typeof Yield,
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): WonderHelped[] => [
  new WonderHelped(
    `${prefix}:unit/wonder-helped/add-production`,
    new Effect((unit: Unit, city: City): void => {
      const cost = new BuildItem(
        unit.constructor as unknown as typeof Buildable,
        city,
        ruleRegistry
      )
        .cost()
        .value();

      cityBuildRegistry
        .getByCity(city)
        .add(new Production(cost, unit.constructor.name));
    })
  ),
];
