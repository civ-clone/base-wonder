import {
  cityHasWonder,
  playerHasWonder,
  playerOwnsWonder,
} from '../lib/hasWonder';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import Requirement from '@civ-clone/core-requirement/Requirement';
import RequirementRegistry from '@civ-clone/core-requirement/RequirementRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Wonder from '@civ-clone/core-wonder/Wonder';
import WonderRegistry from '@civ-clone/core-wonder/WonderRegistry';
import { expect } from 'chai';
import { isObsolete } from '../lib/obsolete';
import { isStanding } from '../lib/isStanding';

class Statue extends Wonder {}
class TallStatue extends Statue {}
class Tower extends Wonder {}
class Casting extends Advance {}
class Gears extends Advance {}

describe('base-wonder', (): void => {
  const setUp = () => {
    const ruleRegistry = new RuleRegistry(),
      advanceRegistry = new AdvanceRegistry(),
      wonderRegistry = new WonderRegistry(),
      playerResearchRegistry = new PlayerResearchRegistry(),
      requirementRegistry = new RequirementRegistry(ruleRegistry),
      [owner, other] = [new Player(ruleRegistry), new Player(ruleRegistry)],
      [ownerResearch, otherResearch] = [owner, other].map(
        (player: Player): PlayerResearch =>
          new PlayerResearch(player, advanceRegistry, ruleRegistry)
      ),
      city = (player: Player) => {
        let destroyed = false;

        return {
          destroyed: (): boolean => destroyed,
          destroy: (): void => {
            destroyed = true;
          },
          player: (): Player => player,
        } as unknown as City & { destroy(): void };
      };

    playerResearchRegistry.register(ownerResearch, otherResearch);

    return {
      ruleRegistry,
      wonderRegistry,
      playerResearchRegistry,
      requirementRegistry,
      owner,
      other,
      ownerResearch,
      otherResearch,
      city,
    };
  };

  describe('isStanding', (): void => {
    it('is true while its city stands, and false once it is destroyed', (): void => {
      const { city, owner, ruleRegistry } = setUp(),
        ownerCity = city(owner),
        statue = new Statue(ownerCity, ruleRegistry);

      expect(isStanding(statue)).true;

      ownerCity.destroy();

      expect(isStanding(statue)).false;
    });
  });

  describe('isObsolete', (): void => {
    it('is obsolete once anyone meets a world-range obsoletedBy entry', (): void => {
      const {
        playerResearchRegistry,
        requirementRegistry,
        otherResearch,
        ownerResearch,
      } = setUp();

      requirementRegistry.register(
        new Requirement({
          id: 'test:statue/obsolete',
          subject: Statue,
          relation: 'obsoletedBy',
          targets: [Casting],
          range: 'world',
        })
      );

      expect(isObsolete(Statue, playerResearchRegistry, requirementRegistry))
        .false;
      expect(isObsolete(Tower, playerResearchRegistry, requirementRegistry))
        .false;

      ownerResearch.addAdvance(Gears);

      expect(isObsolete(Statue, playerResearchRegistry, requirementRegistry))
        .false;

      // Not the owner: anyone's discovery counts, and it applies to subclasses.
      otherResearch.addAdvance(Casting);

      expect(isObsolete(Statue, playerResearchRegistry, requirementRegistry))
        .true;
      expect(
        isObsolete(TallStatue, playerResearchRegistry, requirementRegistry)
      ).true;
      expect(isObsolete(Tower, playerResearchRegistry, requirementRegistry))
        .false;
    });

    it('ignores entries of any other range', (): void => {
      const { playerResearchRegistry, requirementRegistry, otherResearch } =
        setUp();

      requirementRegistry.register(
        new Requirement({
          id: 'test:statue/obsolete',
          subject: Statue,
          relation: 'obsoletedBy',
          targets: [Casting],
          range: 'player',
        })
      );

      otherResearch.addAdvance(Casting);

      expect(isObsolete(Statue, playerResearchRegistry, requirementRegistry))
        .false;
    });

    it('needs every target unless the entry says any', (): void => {
      const { playerResearchRegistry, requirementRegistry, otherResearch } =
        setUp();

      requirementRegistry.register(
        new Requirement({
          id: 'test:statue/obsolete',
          subject: Statue,
          relation: 'obsoletedBy',
          targets: [Casting, Gears],
          range: 'world',
        }),
        new Requirement({
          id: 'test:tower/obsolete',
          subject: Tower,
          relation: 'obsoletedBy',
          targets: [Casting, Gears],
          range: 'world',
          mode: 'any',
        })
      );

      otherResearch.addAdvance(Casting);

      expect(isObsolete(Statue, playerResearchRegistry, requirementRegistry))
        .false;
      expect(isObsolete(Tower, playerResearchRegistry, requirementRegistry))
        .true;

      otherResearch.addAdvance(Gears);

      expect(isObsolete(Statue, playerResearchRegistry, requirementRegistry))
        .true;
    });
  });

  describe('hasWonder', (): void => {
    it('holds for the city and player with a standing, unobsolete Wonder', (): void => {
      const {
          city,
          owner,
          other,
          otherResearch,
          ruleRegistry,
          wonderRegistry,
          playerResearchRegistry,
          requirementRegistry,
        } = setUp(),
        ownerCity = city(owner),
        otherCity = city(other),
        unit = { player: (): Player => owner } as unknown as City,
        inCity = cityHasWonder(
          Statue,
          wonderRegistry,
          playerResearchRegistry,
          requirementRegistry
        ),
        forPlayer = playerHasWonder(
          Statue,
          wonderRegistry,
          playerResearchRegistry,
          requirementRegistry
        ),
        owns = (player: Player, WonderType: typeof Wonder = Statue) =>
          playerOwnsWonder(
            player,
            WonderType,
            wonderRegistry,
            playerResearchRegistry,
            requirementRegistry
          );

      requirementRegistry.register(
        new Requirement({
          id: 'test:statue/obsolete',
          subject: Statue,
          relation: 'obsoletedBy',
          targets: [Casting],
          range: 'world',
        })
      );

      expect(inCity.validate(ownerCity)).false;
      expect(owns(owner)).false;

      // A subclass counts as its parent.
      wonderRegistry.register(new TallStatue(ownerCity, ruleRegistry));

      expect(inCity.validate(ownerCity)).true;
      expect(inCity.validate(otherCity)).false;
      expect(forPlayer.validate(ownerCity)).true;
      expect(forPlayer.validate(unit)).true;
      expect(forPlayer.validate(otherCity)).false;
      expect(owns(owner)).true;
      expect(owns(other)).false;
      expect(owns(owner, Tower)).false;

      otherResearch.addAdvance(Casting);

      expect(inCity.validate(ownerCity)).false;
      expect(forPlayer.validate(ownerCity)).false;
      expect(owns(owner)).false;
    });

    it('does not hold for a Wonder whose city is destroyed', (): void => {
      const {
          city,
          owner,
          ruleRegistry,
          wonderRegistry,
          playerResearchRegistry,
          requirementRegistry,
        } = setUp(),
        ownerCity = city(owner),
        inCity = cityHasWonder(
          Statue,
          wonderRegistry,
          playerResearchRegistry,
          requirementRegistry
        );

      wonderRegistry.register(new Statue(ownerCity, ruleRegistry));

      expect(inCity.validate(ownerCity)).true;

      ownerCity.destroy();

      expect(inCity.validate(ownerCity)).false;
      expect(
        playerOwnsWonder(
          owner,
          Statue,
          wonderRegistry,
          playerResearchRegistry,
          requirementRegistry
        )
      ).false;
    });
  });
});
