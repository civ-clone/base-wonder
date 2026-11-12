import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
import Wonder from '@civ-clone/core-wonder/Wonder';
/** A `Criterion` on a city: it holds a standing `WonderType` (or a subclass) that isn't obsolete. */
export declare const cityHasWonder: (
  WonderType: typeof Wonder,
  wonderRegistry?: WonderRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  requirementRegistry?: RequirementRegistry
) => Criterion<[city: City]>;
/** Whether `player` owns a standing `WonderType` (or a subclass) that isn't obsolete, in any of their cities. */
export declare const playerOwnsWonder: (
  player: Player,
  WonderType: typeof Wonder,
  wonderRegistry?: WonderRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  requirementRegistry?: RequirementRegistry
) => boolean;
/** `playerOwnsWonder` as a `Criterion` on a city or unit, for its player. */
export declare const playerHasWonder: (
  WonderType: typeof Wonder,
  wonderRegistry?: WonderRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  requirementRegistry?: RequirementRegistry
) => Criterion<[item: City | Unit]>;
