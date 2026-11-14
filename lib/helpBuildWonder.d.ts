import { Action } from '@civ-clone/core-unit/Rules/Action';
import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import WonderHelped from '@civ-clone/base-unit-action-help-build-wonder/Rules/WonderHelped';
import Yield from '@civ-clone/core-yield/Yield';
/**
 * `<prefix>:unit/action/help-build-wonder`: a unit that `TradeMissions`, with moves left, next to one of its player's
 *  cities building a Wonder (from whichever city it comes), may help build it.
 */
export declare const helpBuildWonderActionRules: (
  prefix: string,
  cityRegistry?: CityRegistry,
  cityBuildRegistry?: CityBuildRegistry,
  ruleRegistry?: RuleRegistry
) => Action[];
/**
 * `<prefix>:unit/wonder-helped/add-production`: the unit adds what it cost to build to the city's build, as
 *  `Production`. Nothing caps it: the shields stay if the city switches production.
 */
export declare const wonderHelpedRules: (
  prefix: string,
  Production: typeof Yield,
  cityBuildRegistry?: CityBuildRegistry,
  ruleRegistry?: RuleRegistry
) => WonderHelped[];
