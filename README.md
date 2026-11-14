# base-wonder

Wonder rules shared by rulesets, as a library: it registers no rules. A ruleset (`civ1-wonder`, `civ2-wonder`) builds
its Wonder rules from these with its own ids, numbers and Wonder classes.

- `lib/isStanding`: `isStanding(wonder)`, whether its city still stands. A Wonder whose city is destroyed does nothing,
  even should it still be in the `WonderRegistry`.
- `lib/obsolete`: `isObsolete(WonderType, playerResearchRegistry?, requirementRegistry?)`, whether anyone has met one
  of the Wonder's `obsoletedBy` requirements of the `world` range. The ruleset declares those entries; this reads them.
- `lib/hasWonder`: `cityHasWonder(WonderType, …)` and `playerHasWonder(WonderType, …)`, `Criterion`s for a city's (or a
  unit's player's) standing, unobsolete Wonder, and `playerOwnsWonder(player, WonderType, …)`, the same as a plain
  check. The registries default to `defaultGame`'s.
- `lib/hasImprovementOrWonder`: `hasImprovementOrWonder(Improvement, WonderType, registries?)`, a `Criterion` on a city
  that has the improvement, or whose player owns the Wonder that acts as it in every city (one test, so a city with
  both counts once), and `cityHasImprovementOrWonder(city, …)`, the same as a plain check; `hasCityImprovement`.
- `lib/hasDiscovered`: `Criterion`s on whether a player, any player or any other player has discovered an advance.
- `lib/onWonderLandMass`: a `Criterion` on a city on the same land mass as its player's standing, unobsolete Wonder.
- `lib/wonderHistory`: `everBuilt(WonderType, …)` (standing or lost: never offered again), `wonderStatus` (standing,
  lost or never, where and whose) and `wonderHistory(order, …)`, worked out from what a game already saves.
- `lib/buildRules`: `builtOnceRule(prefix, …)` (`<prefix>:city/build/once`), and `buildRulesFor(entry, …)` /
  `deriveBuildRules(…)`, the `Build` rule a `requires` entry is played by (a `world` Wonder counts once ever built).
- `lib/obsoleteRules`: `obsoleteRulesFor(entry, …)` / `deriveObsoleteRules(…)`, the `Complete` rule announcing a
  Wonder `Obsolete` on the first discovery of its `obsoletedBy` advance.
- `lib/lifecycleRules`: `wonderBuiltRules` (register the Wonder, drop rivals' builds, emit `wonder:built`),
  `wonderDestroyedRules`, `dropBuiltWonderRules(prefix, Production, …)` and `wonderObsoleteRules` (emit
  `wonder:obsolete`).
- `lib/buildPriority`: `wonderPriorityRules(prefix, { Production, isShip, forShips?, neverWanted?, priority?,
  minimumShields? }, …)`, how much a city on Auto or a computer player wants a Wonder.
- `lib/greatLibraryRules`: the Great Library's `Complete` rule, `{ GreatLibrary, holders, counts? }`.
- `lib/helpBuildWonder`: `helpBuildWonderActionRules(prefix, …)` (a unit that `TradeMissions` helps build its
  player's Wonder) and `wonderHelpedRules(prefix, Production, …)` (it adds what it cost).
- `lib/freeResearch`: free research completions owed as a `PendingEffect` (Darwin's Voyage):
  `freeResearchOnCompletion(WonderType, handler, count, …)` and `freeResearchStartedRules(handler, …)`.

Each factory makes, under the prefix `civ1-wonder`, the rules `civ1-wonder` 0.1.15 registers (ids, rule classes,
priorities and criteria, pinned in `tests/fixtures/civ1-wonder.json`), so `civ1-wonder` can adopt them unchanged.
