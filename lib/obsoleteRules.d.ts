import { Requirement } from '@civ-clone/core-requirement/Requirement';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import Complete from '@civ-clone/core-science/Rules/Complete';
import { Deriver } from '@civ-clone/core-requirement/RequirementRegistry';
import Wonder from '@civ-clone/core-wonder/Wonder';
/** A standing Wonder of the type: not one still in `wonders` whose city is destroyed, which is lost. */
export declare const standingOfType: (
  WonderType: typeof Wonder
) => (wonder: Wonder) => boolean;
/**
 * The rule an `obsoletedBy` entry is played by: the first time anyone discovers the advance that makes its Wonder
 *  obsolete, the standing Wonder is announced `Obsolete` (a lost one goes obsolete unannounced). `isObsolete` reads
 *  the same entries. A Wonder is obsoleted by one advance, for the world, so an entry naming more, or another range, is
 *  refused. Any other relation makes no rule.
 */
export declare const obsoleteRulesFor: (
  entry: Requirement,
  playerResearchRegistry?: PlayerResearchRegistry,
  ruleRegistry?: RuleRegistry,
  wonderRegistry?: WonderRegistry
) => Complete[];
/** What a ruleset gives the game's `requirements` to make each `obsoletedBy` entry's rule with. */
export declare const deriveObsoleteRules: (
  playerResearchRegistry: PlayerResearchRegistry,
  ruleRegistry: RuleRegistry,
  wonderRegistry: WonderRegistry
) => Deriver;
