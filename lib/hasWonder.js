"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerHasWonder = exports.playerOwnsWonder = exports.cityHasWonder = void 0;
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const obsolete_1 = require("./obsolete");
const isStanding_1 = require("./isStanding");
// Obsolete Wonders still exist, but no longer do anything. Nor does one whose city is destroyed, should it still be
//  in `wonders` (`isStanding`).
/** A `Criterion` on a city: it holds a standing `WonderType` (or a subclass) that isn't obsolete. */
const cityHasWonder = (WonderType, wonderRegistry = WonderRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance) => new Criterion_1.default((city) => wonderRegistry
    .getByCity(city)
    .some((wonder) => wonder instanceof WonderType && (0, isStanding_1.isStanding)(wonder)) &&
    !(0, obsolete_1.isObsolete)(WonderType, playerResearchRegistry, requirementRegistry));
exports.cityHasWonder = cityHasWonder;
/** Whether `player` owns a standing `WonderType` (or a subclass) that isn't obsolete, in any of their cities. */
const playerOwnsWonder = (player, WonderType, wonderRegistry = WonderRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance) => wonderRegistry
    .getByPlayer(player)
    .some((wonder) => wonder instanceof WonderType && (0, isStanding_1.isStanding)(wonder)) && !(0, obsolete_1.isObsolete)(WonderType, playerResearchRegistry, requirementRegistry);
exports.playerOwnsWonder = playerOwnsWonder;
/** `playerOwnsWonder` as a `Criterion` on a city or unit, for its player. */
const playerHasWonder = (WonderType, wonderRegistry = WonderRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance) => new Criterion_1.default((item) => (0, exports.playerOwnsWonder)(item.player(), WonderType, wonderRegistry, playerResearchRegistry, requirementRegistry));
exports.playerHasWonder = playerHasWonder;
//# sourceMappingURL=hasWonder.js.map