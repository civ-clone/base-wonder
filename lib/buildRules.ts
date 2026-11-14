import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  Requirement,
  Target,
  met,
} from '@civ-clone/core-requirement/Requirement';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import Advance from '@civ-clone/core-science/Advance';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import { Deriver } from '@civ-clone/core-requirement/RequirementRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Wonder from '@civ-clone/core-wonder/Wonder';
import { everBuilt } from './wonderHistory';
import { isStanding } from './isStanding';

/**
 * A Wonder is built once in the world, and never again, even once it is lost with its city: `<prefix>:city/build/once`.
 *  Both Civilization (`marvel_site`) and Civilization II (OpenCiv2 `city_can_build_wonder` asks `wonder_city == -1`)
 *  offer a Wonder only while it has never been built.
 */
export const builtOnceRule = (
  prefix: string,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): Build =>
  new Build(
    `${prefix}:city/build/once`,
    Wonder,
    new Criterion((city: City, BuildItem: IConstructor): boolean =>
      Object.isPrototypeOf.call(Wonder, BuildItem)
    ),
    new Effect(
      (city: City, WonderType: IConstructor): IBuildCriterion =>
        new Criterion(
          (): boolean =>
            !everBuilt(
              WonderType as typeof Wonder,
              wonderRegistry,
              cityImprovementRegistry
            )
        )
    )
  );

/**
 * The rule a `requires` entry is played by: a city may build its subject only once each advance and Wonder it requires
 *  is held, by the city's player or, for a `world` entry, by anyone. A Wonder in a `world` entry counts once it has
 *  ever been built, even if it has been lost with its city since (`everBuilt`: Nuclear units and the Manhattan
 *  Project, in both games). In a `city` or `player` entry it counts only while it stands in that city or the player's
 *  (`isStanding`). Any other relation makes no rule.
 */
export const buildRulesFor = (
  entry: Requirement,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): Build[] => {
  if (entry.relation !== 'requires') {
    return [];
  }

  const has = (city: City, target: Target): boolean => {
    if (Object.prototype.isPrototypeOf.call(Wonder, target)) {
      const isTarget = (wonder: Wonder): boolean =>
        wonder instanceof (target as typeof Wonder) && isStanding(wonder);

      return entry.range === 'world'
        ? everBuilt(
            target as typeof Wonder,
            wonderRegistry,
            cityImprovementRegistry
          )
        : entry.range === 'city'
        ? wonderRegistry.getByCity(city).some(isTarget)
        : wonderRegistry.getByPlayer(city.player()).some(isTarget);
    }

    return entry.range === 'world'
      ? playerResearchRegistry.some((playerResearch: PlayerResearch): boolean =>
          playerResearch.completed(target as typeof Advance)
        )
      : playerResearchRegistry
          .getByPlayer(city.player())
          .completed(target as typeof Advance);
  };

  return [
    new Build(
      entry.id,
      entry.subject,
      new Criterion(
        (city: City, BuildItem: IConstructor): boolean =>
          BuildItem === entry.subject
      ),
      new Effect(
        (city: City): IBuildCriterion =>
          new Criterion((): boolean =>
            met(entry, (target: Target): boolean => has(city, target))
          )
      )
    ),
  ];
};

/** What a ruleset gives the game's `requirements` to make each `requires` entry's rule with. */
export const deriveBuildRules =
  (
    playerResearchRegistry: PlayerResearchRegistry,
    wonderRegistry: WonderRegistry,
    cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
  ): Deriver =>
  (entry: Requirement): Build[] =>
    buildRulesFor(
      entry,
      playerResearchRegistry,
      wonderRegistry,
      cityImprovementRegistry
    );
