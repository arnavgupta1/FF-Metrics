/**
 * Utility functions for roster ID operations
 * Handles type safety and consistent roster ID comparisons
 */

/**
 * Safely compares roster IDs, handling both string and number types
 * @param rosterId1 - First roster ID (can be string or number)
 * @param rosterId2 - Second roster ID (can be string or number)
 * @returns true if the roster IDs match
 */
export function compareRosterIds(rosterId1: string | number, rosterId2: string | number): boolean {
  return String(rosterId1) === String(rosterId2);
}

/**
 * Normalizes a roster ID to string format
 * @param rosterId - Roster ID in any format
 * @returns Roster ID as string
 */
export function normalizeRosterId(rosterId: string | number): string {
  return String(rosterId);
}

/**
 * Checks if a matchup involves a specific roster
 * @param matchup - The matchup to check
 * @param rosterId - The roster ID to look for
 * @returns true if the matchup involves the roster
 */
export function isRosterInMatchup(matchup: { roster_id: string | number }, rosterId: string | number): boolean {
  const normalizedRosterId = normalizeRosterId(rosterId);
  const normalizedMatchupRosterId = normalizeRosterId(matchup.roster_id);
  return normalizedMatchupRosterId === normalizedRosterId;
}

/**
 * Filters matchups for a specific roster
 * @param matchups - Array of matchups to filter
 * @param rosterId - The roster ID to filter by
 * @returns Array of matchups involving the roster
 */
export function filterMatchupsForRoster<T extends { roster_id: string | number }>(
  matchups: T[],
  rosterId: string | number
): T[] {
  const normalizedRosterId = normalizeRosterId(rosterId);
  return matchups.filter(matchup => 
    normalizeRosterId(matchup.roster_id) === normalizedRosterId
  );
}

/**
 * Gets the team's points from a matchup
 * @param matchup - The matchup
 * @param rosterId - The roster ID
 * @returns The team's points
 */
export function getTeamPointsFromMatchup(
  matchup: { roster_id: string | number; points: number },
  rosterId: string | number
): number {
  const normalizedRosterId = normalizeRosterId(rosterId);
  const normalizedMatchupRosterId = normalizeRosterId(matchup.roster_id);
  
  if (normalizedMatchupRosterId === normalizedRosterId) {
    return matchup.points;
  }
  
  console.warn(`[DEBUG] getTeamPointsFromMatchup: Roster ${rosterId} not found in matchup for roster ${matchup.roster_id}`);
  return 0;
}

/**
 * Gets the opponent's points from a matchup by finding the other team in the same matchup
 * @param allMatchups - All matchups for the week
 * @param matchup - The team's matchup
 * @param rosterId - The roster ID
 * @returns The opponent's points
 */
export function getOpponentPointsFromMatchup(
  allMatchups: { roster_id: string | number; matchup_id: string | number; points: number }[],
  matchup: { roster_id: string | number; matchup_id: string | number; points: number },
  rosterId: string | number
): number {
  // Find the opponent in the same matchup
  const opponentMatchup = allMatchups.find(m => 
    normalizeRosterId(m.matchup_id) === normalizeRosterId(matchup.matchup_id) &&
    normalizeRosterId(m.roster_id) !== normalizeRosterId(rosterId)
  );
  
  if (opponentMatchup) {
    return opponentMatchup.points;
  }
  
  console.warn(`[DEBUG] getOpponentPointsFromMatchup: No opponent found for roster ${rosterId} in matchup ${matchup.matchup_id}`);
  return 0;
}
