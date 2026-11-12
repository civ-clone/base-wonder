import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  Requirement,
  Target,
  met,
} from '@civ-clone/core-requirement/Requirement';
import {
  RequirementRegistry,
  instance as requirementRegistryInstance,
} from '@civ-clone/core-requirement/RequirementRegistry';
import Advance from '@civ-clone/core-science/Advance';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Wonder from '@civ-clone/core-wonder/Wonder';

/**
 * A Wonder is obsolete once *anyone* has discovered what its `obsoletedBy` requirements name, not just its owner, as
 *  the game's requirements say, so a plugin that changes them changes this too. Only entries of the `world` range
 *  count: a ruleset that wants another range reads those itself. Worked out from research rather than recorded, so
 *  there's nothing extra to save.
 *
 * `requirementRegistry` is `defaultGame`'s unless given, which holds a ruleset's entries once it is registered there.
 *  Another game's are only read if passed.
 */
export const isObsolete = (
  WonderType: typeof Wonder,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  requirementRegistry: RequirementRegistry = requirementRegistryInstance
): boolean =>
  requirementRegistry
    .for(WonderType, 'obsoletedBy')
    .filter((entry: Requirement): boolean => entry.range === 'world')
    .some((entry: Requirement): boolean =>
      met(entry, (target: Target): boolean =>
        playerResearchRegistry.some((playerResearch: PlayerResearch): boolean =>
          playerResearch.completed(target as typeof Advance)
        )
      )
    );

export default isObsolete;
