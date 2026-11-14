"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveObsoleteRules = exports.obsoleteRulesFor = exports.standingOfType = void 0;
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const Complete_1 = require("@civ-clone/core-science/Rules/Complete");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Obsolete_1 = require("@civ-clone/core-wonder/Rules/Obsolete");
const isStanding_1 = require("./isStanding");
const hasDiscovered_1 = require("./hasDiscovered");
/** A standing Wonder of the type: not one still in `wonders` whose city is destroyed, which is lost. */
const standingOfType = (WonderType) => (wonder) => wonder instanceof WonderType && (0, isStanding_1.isStanding)(wonder);
exports.standingOfType = standingOfType;
/**
 * The rule an `obsoletedBy` entry is played by: the first time anyone discovers the advance that makes its Wonder
 *  obsolete, the standing Wonder is announced `Obsolete` (a lost one goes obsolete unannounced). `isObsolete` reads
 *  the same entries. A Wonder is obsoleted by one advance, for the world, so an entry naming more, or another range, is
 *  refused. Any other relation makes no rule.
 */
const obsoleteRulesFor = (entry, playerResearchRegistry = PlayerResearchRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance) => {
    if (entry.relation !== 'obsoletedBy') {
        return [];
    }
    if (entry.range !== 'world') {
        throw new TypeError(`'${entry.id}': a Wonder goes obsolete for the world, so its range must be 'world', not '${entry.range}'.`);
    }
    if (entry.targets.length !== 1) {
        throw new TypeError(`'${entry.id}': a Wonder is made obsolete by one advance, not ${entry.targets.length}.`);
    }
    const WonderType = entry.subject, [ObsoletingAdvance] = entry.targets;
    return [
        new Complete_1.default(entry.id, new Criterion_1.default(() => wonderRegistry.some((0, exports.standingOfType)(WonderType))), new Criterion_1.default((playerResearch, advance) => advance instanceof ObsoletingAdvance), 
        // Only the first discovery makes a wonder obsolete; later ones would process `Obsolete` again.
        (0, hasDiscovered_1.notDiscoveredByAnyOtherPlayer)(ObsoletingAdvance, playerResearchRegistry), new Effect_1.default(() => {
            const [wonder] = wonderRegistry.filter((0, exports.standingOfType)(WonderType));
            ruleRegistry.process(Obsolete_1.default, wonder, wonder.city());
        })),
    ];
};
exports.obsoleteRulesFor = obsoleteRulesFor;
/** What a ruleset gives the game's `requirements` to make each `obsoletedBy` entry's rule with. */
const deriveObsoleteRules = (playerResearchRegistry, ruleRegistry, wonderRegistry) => (entry) => (0, exports.obsoleteRulesFor)(entry, playerResearchRegistry, ruleRegistry, wonderRegistry);
exports.deriveObsoleteRules = deriveObsoleteRules;
//# sourceMappingURL=obsoleteRules.js.map