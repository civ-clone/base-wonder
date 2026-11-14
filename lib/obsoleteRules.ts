import { Requirement, Target } from '@civ-clone/core-requirement/Requirement';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import Advance from '@civ-clone/core-science/Advance';
import Complete from '@civ-clone/core-science/Rules/Complete';
import Criterion from '@civ-clone/core-rule/Criterion';
import { Deriver } from '@civ-clone/core-requirement/RequirementRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import Obsolete from '@civ-clone/core-wonder/Rules/Obsolete';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Wonder from '@civ-clone/core-wonder/Wonder';
import { isStanding } from './isStanding';
import { notDiscoveredByAnyOtherPlayer } from './hasDiscovered';

/** A standing Wonder of the type: not one still in `wonders` whose city is destroyed, which is lost. */
export const standingOfType =
  (WonderType: typeof Wonder) =>
  (wonder: Wonder): boolean =>
    wonder instanceof WonderType && isStanding(wonder);

/**
 * The rule an `obsoletedBy` entry is played by: the first time anyone discovers the advance that makes its Wonder
 *  obsolete, the standing Wonder is announced `Obsolete` (a lost one goes obsolete unannounced). `isObsolete` reads
 *  the same entries. A Wonder is obsoleted by one advance, for the world, so an entry naming more, or another range, is
 *  refused. Any other relation makes no rule.
 */
export const obsoleteRulesFor = (
  entry: Requirement,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  wonderRegistry: WonderRegistry = wonderRegistryInstance
): Complete[] => {
  if (entry.relation !== 'obsoletedBy') {
    return [];
  }

  if (entry.range !== 'world') {
    throw new TypeError(
      `'${entry.id}': a Wonder goes obsolete for the world, so its range must be 'world', not '${entry.range}'.`
    );
  }

  if (entry.targets.length !== 1) {
    throw new TypeError(
      `'${entry.id}': a Wonder is made obsolete by one advance, not ${entry.targets.length}.`
    );
  }

  const WonderType = entry.subject as typeof Wonder,
    [ObsoletingAdvance] = entry.targets as Target[] as (typeof Advance)[];

  return [
    new Complete(
      entry.id,
      new Criterion(() => wonderRegistry.some(standingOfType(WonderType))),
      new Criterion(
        (playerResearch: PlayerResearch, advance: Advance) =>
          advance instanceof ObsoletingAdvance
      ),
      // Only the first discovery makes a wonder obsolete; later ones would process `Obsolete` again.
      notDiscoveredByAnyOtherPlayer(ObsoletingAdvance, playerResearchRegistry),
      new Effect(() => {
        const [wonder] = wonderRegistry.filter(standingOfType(WonderType));

        ruleRegistry.process(Obsolete, wonder, wonder.city());
      })
    ),
  ];
};

/** What a ruleset gives the game's `requirements` to make each `obsoletedBy` entry's rule with. */
export const deriveObsoleteRules =
  (
    playerResearchRegistry: PlayerResearchRegistry,
    ruleRegistry: RuleRegistry,
    wonderRegistry: WonderRegistry
  ): Deriver =>
  (entry: Requirement): Complete[] =>
    obsoleteRulesFor(
      entry,
      playerResearchRegistry,
      ruleRegistry,
      wonderRegistry
    );
