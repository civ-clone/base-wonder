import {
  PendingEffect,
  PendingEffectRegistry,
} from '@civ-clone/core-pending-effect';
import { table } from '@civ-clone/core-requirement/Requirement';
import {
  buildRulesFor,
  builtOnceRule,
  deriveBuildRules,
} from '../lib/buildRules';
import {
  cityHasImprovementOrWonder,
  hasImprovementOrWonder,
} from '../lib/hasImprovementOrWonder';
import {
  dropBuiltWonderRules,
  wonderBuiltRules,
  wonderDestroyedRules,
  wonderObsoleteRules,
} from '../lib/lifecycleRules';
import { everBuilt, wonderHistory, wonderStatus } from '../lib/wonderHistory';
import {
  freeResearchOnCompletion,
  freeResearchStartedRules,
} from '../lib/freeResearch';
import { obsoleteRulesFor } from '../lib/obsoleteRules';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import Engine from '@civ-clone/core-engine/Engine';
import LandMassRegistry from '@civ-clone/core-world/LandMassRegistry';
import Obsolete from '@civ-clone/core-wonder/Rules/Obsolete';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import RequirementRegistry from '@civ-clone/core-requirement/RequirementRegistry';
import Rule from '@civ-clone/core-rule/Rule';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Wonder from '@civ-clone/core-wonder/Wonder';
import WonderRegistry from '@civ-clone/core-wonder/WonderRegistry';
import Yield from '@civ-clone/core-yield/Yield';
import { expect } from 'chai';
import { greatLibraryRules } from '../lib/greatLibraryRules';
import { onWonderLandMass } from '../lib/onWonderLandMass';
import { readFileSync } from 'fs';
import { join } from 'path';

// Stand-ins named as civ1-wonder's subjects, so the ids the fingerprints compare are the same.
class Colossus extends Wonder {}
class Nuclear {}
class GreatLibrary extends Wonder {}
class DarwinsVoyage extends Wonder {}
class Pyramids extends Wonder {}
class Granary extends CityImprovement {}
class BronzeWorking extends Advance {}
class Electricity extends Advance {}
class Production extends Yield {}
class Trade extends Yield {}

// civ1-wonder 0.1.15's compiled rules: id, rule class, priority, criteria count (`d2w/dump-civ1-wonder.js`).
const civ1: { [key: string]: [string | null, string, number, number][] } =
  JSON.parse(
    readFileSync(
      join(process.cwd(), 'tests', 'fixtures', 'civ1-wonder.json'),
      'utf8'
    )
  );

const fingerprint = (rule: Rule<any, any>) => [
  rule.id(),
  rule.constructor.name,
  rule.priority().value(),
  (rule as any)._criteria ? (rule as any)._criteria._criteria.length : 0,
];

const setUp = () => {
  const ruleRegistry = new RuleRegistry(),
    advanceRegistry = new AdvanceRegistry(),
    wonderRegistry = new WonderRegistry(),
    cityImprovementRegistry = new CityImprovementRegistry(),
    cityBuildRegistry = new CityBuildRegistry(),
    playerResearchRegistry = new PlayerResearchRegistry(),
    requirementRegistry = new RequirementRegistry(ruleRegistry),
    landMassRegistry = new LandMassRegistry(),
    pendingEffects = new PendingEffectRegistry(),
    players = [0, 1, 2, 3].map(() => new Player(ruleRegistry)),
    research = players.map(
      (player: Player): PlayerResearch =>
        new PlayerResearch(player, advanceRegistry, ruleRegistry)
    ),
    city = (player: Player, tile: object = {}) => {
      let destroyed = false;

      return {
        destroyed: (): boolean => destroyed,
        destroy: (): void => {
          destroyed = true;
        },
        player: (): Player => player,
        tile: () => tile,
      } as unknown as City & { destroy(): void };
    },
    build = (wonder: Wonder): Wonder => {
      cityImprovementRegistry.register(wonder);
      wonderRegistry.register(wonder);

      return wonder;
    },
    // Loses `wonder` with its city, as a ruleset's `Destroyed` rules do.
    lose = (wonder: Wonder): void => {
      (wonder.city() as City & { destroy(): void }).destroy();
      wonder.destroy();
      wonderRegistry.unregister(wonder);
    };

  advanceRegistry.register(BronzeWorking, Electricity);
  playerResearchRegistry.register(...research);

  return {
    ruleRegistry,
    wonderRegistry,
    cityImprovementRegistry,
    cityBuildRegistry,
    playerResearchRegistry,
    requirementRegistry,
    landMassRegistry,
    pendingEffects,
    players,
    research,
    city,
    build,
    lose,
  };
};

