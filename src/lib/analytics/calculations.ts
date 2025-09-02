import { Team, PlayerValue, PowerRanking, LineupAnalysis } from '@/types';

export class FantasyAnalytics {
  /**
   * Calculate Power Ranking using composite scoring algorithm
   * Formula: PowerRank = (TotalPoints * 0.4) + (OptimalAverage * 0.35) + (Recent3Week * 0.25)
   */
  static calculatePowerRanking(
    totalPoints: number,
    optimalAverage: number,
    recent3Week: number
  ): number {
    return (totalPoints * 0.4) + (optimalAverage * 0.35) + (recent3Week * 0.25);
  }

  /**
   * Calculate Value Over Replacement Player (VORP)
   * VORP = Player's points per game - Replacement player points per game
   */
  static calculateVORP(
    playerPoints: number,
    replacementPoints: number
  ): number {
    return playerPoints - replacementPoints;
  }

  /**
   * Calculate Value Over Replacement Starter (VORS)
   * VORS = Player's points per game - Baseline starter points per game
   */
  static calculateVORS(
    playerPoints: number,
    baselineStarterPoints: number
  ): number {
    return playerPoints - baselineStarterPoints;
  }

  /**
   * Calculate Value Over Bench Player (VOBP)
   * VOBP = Player's points per game - Best bench alternative points per game
   */
  static calculateVOBP(
    playerPoints: number,
    bestBenchPoints: number
  ): number {
    return playerPoints - bestBenchPoints;
  }

  /**
   * Calculate Self Inflicted Losses
   * Games where projected optimal lineup would have beaten opponent, but actual lineup lost
   */
  static calculateSelfInflictedLosses(
    projectedPoints: number,
    actualPoints: number,
    opponentPoints: number
  ): boolean {
    return projectedPoints > opponentPoints && actualPoints < opponentPoints;
  }

  /**
   * Calculate Potential Wins
   * Games where truly optimal lineup (perfect hindsight) would have won, but actual lineup lost
   */
  static calculatePotentialWins(
    optimalPoints: number,
    actualPoints: number,
    opponentPoints: number
  ): boolean {
    return optimalPoints > opponentPoints && actualPoints < opponentPoints;
  }

  /**
   * Calculate Points Left on Bench
   * Difference between optimal lineup points and actual lineup points
   */
  static calculatePointsLeftOnBench(
    optimalPoints: number,
    actualPoints: number
  ): number {
    return optimalPoints - actualPoints;
  }

  /**
   * Calculate Luck Rating based on schedule strength and variance
   */
  static calculateLuckRating(
    actualRecord: number,
    expectedRecord: number,
    pointsFor: number,
    pointsAgainst: number
  ): number {
    const recordLuck = actualRecord - expectedRecord;
    const pointsLuck = (pointsFor - pointsAgainst) / 100; // Normalize to reasonable scale
    return (recordLuck + pointsLuck) / 2;
  }

  /**
   * Get baseline starter points for VORS calculations
   * Updated for 10-team league (was 12-team)
   */
  static getBaselineStarterPoints(position: string): number {
    const baselines: Record<string, number> = {
      'QB': 20.0,  // QB10 baseline (was QB12)
      'RB': 14.0,  // RB20 baseline (was RB30)
      'WR': 13.5,  // WR20 baseline (was WR30)
      'TE': 10.0,  // TE10 baseline (was TE12)
      'K': 9.0,    // K10 baseline (was K12)
      'DEF': 8.0,  // DEF10 baseline
    };
    return baselines[position] || 0;
  }
}
