import {
  PendingEffect,
  PendingEffectRegistry,
  instance as pendingEffectRegistryInstance,
} from '@civ-clone/core-pending-effect';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import Advance from '@civ-clone/core-science/Advance';
import { BuildableInstance } from '@civ-clone/core-city-build/Buildable';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Started from '@civ-clone/core-science/Rules/Started';
import Wonder from '@civ-clone/core-wonder/Wonder';

// Free research completions (Darwin's Voyage, in both games), recorded as a debt against the player's research, a
//  `PendingEffect` named `handler`, so a save taken between completing the Wonder and spending them keeps them. One is
//  spent at once if the player is researching something; each research started after spends one more.

/**
 * Spend one of the free completions `pendingEffect` owes `playerResearch`. The last is `discharge`d, which removes the
 *  debt and runs the handler; the others are applied directly and the remainder written back, because discharging
 *  would forget a debt that is only partly paid.
 */
export const spendFreeResearch = (
  playerResearch: PlayerResearch,
  pendingEffect: PendingEffect,
  pendingEffects: PendingEffectRegistry
): void => {
  const remaining = Number(pendingEffect.data().remaining);

  if (remaining <= 1) {
    pendingEffects.discharge(pendingEffect);

    return;
  }

  pendingEffect.setData({ remaining: String(remaining - 1) });
  playerResearch.add(playerResearch.cost());
};

/** Registers the handler that grants the last free completion, so a game loaded while one is owed can spend it. */
export const registerFreeResearchHandler = (
  handler: string,
  pendingEffects: PendingEffectRegistry = pendingEffectRegistryInstance
): void =>
  pendingEffects.handler(handler, (pendingEffect: PendingEffect): void =>
    (pendingEffect.target() as PlayerResearch).add(
      (pendingEffect.target() as PlayerResearch).cost()
    )
  );

/**
 * A `BuildingComplete` rule (no id): completing `WonderType` owes its player `count` free research completions under
 *  `handler`, and spends one at once if they're researching.
 */
export const freeResearchOnCompletion = (
  WonderType: typeof Wonder,
  handler: string,
  count: number,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  pendingEffects: PendingEffectRegistry = pendingEffectRegistryInstance
): BuildingComplete =>
  new BuildingComplete(
    new Criterion(
      (cityBuild: CityBuild, built: BuildableInstance): boolean =>
        built instanceof WonderType
    ),
    new Effect((cityBuild: CityBuild): void => {
      const playerResearch = playerResearchRegistry.getByPlayer(
          cityBuild.city().player()
        ),
        pendingEffect = new PendingEffect(handler, playerResearch, {
          remaining: String(count),
        });

      pendingEffects.register(pendingEffect);

      if (playerResearch.researching() !== null) {
        spendFreeResearch(playerResearch, pendingEffect, pendingEffects);
      }
    })
  );

/**
 * The `Started` rule (no id) that spends one owed completion each time a research starts, registering `handler` as it
 *  is made.
 */
export const freeResearchStartedRules = (
  handler: string,
  pendingEffects: PendingEffectRegistry = pendingEffectRegistryInstance
): Started[] => {
  registerFreeResearchHandler(handler, pendingEffects);

  const owed = (playerResearch: PlayerResearch): PendingEffect[] =>
    pendingEffects
      .getByTarget(playerResearch)
      .filter(
        (pendingEffect: PendingEffect): boolean =>
          pendingEffect.handler() === handler
      );

  return [
    new Started(
      new Criterion(
        (playerResearch: PlayerResearch): boolean =>
          owed(playerResearch).length > 0
      ),
      new Effect(
        (playerResearch: PlayerResearch, _advance: typeof Advance): void =>
          owed(playerResearch).forEach((pendingEffect: PendingEffect): void =>
            spendFreeResearch(playerResearch, pendingEffect, pendingEffects)
          )
      )
    ),
  ];
};