describe('rule factories, as civ1-wonder registers them', (): void => {
  const requiresAdvance = table(
      'civ1-wonder:city/build/requires-advance',
      'requires',
      [[Colossus, BronzeWorking]]
    ),
    requiresWonder = table(
      'civ1-wonder:city/build/requires-wonder',
      'requires',
      [[Nuclear, Colossus]],
      { range: 'world' }
    ),
    obsoletedBy = table(
      'civ1-wonder:wonder/obsolete',
      'obsoletedBy',
      [[Colossus, Electricity]],
      { range: 'world' }
    );

  (
    [
      ['builtOnce', () => [builtOnceRule('civ1-wonder')]],
      [
        'buildingComplete',
        () => [
          ...wonderBuiltRules(),
          freeResearchOnCompletion(
            DarwinsVoyage,
            'civ1-wonder:darwins-voyage',
            2
          ),
        ],
      ],
      ['destroyed', () => wonderDestroyedRules()],
      ['processYield', () => dropBuiltWonderRules('civ1-wonder', Production)],
      ['greatLibrary', () => greatLibraryRules({ GreatLibrary, holders: 3 })],
      ['obsoleteAnnounced', () => wonderObsoleteRules()],
      [
        'started',
        () =>
          freeResearchStartedRules(
            'civ1-wonder:darwins-voyage',
            new PendingEffectRegistry()
          ),
      ],
      ['requiresAdvance0', () => buildRulesFor(requiresAdvance[0])],
      ['requiresWonder0', () => buildRulesFor(requiresWonder[0])],
      ['obsolete0', () => obsoleteRulesFor(obsoletedBy[0])],
    ] as [string, () => Rule<any, any>[]][]
  ).forEach(([key, rules]): void =>
    it(`makes ${key} as civ1-wonder does`, (): void => {
      expect(rules().map(fingerprint)).to.deep.equal(civ1[key]);
    })
  );
});

describe('wonderHistory', (): void => {
  it('says whether a Wonder was ever built: never, standing, then still once lost', (): void => {
    const {
        wonderRegistry,
        cityImprovementRegistry,
        city,
        players,
        build,
        lose,
      } = setUp(),
      ever = (): boolean =>
        everBuilt(Colossus, wonderRegistry, cityImprovementRegistry);

    expect(ever()).false;
    expect(
      wonderStatus(Colossus, wonderRegistry, cityImprovementRegistry).state
    ).to.equal('never');

    const colossus = build(new Colossus(city(players[0])));

    expect(ever()).true;
    expect(
      wonderStatus(Colossus, wonderRegistry, cityImprovementRegistry)
    ).to.include({ state: 'standing', wonder: colossus, owner: players[0] });

    lose(colossus);

    expect(ever()).true;
    expect(
      wonderStatus(Colossus, wonderRegistry, cityImprovementRegistry)
    ).to.include({ state: 'lost', wonder: colossus, owner: null });
  });

  it('lists every Wonder ever built in the order given, then the rest as first built', (): void => {
    const { wonderRegistry, cityImprovementRegistry, city, players, build } =
      setUp();

    build(new GreatLibrary(city(players[0])));
    build(new Pyramids(city(players[1])));
    build(new Colossus(city(players[1])));

    expect(
      wonderHistory(
        [Colossus, Pyramids],
        wonderRegistry,
        cityImprovementRegistry
      ).map(({ type }) => type)
    ).to.deep.equal([Colossus, Pyramids, GreatLibrary]);
  });
});

