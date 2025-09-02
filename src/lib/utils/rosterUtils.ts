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
export function isRosterInMatchup(matchup: { roster_id: string; opponent_roster_id: string }, rosterId: string | number): boolean {
  const normalizedRosterId = normalizeRosterId(rosterId);
  return matchup.roster_id === normalizedRosterId || matchup.opponent_roster_id === normalizedRosterId;
}

/**
 * Filters matchups for a specific roster
 * @param matchups - Array of matchups to filter
 * @param rosterId - The roster ID to filter by
 * @returns Array of matchups involving the roster
 */
export function filterMatchupsForRoster<T extends { roster_id: string; opponent_roster_id: string }>(
  matchups: T[],
  rosterId: string | number
): T[] {
  const normalizedRosterId = normalizeRosterId(rosterId);
  return matchups.filter(matchup => 
    matchup.roster_id === normalizedRosterId || matchup.opponent_roster_id === normalizedRosterId
  );
}

/**
 * Gets the team's points from a matchup
 * @param matchup - The matchup
 * @param rosterId - The roster ID
 * @returns The team's points
 */
export function getTeamPointsFromMatchup(
  matchup: { roster_id: string; opponent_roster_id: string; points: number; opponent_points: number },
  rosterId: string | number
): number {
  const normalizedRosterId = normalizeRosterId(rosterId);
  return matchup.roster_id === normalizedRosterId ? matchup.points : matchup.opponent_points;
}

/**
 * Gets the opponent's points from a matchup
 * @param matchup - The matchup
 * @param rosterId - The roster ID
 * @returns The opponent's points
 */
export function getOpponentPointsFromMatchup(
  matchup: { roster_id: string; opponent_roster_id: string; points: number; opponent_points: number },
  rosterId: string | number
): number {
  const normalizedRosterId = normalizeRosterId(rosterId);
  return matchup.roster_id === normalizedRosterId ? matchup.opponent_points : matchup.points;
}
