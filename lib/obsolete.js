"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObsolete = void 0;
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const Requirement_1 = require("@civ-clone/core-requirement/Requirement");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
/**
 * A Wonder is obsolete once *anyone* has discovered what its `obsoletedBy` requirements name, not just its owner, as
 *  the game's requirements say, so a plugin that changes them changes this too. Only entries of the `world` range
 *  count: a ruleset that wants another range reads those itself. Worked out from research rather than recorded, so
 *  there's nothing extra to save.
 *
 * `requirementRegistry` is `defaultGame`'s unless given, which holds a ruleset's entries once it is registered there.
 *  Another game's are only read if passed.
 */
const isObsolete = (WonderType, playerResearchRegistry = PlayerResearchRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance) => requirementRegistry
    .for(WonderType, 'obsoletedBy')
    .filter((entry) => entry.range === 'world')
    .some((entry) => (0, Requirement_1.met)(entry, (target) => playerResearchRegistry.some((playerResearch) => playerResearch.completed(target))));
exports.isObsolete = isObsolete;
exports.default = exports.isObsolete;
//# sourceMappingURL=obsolete.js.map