describe('builtOnceRule', (): void => {
  it('offers a Wonder only until anyone has built it, even once it is lost', (): void => {
    const {
        wonderRegistry,
        cityImprovementRegistry,
        city,
        players,
        build,
        lose,
      } = setUp(),
      rule = builtOnceRule(
        'civ2-wonder',
        wonderRegistry,
        cityImprovementRegistry
      ),
      here = city(players[1]),
      offered = (): boolean => (rule.process(here, Colossus) as any).validate();

    expect(rule.id()).to.equal('civ2-wonder:city/build/once');
    expect(rule.validate(here, Colossus)).true;
    expect(rule.validate(here, Granary)).false;
    expect(offered()).true;

    const colossus = build(new Colossus(city(players[0])));

    expect(offered()).false;

    lose(colossus);

    expect(offered()).false;
  });
});

describe('buildRulesFor', (): void => {
  it('needs the advance of the city’s player', (): void => {
    const {
        playerResearchRegistry,
        wonderRegistry,
        cityImprovementRegistry,
        research,
        city,
        players,
      } = setUp(),
      [rule] = buildRulesFor(
        table('test:requires', 'requires', [[Colossus, BronzeWorking]])[0],
        playerResearchRegistry,
        wonderRegistry,
        cityImprovementRegistry
      ),
      here = city(players[0]),
      allowed = (): boolean => (rule.process(here, Colossus) as any).validate();

    expect(rule.validate(here, Colossus)).true;
    expect(rule.validate(here, Pyramids)).false;
    expect(allowed()).false;

    research[1].addAdvance(BronzeWorking);

    expect(allowed()).false;

    research[0].addAdvance(BronzeWorking);

    expect(allowed()).true;
  });

  it('needs a `world` Wonder built by anyone, ever', (): void => {
    const {
        playerResearchRegistry,
        wonderRegistry,
        cityImprovementRegistry,
        city,
        players,
        build,
        lose,
      } = setUp(),
      [rule] = buildRulesFor(
        table('test:requires', 'requires', [[Nuclear, Colossus]], {
          range: 'world',
        })[0],
        playerResearchRegistry,
        wonderRegistry,
        cityImprovementRegistry
      ),
      here = city(players[0]),
      allowed = (): boolean => (rule.process(here, Nuclear) as any).validate();

    expect(allowed()).false;

    const colossus = build(new Colossus(city(players[2])));

    expect(allowed()).true;

    lose(colossus);

    expect(allowed()).true;
  });

  it('needs a `player` Wonder standing in one of the player’s cities', (): void => {
    const {
        playerResearchRegistry,
        wonderRegistry,
        cityImprovementRegistry,
        city,
        players,
        build,
        lose,
      } = setUp(),
      [rule] = buildRulesFor(
        table('test:requires', 'requires', [[Nuclear, Colossus]], {
          range: 'player',
        })[0],
        playerResearchRegistry,
        wonderRegistry,
        cityImprovementRegistry
      ),
      here = city(players[0]),
      allowed = (): boolean => (rule.process(here, Nuclear) as any).validate();

    build(new Colossus(city(players[2])));

    expect(allowed()).false;

    const own = build(new Colossus(city(players[0])));

    expect(allowed()).true;

    lose(own);

    expect(allowed()).false;
  });

  it('makes no rule for another relation, and `deriveBuildRules` makes the same', (): void => {
    const { playerResearchRegistry, wonderRegistry } = setUp(),
      [entry] = table(
        'test:obsolete',
        'obsoletedBy',
        [[Colossus, Electricity]],
        {
          range: 'world',
        }
      );

    expect(buildRulesFor(entry)).to.deep.equal([]);
    expect(
      deriveBuildRules(
        playerResearchRegistry,
        wonderRegistry
      )(table('test:requires', 'requires', [[Colossus, BronzeWorking]])[0]).map(
        fingerprint
      )
    ).to.deep.equal([['test:requires/Colossus', 'Build', 2000, 1]]);
  });
});

