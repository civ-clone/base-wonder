"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wonderHelpedRules = exports.helpBuildWonderActionRules = void 0;
const Action_1 = require("@civ-clone/core-unit/Rules/Action");
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const BuildItem_1 = require("@civ-clone/core-city-build/BuildItem");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const HelpBuildWonder_1 = require("@civ-clone/base-unit-action-help-build-wonder/HelpBuildWonder");
const TradeMissions_1 = require("@civ-clone/base-unit-trait-trade-missions/TradeMissions");
const Wonder_1 = require("@civ-clone/core-wonder/Wonder");
const WonderHelped_1 = require("@civ-clone/base-unit-action-help-build-wonder/Rules/WonderHelped");
const traits_1 = require("@civ-clone/core-unit/traits");
/**
 * `<prefix>:unit/action/help-build-wonder`: a unit that `TradeMissions`, with moves left, next to one of its player's
 *  cities building a Wonder (from whichever city it comes), may help build it.
 */
const helpBuildWonderActionRules = (prefix, cityRegistry = CityRegistry_1.instance, cityBuildRegistry = CityBuildRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => [
    new Action_1.Action(`${prefix}:unit/action/help-build-wonder`, Action_1.isNeighbouringTile, Action_1.hasMovesLeft, (0, traits_1.traitCriterion)(TradeMissions_1.default), new Criterion_1.default((unit, to) => { var _a; return ((_a = cityRegistry.getByTile(to)) === null || _a === void 0 ? void 0 : _a.player()) === unit.player(); }), new Criterion_1.default((unit, to) => {
        const building = cityBuildRegistry
            .getByCity(cityRegistry.getByTile(to))
            .building();
        return (building !== null &&
            Object.prototype.isPrototypeOf.call(Wonder_1.default, building.item()));
    }), new Effect_1.default((unit, to, from = unit.tile()) => new HelpBuildWonder_1.default(from, to, unit, cityRegistry.getByTile(to), ruleRegistry))),
];
exports.helpBuildWonderActionRules = helpBuildWonderActionRules;
/**
 * `<prefix>:unit/wonder-helped/add-production`: the unit adds what it cost to build to the city's build, as
 *  `Production`. Nothing caps it: the shields stay if the city switches production.
 */
const wonderHelpedRules = (prefix, Production, cityBuildRegistry = CityBuildRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => [
    new WonderHelped_1.default(`${prefix}:unit/wonder-helped/add-production`, new Effect_1.default((unit, city) => {
        const cost = new BuildItem_1.default(unit.constructor, city, ruleRegistry)
            .cost()
            .value();
        cityBuildRegistry
            .getByCity(city)
            .add(new Production(cost, unit.constructor.name));
    })),
];
exports.wonderHelpedRules = wonderHelpedRules;
//# sourceMappingURL=helpBuildWonder.js.map