import { 
  SleeperLeague, 
  SleeperRoster, 
  SleeperUser, 
  SleeperPlayer, 
  SleeperMatchup,
  Team,
  PlayerValue
} from '@/types';
import { FantasyAnalytics } from './calculations';
import { 
  filterMatchupsForRoster, 
  getTeamPointsFromMatchup, 
  getOpponentPointsFromMatchup,
  isRosterInMatchup 
} from '@/lib/utils/rosterUtils';

export class DataProcessor {
  /**
   * Process raw Sleeper data into Team objects with calculated metrics
   */
  static processTeams(
    rosters: SleeperRoster[],
    users: SleeperUser[],
    matchups: SleeperMatchup[][],
    players: Record<string, SleeperPlayer>,
    projections?: Record<string, any>
  ): Team[] {
    console.log(`[DEBUG] DataProcessor.processTeams called with:`);
    console.log(`[DEBUG] - rosters:`, rosters?.length || 0, 'items');
    console.log(`[DEBUG] - users:`, users?.length || 0, 'items');
    console.log(`[DEBUG] - matchups:`, matchups?.length || 0, 'weeks');
    console.log(`[DEBUG] - players:`, players ? Object.keys(players).length : 0, 'players');
    console.log(`[DEBUG] - projections:`, projections ? Object.keys(projections).length : 0, 'projections');
    
    const teams: Team[] = [];
    
    // Safety check: if no rosters or users, return empty array
    if (!rosters || !users || rosters.length === 0 || users.length === 0) {
      console.log(`[DEBUG] processTeams: Missing rosters or users, returning empty array`);
      return teams;
    }
    
    rosters.forEach((roster) => {
      console.log(`[DEBUG] Processing roster ${roster.roster_id} owned by ${roster.owner_id}`);
      const user = users.find(u => u.user_id === roster.owner_id);
      if (!user) {
        console.log(`[DEBUG] No user found for owner_id ${roster.owner_id}`);
        return;
      }

      // Safety check: if no matchups, set all matchup-dependent values to 0
      const teamMatchups = matchups && matchups.length > 0 ? filterMatchupsForRoster(matchups.flat(), roster.roster_id) : [];
      console.log(`[DEBUG] Team ${user.display_name} has ${teamMatchups.length} matchups`);

      const wins = this.calculateWins(roster.roster_id, teamMatchups, roster.settings);
      const losses = roster.settings?.losses || (teamMatchups.length - wins);
      const actualPoints = this.calculateTotalPoints(roster.roster_id, teamMatchups, roster.settings);
      const opponentPoints = this.calculateOpponentPoints(roster.roster_id, teamMatchups, roster.settings, matchups ? matchups.flat() : []);
      
      console.log(`[DEBUG] Team ${user.display_name}: ${wins}-${losses}, ${actualPoints.toFixed(2)} pts, opponent: ${opponentPoints.toFixed(2)} pts`);
      
      // Calculate advanced metrics
      const selfInflictedLosses = this.calculateSelfInflictedLosses(roster.roster_id, teamMatchups, players, projections);
      const potentialWins = this.calculatePotentialWins(roster.roster_id, teamMatchups, players);
      
      teams.push({
        id: roster.roster_id,
        owner: user.display_name,
        wins,
        losses,
        sleeperRank: 0, // Will be calculated after sorting
        actualPoints,
        opponentPoints,
        selfInflictedLosses,
        potentialWins
      });
    });

    // Sort by wins and assign Sleeper ranks
    teams.sort((a, b) => b.wins - a.wins || b.actualPoints - a.actualPoints);
    teams.forEach((team, index) => {
      team.sleeperRank = index + 1;
    });

    return teams;
  }

