import Wonder from '@civ-clone/core-wonder/Wonder';

/**
 * Whether a Wonder stands: its city is still there. One whose city is destroyed is lost, nobody's, and does nothing,
 *  even should it still be in the game's `WonderRegistry` (a game saved before the city's destruction unregistered
 *  it, say). What reads that registry for a Wonder that does something asks this as well.
 */
export const isStanding = (wonder: Wonder): boolean =>
  !wonder.city().destroyed();

export default isStanding;
