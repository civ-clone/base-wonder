"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wonderHistory = exports.wonderStatus = exports.everBuilt = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const Wonder_1 = require("@civ-clone/core-wonder/Wonder");
const isStanding_1 = require("./isStanding");
const isOfType = (WonderType) => (wonder) => wonder instanceof WonderType;
/**
 * Whether `WonderType` has ever been built, by anyone: standing now, or lost with its city since. Cheap enough to ask
 *  from inside `CityBuild#available()`: an index lookup, then (only for a Wonder never built) a look through the
 *  standing Wonders.
 */
const everBuilt = (WonderType, wonderRegistry = WonderRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance) => cityImprovementRegistry.getByType(WonderType, true).length > 0 ||
    wonderRegistry.some(isOfType(WonderType));
exports.everBuilt = everBuilt;
/**
 * Where `WonderType` is and whose, or that it was lost or never built. A standing Wonder wins over a lost one of the
 *  same type (a game from before Wonders were built once may hold one lost and another built again since). One still
 *  in `wonders` whose city is destroyed is lost (`isStanding`).
 */
const wonderStatus = (WonderType, wonderRegistry = WonderRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance) => {
    var _a;
    const ofType = wonderRegistry.filter(isOfType(WonderType)), standing = ofType.find(isStanding_1.isStanding);
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
    const lost = ((_a = cityImprovementRegistry.getByType(WonderType, true).pop()) !== null && _a !== void 0 ? _a : ofType.pop());
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
exports.wonderStatus = wonderStatus;
/**
 * Every Wonder ever built, standing or lost, as `wonderStatus` gives it, in `order` (a ruleset's own order of its
 *  Wonders, as its Wonders of the World report lists them). A Wonder not in `order` comes after those that are, in the
 *  order it was first built. Not for a hot path: it looks through every improvement.
 */
const wonderHistory = (order = [], wonderRegistry = WonderRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance) => {
    const types = [];
    [...cityImprovementRegistry.entries(), ...wonderRegistry.entries()].forEach((improvement) => {
        if (!(improvement instanceof Wonder_1.default)) {
            return;
        }
        const WonderType = improvement.constructor;
        if (!types.includes(WonderType)) {
            types.push(WonderType);
        }
    });
    const rank = (WonderType) => {
        const index = order.indexOf(WonderType);
        return index === -1 ? order.length : index;
    };
    return types
        .map((WonderType, index) => ({ WonderType, index }))
        .sort((a, b) => rank(a.WonderType) - rank(b.WonderType) || a.index - b.index)
        .map(({ WonderType }) => (0, exports.wonderStatus)(WonderType, wonderRegistry, cityImprovementRegistry));
};
exports.wonderHistory = wonderHistory;
exports.default = exports.wonderHistory;
//# sourceMappingURL=wonderHistory.js.map