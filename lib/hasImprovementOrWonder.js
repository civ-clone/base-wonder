"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasImprovementOrWonder = exports.cityHasImprovementOrWonder = exports.hasCityImprovement = exports.cityHasImprovement = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const hasWonder_1 = require("./hasWonder");
/** Whether `city` has a `CityImprovementType` (or a subclass). */
const cityHasImprovement = (city, CityImprovementType, cityImprovementRegistry = CityImprovementRegistry_1.instance) => cityImprovementRegistry
    .getByCity(city)
    .some((cityImprovement) => cityImprovement instanceof CityImprovementType);
exports.cityHasImprovement = cityHasImprovement;
/** `cityHasImprovement` as a `Criterion` on a city. */
const hasCityImprovement = (CityImprovementType, cityImprovementRegistry = CityImprovementRegistry_1.instance) => new Criterion_1.default((city) => (0, exports.cityHasImprovement)(city, CityImprovementType, cityImprovementRegistry));
exports.hasCityImprovement = hasCityImprovement;
/**
 * Whether `city` has `CityImprovementType`, or its player owns a standing `WonderType` that isn't obsolete
 *  (`playerOwnsWonder`): a Wonder that acts as the improvement in every one of its owner's cities. One test, so a city
 *  with both counts once (Civilization II's Granary or Pyramids, Cathedral or Michelangelo's, City Walls or the Great
 *  Wall and the rest test them together, as OpenCiv2's `city_can_build_improvement`, `city_calc_trade_happiness` and
 *  `unit_defense_strength` do, richardpenman/civ2@49f26ec).
 */
const cityHasImprovementOrWonder = (city, CityImprovementType, WonderType, { cityImprovementRegistry = CityImprovementRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance, } = {}) => (0, exports.cityHasImprovement)(city, CityImprovementType, cityImprovementRegistry) ||
    (0, hasWonder_1.playerOwnsWonder)(city.player(), WonderType, wonderRegistry, playerResearchRegistry, requirementRegistry);
exports.cityHasImprovementOrWonder = cityHasImprovementOrWonder;
/** `cityHasImprovementOrWonder` as a `Criterion` on a city. */
const hasImprovementOrWonder = (CityImprovementType, WonderType, registries = {}) => new Criterion_1.default((city) => (0, exports.cityHasImprovementOrWonder)(city, CityImprovementType, WonderType, registries));
exports.hasImprovementOrWonder = hasImprovementOrWonder;
exports.default = exports.hasImprovementOrWonder;
//# sourceMappingURL=hasImprovementOrWonder.js.map