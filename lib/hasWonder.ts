import {
  RequirementRegistry,
  instance as requirementRegistryInstance,
} from '@civ-clone/core-requirement/RequirementRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
import Wonder from '@civ-clone/core-wonder/Wonder';
import { isObsolete } from './obsolete';
import { isStanding } from './isStanding';

// Obsolete Wonders still exist, but no longer do anything. Nor does one whose city is destroyed, should it still be
//  in `wonders` (`isStanding`).

/** A `Criterion` on a city: it holds a standing `WonderType` (or a subclass) that isn't obsolete. */
export const cityHasWonder = (
  WonderType: typeof Wonder,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  requirementRegistry: RequirementRegistry = requirementRegistryInstance
) =>
  new Criterion(
    (city: City): boolean =>
      wonderRegistry
        .getByCity(city)
        .some(
          (wonder: Wonder): boolean =>
            wonder instanceof WonderType && isStanding(wonder)
        ) &&
      !isObsolete(WonderType, playerResearchRegistry, requirementRegistry)
  );

/** Whether `player` owns a standing `WonderType` (or a subclass) that isn't obsolete, in any of their cities. */
export const playerOwnsWonder = (
  player: Player,
  WonderType: typeof Wonder,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  requirementRegistry: RequirementRegistry = requirementRegistryInstance
): boolean =>
  wonderRegistry
    .getByPlayer(player)
    .some(
      (wonder: Wonder): boolean =>
        wonder instanceof WonderType && isStanding(wonder)
    ) && !isObsolete(WonderType, playerResearchRegistry, requirementRegistry);

/** `playerOwnsWonder` as a `Criterion` on a city or unit, for its player. */
export const playerHasWonder = (
  WonderType: typeof Wonder,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  requirementRegistry: RequirementRegistry = requirementRegistryInstance
) =>
  new Criterion((item: City | Unit): boolean =>
    playerOwnsWonder(
      item.player(),
      WonderType,
      wonderRegistry,
      playerResearchRegistry,
      requirementRegistry
    )
  );
