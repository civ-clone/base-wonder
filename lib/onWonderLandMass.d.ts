import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { LandMassRegistry } from '@civ-clone/core-world/LandMassRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Wonder from '@civ-clone/core-wonder/Wonder';
/**
 * A `Criterion` on a city: its player owns a standing, unobsolete `WonderType`, and the city is on the same land mass
 *  as the city that holds it.
 */
export declare const onWonderLandMass: (
  WonderType: typeof Wonder,
  wonderRegistry?: WonderRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  landMassRegistry?: LandMassRegistry,
  requirementRegistry?: RequirementRegistry
) => Criterion<[city: City]>;
export default onWonderLandMass;
