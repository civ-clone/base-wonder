"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.freeResearchStartedRules = exports.freeResearchOnCompletion = exports.registerFreeResearchHandler = exports.spendFreeResearch = void 0;
const core_pending_effect_1 = require("@civ-clone/core-pending-effect");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const BulidingComplete_1 = require("@civ-clone/core-city-build/Rules/BulidingComplete");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Started_1 = require("@civ-clone/core-science/Rules/Started");
// Free research completions (Darwin's Voyage, in both games), recorded as a debt against the player's research, a
//  `PendingEffect` named `handler`, so a save taken between completing the Wonder and spending them keeps them. One is
//  spent at once if the player is researching something; each research started after spends one more.
/**
 * Spend one of the free completions `pendingEffect` owes `playerResearch`. The last is `discharge`d, which removes the
 *  debt and runs the handler; the others are applied directly and the remainder written back, because discharging
 *  would forget a debt that is only partly paid.
 */
const spendFreeResearch = (playerResearch, pendingEffect, pendingEffects) => {
    const remaining = Number(pendingEffect.data().remaining);
    if (remaining <= 1) {
        pendingEffects.discharge(pendingEffect);
        return;
    }
    pendingEffect.setData({ remaining: String(remaining - 1) });
    playerResearch.add(playerResearch.cost());
};
exports.spendFreeResearch = spendFreeResearch;
/** Registers the handler that grants the last free completion, so a game loaded while one is owed can spend it. */
const registerFreeResearchHandler = (handler, pendingEffects = core_pending_effect_1.instance) => pendingEffects.handler(handler, (pendingEffect) => pendingEffect.target().add(pendingEffect.target().cost()));
exports.registerFreeResearchHandler = registerFreeResearchHandler;
/**
 * A `BuildingComplete` rule (no id): completing `WonderType` owes its player `count` free research completions under
 *  `handler`, and spends one at once if they're researching.
 */
const freeResearchOnCompletion = (WonderType, handler, count, playerResearchRegistry = PlayerResearchRegistry_1.instance, pendingEffects = core_pending_effect_1.instance) => new BulidingComplete_1.default(new Criterion_1.default((cityBuild, built) => built instanceof WonderType), new Effect_1.default((cityBuild) => {
    const playerResearch = playerResearchRegistry.getByPlayer(cityBuild.city().player()), pendingEffect = new core_pending_effect_1.PendingEffect(handler, playerResearch, {
        remaining: String(count),
    });
    pendingEffects.register(pendingEffect);
    if (playerResearch.researching() !== null) {
        (0, exports.spendFreeResearch)(playerResearch, pendingEffect, pendingEffects);
    }
}));
exports.freeResearchOnCompletion = freeResearchOnCompletion;
/**
 * The `Started` rule (no id) that spends one owed completion each time a research starts, registering `handler` as it
 *  is made.
 */
const freeResearchStartedRules = (handler, pendingEffects = core_pending_effect_1.instance) => {
    (0, exports.registerFreeResearchHandler)(handler, pendingEffects);
    const owed = (playerResearch) => pendingEffects
        .getByTarget(playerResearch)
        .filter((pendingEffect) => pendingEffect.handler() === handler);
    return [
        new Started_1.default(new Criterion_1.default((playerResearch) => owed(playerResearch).length > 0), new Effect_1.default((playerResearch, _advance) => owed(playerResearch).forEach((pendingEffect) => (0, exports.spendFreeResearch)(playerResearch, pendingEffect, pendingEffects)))),
    ];
};
exports.freeResearchStartedRules = freeResearchStartedRules;
//# sourceMappingURL=freeResearch.js.map