describe('obsoleteRulesFor', (): void => {
  it('announces a standing Wonder obsolete on the first discovery only', (): void => {
    const {
        ruleRegistry,
        playerResearchRegistry,
        wonderRegistry,
        research,
        city,
        players,
        build,
      } = setUp(),
      [entry] = table(
        'test:obsolete',
        'obsoletedBy',
        [[Colossus, Electricity]],
        {
          range: 'world',
        }
      ),
      [rule] = obsoleteRulesFor(
        entry,
        playerResearchRegistry,
        ruleRegistry,
        wonderRegistry
      ),
      announced: Wonder[] = [],
      electricity = new Electricity(),
      bronze = new BronzeWorking();

    ruleRegistry.register(
      new Obsolete(
        new Effect((wonder: Wonder): void => {
          announced.push(wonder);
        })
      )
    );

    research[1].addAdvance(Electricity);

    expect(rule.validate(research[1], electricity)).false;

    const colossus = build(new Colossus(city(players[0])));

    expect(rule.validate(research[1], bronze)).false;
    expect(rule.validate(research[1], electricity)).true;

    rule.process(research[1], electricity);

    expect(announced).to.deep.equal([colossus]);

    research[2].addAdvance(Electricity);

    expect(rule.validate(research[2], electricity)).false;
  });

  it('refuses an entry of another range or of more than one advance', (): void => {
    expect(() =>
      obsoleteRulesFor(
        table('test:obsolete', 'obsoletedBy', [[Colossus, Electricity]])[0]
      )
    ).to.throw(TypeError);
    expect(() =>
      obsoleteRulesFor(
        table(
          'test:obsolete',
          'obsoletedBy',
          [[Colossus, Electricity, BronzeWorking]],
          { range: 'world' }
        )[0]
      )
    ).to.throw(TypeError);
    expect(
      obsoleteRulesFor(
        table('test:requires', 'requires', [[Colossus, Electricity]])[0]
      )
    ).to.deep.equal([]);
  });
});

describe('lifecycle rules', (): void => {
  const cityBuild = (city: City, Item: any = null) => {
    let revalidated = 0;

    // A `CityBuild` the registry accepts, answering only what the rules ask.
    return Object.assign(Object.create(CityBuild.prototype), {
      city: (): City => city,
      building: () => (Item === null ? null : { item: () => Item }),
      revalidate: (): void => {
        revalidated++;
      },
      revalidated: (): number => revalidated,
    }) as CityBuild & { revalidated(): number };
  };

  it('registers a completed Wonder, revalidates rivals building it, and emits `wonder:built`', (): void => {
    const { cityBuildRegistry, wonderRegistry, city, players } = setUp(),
      events: unknown[][] = [],
      engine = {
        emit: (...args: unknown[]): void => {
          events.push(args);
        },
      } as unknown as Engine,
      here = city(players[0]),
      rival = cityBuild(city(players[1]), Colossus),
      other = cityBuild(city(players[2]), Pyramids),
      own = cityBuild(here),
      colossus = new Colossus(here),
      rules = wonderBuiltRules(cityBuildRegistry, wonderRegistry, engine);

    cityBuildRegistry.register(rival, other);

    expect(rules.every((rule) => rule.validate(own, new Granary(here)))).false;

    rules.forEach((rule) => rule.process(own, colossus));

    expect(wonderRegistry.entries()).to.deep.equal([colossus]);
    expect(rival.revalidated()).to.equal(1);
    expect(other.revalidated()).to.equal(0);
    expect(events).to.deep.equal([['wonder:built', colossus, here]]);
  });

  it('takes a destroyed city’s Wonders out of `wonders`', (): void => {
    const { wonderRegistry, city, players, build } = setUp(),
      here = city(players[0]),
      [rule] = wonderDestroyedRules(wonderRegistry);

    expect(rule.validate(here)).false;

    build(new Colossus(here));
    const kept = build(new Pyramids(city(players[1])));

    expect(rule.validate(here)).true;

    rule.process(here);

    expect(wonderRegistry.entries()).to.deep.equal([kept]);
  });

  it('drops a build of a Wonder built since, as production is processed', (): void => {
    const {
        cityBuildRegistry,
        wonderRegistry,
        cityImprovementRegistry,
        city,
        players,
        build,
      } = setUp(),
      here = city(players[0]),
      own = cityBuild(here, Colossus),
      [rule] = dropBuiltWonderRules(
        'civ2-wonder',
        Production,
        cityBuildRegistry,
        wonderRegistry,
        cityImprovementRegistry
      );

    cityBuildRegistry.register(own);

    expect(rule.id()).to.equal(
      'civ2-wonder:city/process-yield/drop-built-wonder'
    );
    expect(rule.validate(new Production(1), here)).false;

    build(new Colossus(city(players[1])));

    expect(rule.validate(new Trade(1), here)).false;
    expect(rule.validate(new Production(1), here)).true;

    rule.process(new Production(1), here);

    expect(own.revalidated()).to.equal(1);
  });

  it('emits `wonder:obsolete`', (): void => {
    const { city, players } = setUp(),
      events: unknown[][] = [],
      engine = {
        emit: (...args: unknown[]): void => {
          events.push(args);
        },
      } as unknown as Engine,
      here = city(players[0]),
      colossus = new Colossus(here);

    wonderObsoleteRules(engine).forEach((rule) => rule.process(colossus, here));

    expect(events).to.deep.equal([['wonder:obsolete', colossus, here]]);
  });
});

