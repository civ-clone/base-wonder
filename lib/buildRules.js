"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveBuildRules = exports.buildRulesFor = exports.builtOnceRule = void 0;
const Build_1 = require("@civ-clone/core-city-build/Rules/Build");
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const Requirement_1 = require("@civ-clone/core-requirement/Requirement");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Wonder_1 = require("@civ-clone/core-wonder/Wonder");
const wonderHistory_1 = require("./wonderHistory");
const isStanding_1 = require("./isStanding");
/**
 * A Wonder is built once in the world, and never again, even once it is lost with its city: `<prefix>:city/build/once`.
 *  Both Civilization (`marvel_site`) and Civilization II (OpenCiv2 `city_can_build_wonder` asks `wonder_city == -1`)
 *  offer a Wonder only while it has never been built.
 */
const builtOnceRule = (prefix, wonderRegistry = WonderRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance) => new Build_1.Build(`${prefix}:city/build/once`, Wonder_1.default, new Criterion_1.default((city, BuildItem) => Object.isPrototypeOf.call(Wonder_1.default, BuildItem)), new Effect_1.default((city, WonderType) => new Criterion_1.default(() => !(0, wonderHistory_1.everBuilt)(WonderType, wonderRegistry, cityImprovementRegistry))));
exports.builtOnceRule = builtOnceRule;
/**
 * The rule a `requires` entry is played by: a city may build its subject only once each advance and Wonder it requires
 *  is held, by the city's player or, for a `world` entry, by anyone. A Wonder in a `world` entry counts once it has
 *  ever been built, even if it has been lost with its city since (`everBuilt`: Nuclear units and the Manhattan
 *  Project, in both games). In a `city` or `player` entry it counts only while it stands in that city or the player's
 *  (`isStanding`). Any other relation makes no rule.
 */
const buildRulesFor = (entry, playerResearchRegistry = PlayerResearchRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance) => {
    if (entry.relation !== 'requires') {
        return [];
    }
    const has = (city, target) => {
        if (Object.prototype.isPrototypeOf.call(Wonder_1.default, target)) {
            const isTarget = (wonder) => wonder instanceof target && (0, isStanding_1.isStanding)(wonder);
            return entry.range === 'world'
                ? (0, wonderHistory_1.everBuilt)(target, wonderRegistry, cityImprovementRegistry)
                : entry.range === 'city'
                    ? wonderRegistry.getByCity(city).some(isTarget)
                    : wonderRegistry.getByPlayer(city.player()).some(isTarget);
        }
        return entry.range === 'world'
            ? playerResearchRegistry.some((playerResearch) => playerResearch.completed(target))
            : playerResearchRegistry
                .getByPlayer(city.player())
                .completed(target);
    };
    return [
        new Build_1.Build(entry.id, entry.subject, new Criterion_1.default((city, BuildItem) => BuildItem === entry.subject), new Effect_1.default((city) => new Criterion_1.default(() => (0, Requirement_1.met)(entry, (target) => has(city, target))))),
    ];
};
exports.buildRulesFor = buildRulesFor;
/** What a ruleset gives the game's `requirements` to make each `requires` entry's rule with. */
const deriveBuildRules = (playerResearchRegistry, wonderRegistry, cityImprovementRegistry = CityImprovementRegistry_1.instance) => (entry) => (0, exports.buildRulesFor)(entry, playerResearchRegistry, wonderRegistry, cityImprovementRegistry);
exports.deriveBuildRules = deriveBuildRules;
//# sourceMappingURL=buildRules.js.map