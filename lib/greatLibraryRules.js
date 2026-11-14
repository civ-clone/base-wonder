"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.greatLibraryRules = void 0;
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const Complete_1 = require("@civ-clone/core-science/Rules/Complete");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const obsolete_1 = require("./obsolete");
const obsoleteRules_1 = require("./obsoleteRules");
/**
 * The Great Library's `Complete` rule (no id): as anyone completes an advance, the owner of a standing, unobsolete
 *  `GreatLibrary` who doesn't have it yet is given it once `holders` players have it. Civilization's needs 3, Civilization
 *  II's 2 other than the owner (OpenCiv2 `civ_give_advance`, richardpenman/civ2@49f26ec, counts civilizations 1 to 7).
 */
const greatLibraryRules = ({ GreatLibrary, holders, counts = () => true }, playerResearchRegistry = PlayerResearchRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance) => {
    const ownerResearch = () => {
        const [owningPlayer] = wonderRegistry
            .filter((0, obsoleteRules_1.standingOfType)(GreatLibrary))
            .map((greatLibrary) => greatLibrary.city().player());
        return playerResearchRegistry.getByPlayer(owningPlayer);
    };
    return [
        new Complete_1.default(new Criterion_1.default(() => wonderRegistry.some((0, obsoleteRules_1.standingOfType)(GreatLibrary)) &&
            !(0, obsolete_1.isObsolete)(GreatLibrary, playerResearchRegistry, requirementRegistry)), new Criterion_1.default((playerResearch, completedResearch) => !ownerResearch().completed(completedResearch.sourceClass())), new Criterion_1.default((playerResearch, completedResearch) => playerResearchRegistry.filter((playerResearch) => counts(playerResearch) &&
            playerResearch.completed(completedResearch.sourceClass())).length >= holders), new Effect_1.default((playerResearch, completedResearch) => ownerResearch().addAdvance(completedResearch.sourceClass()))),
    ];
};
exports.greatLibraryRules = greatLibraryRules;
exports.default = exports.greatLibraryRules;
//# sourceMappingURL=greatLibraryRules.js.map