  /**
   * Process raw player data into PlayerValue objects with VORP, VOBP
   */
  static processPlayerValues(
    rosters: SleeperRoster[],
    users: SleeperUser[],
    players: Record<string, SleeperPlayer>,
    stats?: Record<string, any>
  ): PlayerValue[] {
    console.log(`[DEBUG] DataProcessor.processPlayerValues called with:`);
    console.log(`[DEBUG] - rosters:`, rosters?.length || 0, 'items');
    console.log(`[DEBUG] - users:`, users?.length || 0, 'items');
    console.log(`[DEBUG] - players:`, players ? Object.keys(players).length : 0, 'players');
    console.log(`[DEBUG] - stats:`, stats ? Object.keys(stats).length : 0, 'player stats');
    
    const playerValues: PlayerValue[] = [];
    
    // Safety check: if no rosters or users, return empty array
    if (!rosters || !users || rosters.length === 0 || users.length === 0) {
      console.log(`[DEBUG] processPlayerValues: Missing rosters or users, returning empty array`);
      return playerValues;
    }
    
    rosters.forEach((roster) => {
      const user = users.find(u => u.user_id === roster.owner_id);
      if (!user) return;

      // Safety check: if no players on roster, skip
      if (!roster.players || roster.players.length === 0) {
        return;
      }

      roster.players.forEach((playerId) => {
        const player = players[playerId];
        if (!player) {
          console.log(`[DEBUG] Player ${playerId} not found in players data`);
          return;
        }

        // Extract player name from first_name and last_name fields
        const playerName = player.first_name && player.last_name 
          ? `${player.first_name} ${player.last_name}`
          : player.first_name || player.last_name || `Player ${playerId}`;
        
        const position = player.position || 'UNK';
        
        // Get player points from stats
        const points = this.getPlayerPoints(playerId, stats) || 0;
        
        // Calculate VORP using actual stats if available
        const vorp = this.calculateVORP(playerId, position, points, stats);
        
        // Calculate VOBP using team's best bench player
        const vobp = this.calculateVOBP(playerId, roster, players, stats);
        
        console.log(`[DEBUG] Player ${playerName} (${position}): ${points.toFixed(2)} pts, VORP: ${vorp.toFixed(2)}, VOBP: ${vobp.toFixed(2)}`);

        playerValues.push({
          id: playerId,
          name: playerName,
          owner: user.display_name,
          position,
          points,
          rank: 0, // Will be calculated after sorting
          vorp,
          vobp
        });
      });
    });

    // Sort by points and assign ranks within each position
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
    positions.forEach(pos => {
      const posPlayers = playerValues.filter(p => p.position === pos);
      posPlayers.sort((a, b) => b.points - a.points);
      posPlayers.forEach((player, index) => {
        player.rank = index + 1;
      });
    });

    return playerValues;
  }

  /**
   * Calculate optimal lineup average for power rankings
   */
  private static calculateOptimalLineupAverage(
    roster: SleeperRoster, 
    players: Record<string, SleeperPlayer>, 
    matchups: SleeperMatchup[][]
  ): number {
    // Safety check: if no matchups or no players, return 0
    if (!matchups || matchups.length === 0 || !roster.players || roster.players.length === 0) {
      return 0;
    }

    let totalOptimalPoints = 0;
    let weeksWithData = 0;

    matchups.forEach((weekMatchups, weekIndex) => {
      const teamMatchup = weekMatchups.find(m => 
        isRosterInMatchup(m, roster.roster_id)
      );
      
      if (teamMatchup) {
        const optimalPoints = this.calculateOptimalLineupForWeek(roster, players, weekIndex + 1);
        if (optimalPoints > 0) {
          totalOptimalPoints += optimalPoints;
          weeksWithData++;
        }
      }
    });

    return weeksWithData > 0 ? totalOptimalPoints / weeksWithData : 0;
  }

  /**
   * Calculate optimal lineup for a specific week
   */
  private static calculateOptimalLineupForWeek(
    roster: SleeperRoster,
    players: Record<string, SleeperPlayer>,
    week: number
  ): number {
    // This would use actual weekly stats to find the best possible lineup
    // For now, using a simplified calculation based on season totals
    const positionLimits = { QB: 1, RB: 2, WR: 2, TE: 1, K: 1, FLEX: 1 };
    const availablePlayers = roster.players.map(id => players[id]).filter(Boolean);
    
    // Sort players by position and points
    const sortedPlayers = availablePlayers.sort((a, b) => (b.points || 0) - (a.points || 0));
    
    let optimalPoints = 0;
    let usedPositions: Record<string, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, FLEX: 0 };

    sortedPlayers.forEach(player => {
      const pos = player.position;
      if (pos in usedPositions && usedPositions[pos] < (positionLimits[pos as keyof typeof positionLimits] || 0)) {
        optimalPoints += player.points || 0;
        usedPositions[pos]++;
      } else if (usedPositions.FLEX < positionLimits.FLEX && ['RB', 'WR', 'TE'].includes(pos)) {
        optimalPoints += player.points || 0;
        usedPositions.FLEX++;
      }
    });

