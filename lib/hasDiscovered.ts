import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import Advance from '@civ-clone/core-science/Advance';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Unit from '@civ-clone/core-unit/Unit';

/** A `Criterion` on a city or unit: its player has discovered `AdvanceType`. */
export const discoveredByPlayer = (
  AdvanceType: typeof Advance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance
) =>
  new Criterion((item: City | Unit): boolean =>
    playerResearchRegistry.getByPlayer(item.player()).completed(AdvanceType)
  );

/** A `Criterion` on a city or unit: its player hasn't discovered `AdvanceType` (always met for `null`). */
export const notDiscoveredByPlayer = (
  AdvanceType: typeof Advance | null,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance
) =>
  new Criterion(
    (item: City | Unit): boolean =>
      AdvanceType === null ||
      !playerResearchRegistry.getByPlayer(item.player()).completed(AdvanceType)
  );

/** A `Criterion`: no player has discovered `AdvanceType` (always met for `null`). */
export const notDiscoveredByAnyPlayer = (
  AdvanceType: typeof Advance | null,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance
) =>
  new Criterion(
    (): boolean =>
      AdvanceType === null ||
      !playerResearchRegistry.some((playerResearch) =>
        playerResearch.completed(AdvanceType)
      )
  );

/**
 * For a `Complete` rule: true only for the first player to discover `AdvanceType`, because by the time `Complete` is
 *  processed the discovering player's research already includes it. This is the moment `notDiscoveredByAnyPlayer`
 *  stops holding.
 */
export const notDiscoveredByAnyOtherPlayer = (
  AdvanceType: typeof Advance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance
) =>
  new Criterion(
    (discoveringPlayerResearch: PlayerResearch): boolean =>
      !playerResearchRegistry.some(
        (playerResearch) =>
          playerResearch !== discoveringPlayerResearch &&
          playerResearch.completed(AdvanceType)
      )
  );
