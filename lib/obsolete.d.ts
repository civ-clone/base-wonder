import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
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
export declare const isObsolete: (
  WonderType: typeof Wonder,
  playerResearchRegistry?: PlayerResearchRegistry,
  requirementRegistry?: RequirementRegistry
) => boolean;
export default isObsolete;