    return optimalPoints;
  }

  /**
   * Calculate recent form (last N weeks)
   */
  private static calculateRecentForm(
    rosterId: string, 
    matchups: SleeperMatchup[][], 
    weeks: number
  ): number {
    // Safety check: if no matchups, return 0
    if (!matchups || matchups.length === 0) {
      return 0;
    }

    const recentWeeks = matchups.slice(-weeks);
    let totalPoints = 0;
    let weeksWithData = 0;

    recentWeeks.forEach(weekMatchups => {
      const teamMatchup = weekMatchups.find(m => 
        isRosterInMatchup(m, rosterId)
      );
      
      if (teamMatchup) {
        totalPoints += getTeamPointsFromMatchup(teamMatchup, rosterId);
        weeksWithData++;
      }
    });

    return weeksWithData > 0 ? totalPoints / weeksWithData : 0;
  }

  /**
   * Calculate self-inflicted losses using projections vs actual
   */
  private static calculateSelfInflictedLosses(
    rosterId: string, 
    matchups: SleeperMatchup[], 
    players: Record<string, SleeperPlayer>,
    projections?: Record<string, any>
  ): number {
    // Safety check: if no matchups or no projections, return 0
    if (!matchups || matchups.length === 0 || !projections) {
      return 0;
    }

    let selfInflictedLosses = 0;

    matchups.forEach(matchup => {
      if (isRosterInMatchup(matchup, rosterId)) {
        const teamPoints = getTeamPointsFromMatchup(matchup, rosterId);
        const opponentPoints = 0; // TODO: Implement opponent points calculation for potential wins
        
        // Calculate projected points for this team
        const projectedPoints = this.calculateProjectedPoints(rosterId, matchup, projections);
        
        if (projectedPoints > opponentPoints && teamPoints < opponentPoints) {
          selfInflictedLosses++;
        }
      }
    });

    return selfInflictedLosses;
  }

  /**
   * Calculate potential wins using optimal vs actual lineups
   */
  private static calculatePotentialWins(
    rosterId: string, 
    matchups: SleeperMatchup[], 
    players: Record<string, SleeperPlayer>
  ): number {
    // Safety check: if no matchups, return 0
    if (!matchups || matchups.length === 0) {
      return 0;
    }

    let potentialWins = 0;

    matchups.forEach(matchup => {
      if (isRosterInMatchup(matchup, rosterId)) {
        const teamPoints = getTeamPointsFromMatchup(matchup, rosterId);
        const opponentPoints = 0; // TODO: Implement opponent points calculation for potential wins
        
        // Calculate optimal lineup points for this team
        const optimalPoints = this.calculateOptimalPointsForMatchup(rosterId, matchup, players);
        
        if (optimalPoints > opponentPoints && teamPoints < opponentPoints) {
          potentialWins++;
        }
      }
    });

    return potentialWins;
  }

  /**
   * Calculate VORP using actual stats
   */
  private static calculateVORP(
    playerId: string,
    position: string,
    playerPoints: number,
    stats?: Record<string, any>
  ): number {
    if (!stats) {
      // Fallback to simplified calculation
      return playerPoints * 0.1; // Simplified VORP
    }

    // Get replacement player points for this position
    const replacementPoints = this.getReplacementPlayerPoints(position, stats);
    return FantasyAnalytics.calculateVORP(playerPoints, replacementPoints);
  }

  /**
   * Calculate VOBP using team's best bench player
   */
  private static calculateVOBP(
    playerId: string,
    roster: SleeperRoster,
    players: Record<string, SleeperPlayer>,
    stats?: Record<string, any>
  ): number {
    // Safety check: if no players on roster, return 0
    if (!roster.players || roster.players.length === 0) {
      return 0;
    }

    const benchPlayers = roster.players.filter(id => !roster.starters.includes(id));
    
    // Safety check: if no bench players, return 0
    if (benchPlayers.length === 0) {
      return 0;
    }

    const benchPoints = benchPlayers.map(id => {
      const player = players[id];
      return this.getPlayerPoints(id, stats) || player.points || 0;
    });
    
    const bestBenchPoints = Math.max(...benchPoints, 0);
    const playerPoints = this.getPlayerPoints(playerId, stats) || players[playerId]?.points || 0;
    
    return FantasyAnalytics.calculateVOBP(playerPoints, bestBenchPoints);
  }

  /**
   * Get player points from stats or fallback to player object
   */
  private static getPlayerPoints(playerId: string, stats?: Record<string, any>): number {
    if (stats && stats[playerId]) {
      const playerStat = stats[playerId];
      const points = playerStat.pts_ppr || playerStat.pts_std || playerStat.pts_half_ppr || 0;
      console.log(`[DEBUG] Player ${playerId} points from stats: ${points}`);
      return points;
    }
    console.log(`[DEBUG] Player ${playerId} no stats available, returning 0`);
    return 0;
  }

  /**
   * Get replacement player points for a position
   */
  private static getReplacementPlayerPoints(position: string, stats: Record<string, any>): number {
    // This would calculate the actual replacement player points from stats
    // For now, using simplified position averages
    const positionAverages: Record<string, number> = {
      'QB': 200,
      'RB': 150,
      'WR': 140,
      'TE': 120,
      'K': 100
    };
    return positionAverages[position] || 0;
  }

  /**
   * Calculate projected points for a matchup
   */
  private static calculateProjectedPoints(
    rosterId: string,
    matchup: SleeperMatchup,
    projections: Record<string, any>
  ): number {
    // This would use actual projections data
    // For now, returning a simplified calculation
    return 100; // Placeholder
  }

  /**
   * Calculate optimal points for a matchup
   */
  private static calculateOptimalPointsForMatchup(
    rosterId: string,
    matchup: SleeperMatchup,
    players: Record<string, SleeperPlayer>
  ): number {
    // This would calculate the optimal lineup for this specific matchup
    // For now, returning a simplified calculation
    return 120; // Placeholder
  }

  private static calculateWins(rosterId: string, matchups: SleeperMatchup[], rosterSettings?: any): number {
    // First try to use roster settings if available (most reliable)
    if (rosterSettings && typeof rosterSettings.wins === 'number') {
      console.log(`[DEBUG] Using roster settings wins: ${rosterSettings.wins}`);
      return rosterSettings.wins;
    }

    // Fallback to matchups calculation
    // Safety check: if no matchups, return 0
    if (!matchups || matchups.length === 0) {
      console.log(`[DEBUG] No matchups available for wins calculation`);
      return 0;
    }

    const wins = matchups.filter(m => {
      if (!isRosterInMatchup(m, rosterId)) {
        return false;
      }
      
      const teamPoints = getTeamPointsFromMatchup(m, rosterId);
      const opponentPoints = 0; // TODO: Fix opponent points calculation
      return teamPoints > 0; // Simplified win condition since we need to refactor opponent points calculation
    }).length;
    
    console.log(`[DEBUG] Calculated wins from matchups: ${wins}`);
    return wins;
  }

  private static calculateTotalPoints(rosterId: string, matchups: SleeperMatchup[], rosterSettings?: any): number {
    // First try to use roster settings if available (most reliable)
    if (rosterSettings && typeof rosterSettings.fpts === 'number') {
      const points = rosterSettings.fpts + (rosterSettings.fpts_decimal || 0) / 100;
      console.log(`[DEBUG] Using roster settings total points: ${points}`);
      return points;
    }

    // Fallback to matchups calculation
    // Safety check: if no matchups, return 0
    if (!matchups || matchups.length === 0) {
      console.log(`[DEBUG] No matchups available for total points calculation`);
      return 0;
    }

    const points = matchups.reduce((total, m) => {
      if (isRosterInMatchup(m, rosterId)) {
        return total + getTeamPointsFromMatchup(m, rosterId);
      }
      return total;
    }, 0);
    
    console.log(`[DEBUG] Calculated points from matchups: ${points}`);
    return points;
  }

  private static calculateOpponentPoints(rosterId: string, matchups: SleeperMatchup[], rosterSettings?: any, allMatchups?: SleeperMatchup[]): number {
    // First try to use roster settings if available (most reliable)
    if (rosterSettings && typeof rosterSettings.fpts_against === 'number') {
      const points = rosterSettings.fpts_against + (rosterSettings.fpts_against_decimal || 0) / 100;
      console.log(`[DEBUG] Using roster settings opponent points: ${points}`);
      return points;
    }

    // Fallback to matchups calculation
    // Safety check: if no matchups, return 0
    if (!matchups || matchups.length === 0 || !allMatchups || allMatchups.length === 0) {
      console.log(`[DEBUG] No matchups available for opponent points calculation`);
      return 0;
    }

    const points = matchups.reduce((total, m) => {
      if (isRosterInMatchup(m, rosterId)) {
        return total + getOpponentPointsFromMatchup(allMatchups, m, rosterId);
      }
      return total;
    }, 0);
    
    console.log(`[DEBUG] Calculated opponent points from matchups: ${points}`);
    return points;
  }
}
