"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStanding = void 0;
/**
 * Whether a Wonder stands: its city is still there. One whose city is destroyed is lost, nobody's, and does nothing,
 *  even should it still be in the game's `WonderRegistry` (a game saved before the city's destruction unregistered
 *  it, say). What reads that registry for a Wonder that does something asks this as well.
 */
const isStanding = (wonder) => !wonder.city().destroyed();
exports.isStanding = isStanding;
exports.default = exports.isStanding;
//# sourceMappingURL=isStanding.js.map