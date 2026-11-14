"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wonderObsoleteRules = exports.dropBuiltWonderRules = exports.wonderDestroyedRules = exports.wonderBuiltRules = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const BulidingComplete_1 = require("@civ-clone/core-city-build/Rules/BulidingComplete");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Destroyed_1 = require("@civ-clone/core-city/Rules/Destroyed");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const High_1 = require("@civ-clone/core-rule/Priorities/High");
const Obsolete_1 = require("@civ-clone/core-wonder/Rules/Obsolete");
const ProcessYield_1 = require("@civ-clone/core-city/Rules/ProcessYield");
const Wonder_1 = require("@civ-clone/core-wonder/Wonder");
const wonderHistory_1 = require("./wonderHistory");
/**
 * What happens as a city completes a Wonder, as two `BuildingComplete` rules (no ids): the Wonder is registered in
 *  `wonders`, and every other city building the same Wonder has its build revalidated (so it's dropped, its shields
 *  kept); then `wonder:built` is emitted with the Wonder and its city.
 */
const wonderBuiltRules = (cityBuildRegistry = CityBuildRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, engine = Engine_1.instance) => [
    new BulidingComplete_1.default(new Criterion_1.default((cityBuild, built) => built instanceof Wonder_1.default), new Effect_1.default((cityBuild, built) => {
        const WonderType = built.constructor;
        wonderRegistry.register(built);
        cityBuildRegistry
            .filter((cityBuild) => {
            var _a;
            return ((_a = cityBuild.building()) === null || _a === void 0 ? void 0 : _a.item()) ===
                WonderType;
        })
            .forEach((cityBuild) => cityBuild.revalidate());
    })),
    new BulidingComplete_1.default(new Criterion_1.default((cityBuild, built) => built instanceof Wonder_1.default), new Effect_1.default((cityBuild, built) => {
        engine.emit('wonder:built', built, cityBuild.city());
    })),
];
exports.wonderBuiltRules = wonderBuiltRules;
/** A city destroyed takes its Wonders out of `wonders` (a `Destroyed` rule, no id): they're lost, never rebuilt. */
const wonderDestroyedRules = (wonderRegistry = WonderRegistry_1.instance) => [
    new Destroyed_1.default(new Criterion_1.default((city) => wonderRegistry.getByCity(city).length > 0), new Effect_1.default((city) => wonderRegistry
        .getByCity(city)
        .forEach((wonder) => wonderRegistry.unregister(wonder)))),
];
exports.wonderDestroyedRules = wonderDestroyedRules;
/**
 * `<prefix>:city/process-yield/drop-built-wonder`, `High`: as a city's `Production` is processed, a build of a Wonder
 *  that has been built since (anywhere, standing or lost) is revalidated, so it's dropped (its shields kept) rather
 *  than completed again. `built once` stops it being chosen and `wonderBuiltRules` drops rivals' builds when it is
 *  completed; this catches a game saved before either.
 */
const dropBuiltWonderRules = (prefix, Production, cityBuildRegistry = CityBuildRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance) => [
    new ProcessYield_1.default(`${prefix}:city/process-yield/drop-built-wonder`, new High_1.default(), new Criterion_1.default((cityYield) => cityYield instanceof Production), new Criterion_1.default((cityYield, city) => {
        var _a, _b;
        const Item = (_b = (_a = cityBuildRegistry.getByCity(city)) === null || _a === void 0 ? void 0 : _a.building()) === null || _b === void 0 ? void 0 : _b.item();
        return (Item !== undefined &&
            Object.prototype.isPrototypeOf.call(Wonder_1.default, Item) &&
            (0, wonderHistory_1.everBuilt)(Item, wonderRegistry, cityImprovementRegistry));
    }), new Effect_1.default((cityYield, city) => cityBuildRegistry.getByCity(city).revalidate())),
];
exports.dropBuiltWonderRules = dropBuiltWonderRules;
/** An `Obsolete` rule (no id) emitting `wonder:obsolete` with the Wonder and its city. */
const wonderObsoleteRules = (engine = Engine_1.instance) => [
    new Obsolete_1.default(new Effect_1.default((wonder, city) => {
        engine.emit('wonder:obsolete', wonder, city);
    })),
];
exports.wonderObsoleteRules = wonderObsoleteRules;
//# sourceMappingURL=lifecycleRules.js.map