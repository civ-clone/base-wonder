"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notDiscoveredByAnyOtherPlayer = exports.notDiscoveredByAnyPlayer = exports.notDiscoveredByPlayer = exports.discoveredByPlayer = void 0;
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
/** A `Criterion` on a city or unit: its player has discovered `AdvanceType`. */
const discoveredByPlayer = (AdvanceType, playerResearchRegistry = PlayerResearchRegistry_1.instance) => new Criterion_1.default((item) => playerResearchRegistry.getByPlayer(item.player()).completed(AdvanceType));
exports.discoveredByPlayer = discoveredByPlayer;
/** A `Criterion` on a city or unit: its player hasn't discovered `AdvanceType` (always met for `null`). */
const notDiscoveredByPlayer = (AdvanceType, playerResearchRegistry = PlayerResearchRegistry_1.instance) => new Criterion_1.default((item) => AdvanceType === null ||
    !playerResearchRegistry.getByPlayer(item.player()).completed(AdvanceType));
exports.notDiscoveredByPlayer = notDiscoveredByPlayer;
/** A `Criterion`: no player has discovered `AdvanceType` (always met for `null`). */
const notDiscoveredByAnyPlayer = (AdvanceType, playerResearchRegistry = PlayerResearchRegistry_1.instance) => new Criterion_1.default(() => AdvanceType === null ||
    !playerResearchRegistry.some((playerResearch) => playerResearch.completed(AdvanceType)));
exports.notDiscoveredByAnyPlayer = notDiscoveredByAnyPlayer;
/**
 * For a `Complete` rule: true only for the first player to discover `AdvanceType`, because by the time `Complete` is
 *  processed the discovering player's research already includes it. This is the moment `notDiscoveredByAnyPlayer`
 *  stops holding.
 */
const notDiscoveredByAnyOtherPlayer = (AdvanceType, playerResearchRegistry = PlayerResearchRegistry_1.instance) => new Criterion_1.default((discoveringPlayerResearch) => !playerResearchRegistry.some((playerResearch) => playerResearch !== discoveringPlayerResearch &&
    playerResearch.completed(AdvanceType)));
exports.notDiscoveredByAnyOtherPlayer = notDiscoveredByAnyOtherPlayer;
//# sourceMappingURL=hasDiscovered.js.map