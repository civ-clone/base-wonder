import {
  PendingEffect,
  PendingEffectRegistry,
} from '@civ-clone/core-pending-effect';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Started from '@civ-clone/core-science/Rules/Started';
import Wonder from '@civ-clone/core-wonder/Wonder';
/**
 * Spend one of the free completions `pendingEffect` owes `playerResearch`. The last is `discharge`d, which removes the
 *  debt and runs the handler; the others are applied directly and the remainder written back, because discharging
 *  would forget a debt that is only partly paid.
 */
export declare const spendFreeResearch: (
  playerResearch: PlayerResearch,
  pendingEffect: PendingEffect,
  pendingEffects: PendingEffectRegistry
) => void;
/** Registers the handler that grants the last free completion, so a game loaded while one is owed can spend it. */
export declare const registerFreeResearchHandler: (
  handler: string,
  pendingEffects?: PendingEffectRegistry
) => void;
/**
 * A `BuildingComplete` rule (no id): completing `WonderType` owes its player `count` free research completions under
 *  `handler`, and spends one at once if they're researching.
 */
export declare const freeResearchOnCompletion: (
  WonderType: typeof Wonder,
  handler: string,
  count: number,
  playerResearchRegistry?: PlayerResearchRegistry,
  pendingEffects?: PendingEffectRegistry
) => BuildingComplete;
/**
 * The `Started` rule (no id) that spends one owed completion each time a research starts, registering `handler` as it
 *  is made.
 */
export declare const freeResearchStartedRules: (
  handler: string,
  pendingEffects?: PendingEffectRegistry
) => Started[];
