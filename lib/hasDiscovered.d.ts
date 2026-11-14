import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import Advance from '@civ-clone/core-science/Advance';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Unit from '@civ-clone/core-unit/Unit';
/** A `Criterion` on a city or unit: its player has discovered `AdvanceType`. */
export declare const discoveredByPlayer: (
  AdvanceType: typeof Advance,
  playerResearchRegistry?: PlayerResearchRegistry
) => Criterion<[item: City | Unit]>;
/** A `Criterion` on a city or unit: its player hasn't discovered `AdvanceType` (always met for `null`). */
export declare const notDiscoveredByPlayer: (
  AdvanceType: typeof Advance | null,
  playerResearchRegistry?: PlayerResearchRegistry
) => Criterion<[item: City | Unit]>;
/** A `Criterion`: no player has discovered `AdvanceType` (always met for `null`). */
export declare const notDiscoveredByAnyPlayer: (
  AdvanceType: typeof Advance | null,
  playerResearchRegistry?: PlayerResearchRegistry
) => Criterion<[]>;
/**
 * For a `Complete` rule: true only for the first player to discover `AdvanceType`, because by the time `Complete` is
 *  processed the discovering player's research already includes it. This is the moment `notDiscoveredByAnyPlayer`
 *  stops holding.
 */
export declare const notDiscoveredByAnyOtherPlayer: (
  AdvanceType: typeof Advance,
  playerResearchRegistry?: PlayerResearchRegistry
) => Criterion<[discoveringPlayerResearch: PlayerResearch]>;
