import {
  RequirementRegistry,
  instance as requirementRegistryInstance,
} from '@civ-clone/core-requirement/RequirementRegistry';
import {
  LandMassRegistry,
  instance as landMassRegistryInstance,
} from '@civ-clone/core-world/LandMassRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Wonder from '@civ-clone/core-wonder/Wonder';
import { isObsolete } from './obsolete';
import { isStanding } from './isStanding';

/**
 * A `Criterion` on a city: its player owns a standing, unobsolete `WonderType`, and the city is on the same land mass
 *  as the city that holds it.
 */
export const onWonderLandMass = (
  WonderType: typeof Wonder,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  landMassRegistry: LandMassRegistry = landMassRegistryInstance,
  requirementRegistry: RequirementRegistry = requirementRegistryInstance
) =>
  new Criterion(
    (city: City): boolean =>
      !isObsolete(WonderType, playerResearchRegistry, requirementRegistry) &&
      wonderRegistry
        .getByPlayer(city.player())
        .some(
          (wonder: Wonder): boolean =>
            wonder instanceof WonderType &&
            isStanding(wonder) &&
            (landMassRegistry
              .getByTile(wonder.city().tile())
              ?.hasTile(city.tile()) ??
              false)
        )
  );

export default onWonderLandMass;