describe('greatLibraryRules', (): void => {
  const run = (holders: number, knownBy: number) => {
    const {
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry,
        research,
        city,
        players,
        build,
      } = setUp(),
      [rule] = greatLibraryRules(
        { GreatLibrary, holders },
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry
      ),
      advance = new BronzeWorking();

    build(new GreatLibrary(city(players[0])));

    research
      .slice(1, 1 + knownBy)
      .forEach((playerResearch) => playerResearch.addAdvance(BronzeWorking));

    if (rule.validate(research[1], advance)) {
      rule.process(research[1], advance);
    }

    return research[0].completed(BronzeWorking);
  };

  it('gives the owner an advance once `holders` players have it', (): void => {
    expect(run(2, 1)).false;
    expect(run(2, 2)).true;
    expect(run(3, 2)).false;
    expect(run(3, 3)).true;
  });

  it('counts only the players `counts` allows, and nothing once the Library is lost or obsolete', (): void => {
    const {
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry,
        research,
        city,
        players,
        build,
        lose,
      } = setUp(),
      advance = new BronzeWorking(),
      [counted] = greatLibraryRules(
        {
          GreatLibrary,
          holders: 2,
          counts: (playerResearch) => playerResearch !== research[2],
        },
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry
      ),
      [rule] = greatLibraryRules(
        { GreatLibrary, holders: 2 },
        playerResearchRegistry,
        wonderRegistry,
        requirementRegistry
      ),
      library = build(new GreatLibrary(city(players[0])));

    research[1].addAdvance(BronzeWorking);
    research[2].addAdvance(BronzeWorking);

    expect(counted.validate(research[1], advance)).false;
    expect(rule.validate(research[1], advance)).true;

    requirementRegistry.add(
      null,
      ...table('test:obsolete', 'obsoletedBy', [[GreatLibrary, Electricity]], {
        range: 'world',
      })
    );
    research[3].addAdvance(Electricity);

    expect(rule.validate(research[1], advance)).false;

    research[3].addAdvance(BronzeWorking);
    requirementRegistry.remove('test:obsolete/GreatLibrary');

    expect(rule.validate(research[1], advance)).true;

    lose(library);

    expect(rule.validate(research[1], advance)).false;
  });
});

