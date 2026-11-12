# base-wonder

Wonder ownership and obsolescence, as a library for a ruleset's Wonder rules:

- `lib/isStanding`: `isStanding(wonder)`, whether its city still stands. A Wonder whose city is destroyed does nothing,
  even should it still be in the `WonderRegistry`.
- `lib/obsolete`: `isObsolete(WonderType, playerResearchRegistry?, requirementRegistry?)`, whether anyone has met one
  of the Wonder's `obsoletedBy` requirements of the `world` range. The ruleset declares those entries; this reads them.
- `lib/hasWonder`: `cityHasWonder(WonderType, …)` and `playerHasWonder(WonderType, …)`, `Criterion`s for a city's (or a
  unit's player's) standing, unobsolete Wonder, and `playerOwnsWonder(player, WonderType, …)`, the same as a plain
  check. The registries default to `defaultGame`'s.

A library: it registers no rules. See `civ1-wonder` for Civilization's Wonders.
