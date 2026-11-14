"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wonderPriorityRules = exports.wonderShields = exports.wonderPriority = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const BuildPriority_1 = require("@civ-clone/core-city-build/Rules/BuildPriority");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Wonder_1 = require("@civ-clone/core-wonder/Wonder");
const obsolete_1 = require("./obsolete");
/** civ1-wonder's numbers (civ-clone/web-renderer#194). */
exports.wonderPriority = 1.5;
exports.wonderShields = 5;
/**
 * `<prefix>:city/build-priority/wonder`: how much a city on Auto, or a computer player, wants a Wonder. A little, next
 *  to what the city lacks, and only where it makes `minimumShields` or more, the Wonder isn't obsolete or never wanted,
 *  would do something for its player (a ship Wonder needs a ship), and none of the player's other cities is building
 *  it already.
 */
const wonderPriorityRules = (prefix, { Production, isShip, forShips = [], neverWanted = [], priority = exports.wonderPriority, minimumShields = exports.wonderShields, }, cityRegistry = CityRegistry_1.instance, cityBuildRegistry = CityBuildRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance) => [
    new BuildPriority_1.default(`${prefix}:city/build-priority/wonder`, new Criterion_1.default((cityBuild, BuildItem) => Object.prototype.isPrototypeOf.call(Wonder_1.default, BuildItem)), new Criterion_1.default((cityBuild, BuildItem) => !neverWanted.includes(BuildItem) &&
        !(0, obsolete_1.isObsolete)(BuildItem, playerResearchRegistry, requirementRegistry)), new Criterion_1.default((cityBuild, BuildItem) => !forShips.includes(BuildItem) ||
        unitRegistry.getByPlayer(cityBuild.city().player()).some(isShip)), new Criterion_1.default((cityBuild, BuildItem) => !cityRegistry
        .getByPlayer(cityBuild.city().player())
        .some((city) => {
        var _a;
        return city !== cityBuild.city() &&
            ((_a = cityBuildRegistry.getByCity(city).building()) === null || _a === void 0 ? void 0 : _a.item()) === BuildItem;
    })), new Criterion_1.default((cityBuild, BuildItem, yields) => yields
        .filter((cityYield) => cityYield instanceof Production)
        .reduce((total, cityYield) => total + cityYield.value(), 0) >= minimumShields), new Effect_1.default(() => priority)),
];
exports.wonderPriorityRules = wonderPriorityRules;
exports.default = exports.wonderPriorityRules;
//# sourceMappingURL=buildPriority.js.map