describe('free research', (): void => {
  it('owes `count` completions: one at once while researching, the rest as research starts, kept in a pending effect', (): void => {
    const { playerResearchRegistry, pendingEffects, research, city, players } =
        setUp(),
      handler = 'test:darwins-voyage',
      [started] = freeResearchStartedRules(handler, pendingEffects),
      complete = freeResearchOnCompletion(
        DarwinsVoyage,
        handler,
        2,
        playerResearchRegistry,
        pendingEffects
      ),
      here = city(players[0]),
      added: number[] = [],
      playerResearch = research[0];

    // Count the completions given rather than run research.
    (playerResearch as any).researching = () => BronzeWorking;
    (playerResearch as any).add = (): void => {
      added.push(1);
    };

    expect(complete.validate({ city: () => here } as any, new Granary(here)))
      .false;
    expect(
      complete.validate({ city: () => here } as any, new DarwinsVoyage(here))
    ).true;

    complete.process({ city: () => here } as any, new DarwinsVoyage(here));

    expect(added.length).to.equal(1);

    const [owed] = pendingEffects.getByTarget(
      playerResearch
    ) as PendingEffect[];

    expect(owed.data()).to.deep.equal({ remaining: '1' });
    expect(started.validate(playerResearch, BronzeWorking)).true;
    expect(started.validate(research[1], BronzeWorking)).false;

    started.process(playerResearch, BronzeWorking);

    expect(added.length).to.equal(2);
    expect(pendingEffects.getByTarget(playerResearch)).to.deep.equal([]);
  });
});

describe('hasImprovementOrWonder', (): void => {
  it('is met by the improvement, by its standing unobsolete Wonder, or by both, once', (): void => {
    const registries = setUp(),
      {
        cityImprovementRegistry,
        requirementRegistry,
        research,
        city,
        players,
        build,
        lose,
      } = registries,
      here = city(players[0]),
      elsewhere = city(players[0]),
      rival = city(players[1]),
      has = (target: City): boolean =>
        cityHasImprovementOrWonder(target, Granary, Pyramids, registries),
      criterion = hasImprovementOrWonder(Granary, Pyramids, registries);

    expect(has(here)).false;
    expect(criterion.validate(here)).false;

    cityImprovementRegistry.register(new Granary(here));

    expect(has(here)).true;
    expect(has(elsewhere)).false;

    const pyramids = build(new Pyramids(elsewhere));

    expect(has(elsewhere)).true;
    expect(has(rival)).false;
    expect(criterion.validate(elsewhere)).true;

    requirementRegistry.add(
      null,
      ...table('test:obsolete', 'obsoletedBy', [[Pyramids, Electricity]], {
        range: 'world',
      })
    );
    research[3].addAdvance(Electricity);

    expect(has(elsewhere)).false;
    expect(has(here)).true;

    requirementRegistry.remove('test:obsolete/Pyramids');

    expect(has(elsewhere)).true;

    lose(pyramids);

    expect(has(here)).true;
    expect(has(city(players[0]))).false;
  });
});

describe('onWonderLandMass', (): void => {
  it('is met in the owner’s cities on the Wonder’s land mass only', (): void => {
    const {
        wonderRegistry,
        playerResearchRegistry,
        requirementRegistry,
        city,
        players,
        build,
      } = setUp(),
      [a, b, c] = [{}, {}, {}],
      landMassRegistry = {
        getByTile: (tile: object) =>
          tile === c ? null : { hasTile: (other: object) => other !== c },
      } as unknown as LandMassRegistry,
      criterion = onWonderLandMass(
        Colossus,
        wonderRegistry,
        playerResearchRegistry,
        landMassRegistry,
        requirementRegistry
      );

    expect(criterion.validate(city(players[0], b))).false;

    build(new Colossus(city(players[0], a)));

    expect(criterion.validate(city(players[0], b))).true;
    expect(criterion.validate(city(players[0], c))).false;
    expect(criterion.validate(city(players[1], b))).false;
  });
});
