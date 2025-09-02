import { 
  SleeperLeague, 
  SleeperRoster, 
  SleeperUser, 
  SleeperPlayer, 
  SleeperMatchup,
  Team,
  PlayerValue,
  PowerRanking
} from '@/types';
import { FantasyAnalytics } from './calculations';

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
    const teams: Team[] = [];
    
    // Safety check: if no rosters or users, return empty array
    if (!rosters || !users || rosters.length === 0 || users.length === 0) {
      return teams;
    }
    
    rosters.forEach((roster) => {
      const user = users.find(u => u.user_id === roster.owner_id);
      if (!user) return;

      // Safety check: if no matchups, set all matchup-dependent values to 0
      const teamMatchups = matchups && matchups.length > 0 ? matchups.flat().filter(m => 
        m.roster_id === roster.roster_id || m.opponent_roster_id === roster.roster_id
      ) : [];

      const wins = this.calculateWins(roster.roster_id, teamMatchups);
      const losses = teamMatchups.length - wins;
      const actualPoints = this.calculateTotalPoints(roster.roster_id, teamMatchups);
      const opponentPoints = this.calculateOpponentPoints(roster.roster_id, teamMatchups);
      
      // Calculate advanced metrics
      const selfInflictedLosses = this.calculateSelfInflictedLosses(roster.roster_id, teamMatchups, players, projections);
      const potentialWins = this.calculatePotentialWins(roster.roster_id, teamMatchups, players);
      
      // Calculate power ranking components
      const totalPoints = actualPoints;
      const optimalAverage = this.calculateOptimalLineupAverage(roster, players, matchups);
      const recent3Week = this.calculateRecentForm(roster.roster_id, matchups, 3);
      
      const powerRankValue = FantasyAnalytics.calculatePowerRanking(
        totalPoints,
        optimalAverage,
        recent3Week
      );

      teams.push({
        id: roster.roster_id,
        owner: user.display_name,
        wins,
        losses,
        sleeperRank: 0, // Will be calculated after sorting
        powerRank: 0,   // Will be calculated after sorting
        powerRankValue: powerRankValue,
        actualPoints,
        opponentPoints,
        selfInflictedLosses,
        potentialWins
      });
    });

    // Sort by power rank value and assign ranks
    teams.sort((a, b) => b.powerRankValue - a.powerRankValue);
    teams.forEach((team, index) => {
      team.powerRank = index + 1;
    });

    // Sort by wins and assign Sleeper ranks
    teams.sort((a, b) => b.wins - a.wins || b.actualPoints - a.actualPoints);
    teams.forEach((team, index) => {
      team.sleeperRank = index + 1;
    });

    return teams;
  }

  /**
   * Process raw player data into PlayerValue objects with VORP, VORS, VOBP
   */
  static processPlayerValues(
    rosters: SleeperRoster[],
    users: SleeperUser[],
    players: Record<string, SleeperPlayer>,
    stats?: Record<string, any>
  ): PlayerValue[] {
    const playerValues: PlayerValue[] = [];
    
    // Safety check: if no rosters or users, return empty array
    if (!rosters || !users || rosters.length === 0 || users.length === 0) {
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
        if (!player) return;

        // Extract player name from first_name and last_name fields
        const playerName = player.first_name && player.last_name 
          ? `${player.first_name} ${player.last_name}`
          : player.first_name || player.last_name || `Player ${playerId}`;
        
        const position = player.position || 'UNK';
        
        // Since there are no points in the player data yet (season just started),
        // we'll set points to 0 for now
        const points = this.getPlayerPoints(playerId, stats) || 0;
        
        // Calculate VORS using baseline starter points
        const baselineStarterPoints = FantasyAnalytics.getBaselineStarterPoints(position);
        const vors = FantasyAnalytics.calculateVORS(points, baselineStarterPoints);
        
        // Calculate VORP using actual stats if available
        const vorp = this.calculateVORP(playerId, position, points, stats);
        
        // Calculate VOBP using team's best bench player
        const vobp = this.calculateVOBP(playerId, roster, players, stats);

        playerValues.push({
          id: playerId,
          name: playerName,
          owner: user.display_name,
          position,
          points,
          rank: 0, // Will be calculated after sorting
          vorp,
          vors,
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
        m.roster_id === roster.roster_id || m.opponent_roster_id === roster.roster_id
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
    let usedPositions = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, FLEX: 0 };

    sortedPlayers.forEach(player => {
      const pos = player.position;
      if (usedPositions[pos] < positionLimits[pos]) {
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
        m.roster_id === rosterId || m.opponent_roster_id === rosterId
      );
      
      if (teamMatchup) {
        if (teamMatchup.roster_id === rosterId) {
          totalPoints += teamMatchup.points;
        } else {
          totalPoints += teamMatchup.opponent_points;
        }
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
      if (matchup.roster_id === rosterId || matchup.opponent_roster_id === rosterId) {
        const isHomeTeam = matchup.roster_id === rosterId;
        const teamPoints = isHomeTeam ? matchup.points : matchup.opponent_points;
        const opponentPoints = isHomeTeam ? matchup.opponent_points : matchup.points;
        
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
      if (matchup.roster_id === rosterId || matchup.opponent_roster_id === rosterId) {
        const isHomeTeam = matchup.roster_id === rosterId;
        const teamPoints = isHomeTeam ? matchup.points : matchup.opponent_points;
        const opponentPoints = isHomeTeam ? matchup.opponent_points : matchup.points;
        
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
      return stats[playerId].pts_ppr || stats[playerId].pts_std || 0;
    }
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

  private static calculateWins(rosterId: string, matchups: SleeperMatchup[]): number {
    // Safety check: if no matchups, return 0
    if (!matchups || matchups.length === 0) {
      return 0;
    }

    return matchups.filter(m => {
      if (m.roster_id === rosterId) {
        return m.points > m.opponent_points;
      } else if (m.opponent_roster_id === rosterId) {
        return m.opponent_points > m.points;
      }
      return false;
    }).length;
  }

  private static calculateTotalPoints(rosterId: string, matchups: SleeperMatchup[]): number {
    // Safety check: if no matchups, return 0
    if (!matchups || matchups.length === 0) {
      return 0;
    }

    return matchups.reduce((total, m) => {
      if (m.roster_id === rosterId) {
        return total + m.points;
      } else if (m.opponent_roster_id === rosterId) {
        return total + m.opponent_points;
      }
      return total;
    }, 0);
  }

  private static calculateOpponentPoints(rosterId: string, matchups: SleeperMatchup[]): number {
    // Safety check: if no matchups, return 0
    if (!matchups || matchups.length === 0) {
      return 0;
    }

    return matchups.reduce((total, m) => {
      if (m.roster_id === rosterId) {
        return total + m.opponent_points;
      } else if (m.opponent_roster_id === rosterId) {
        return total + m.points;
      }
      return total;
    }, 0);
  }
}
