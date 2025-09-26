import { Team, PlayerValue, LineupAnalysis } from '@/types';

export class FantasyAnalytics {
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
   * Get baseline starter points for position analysis
   * Updated for 10-team league
   */
  static getBaselineStarterPoints(position: string): number {
    const baselines: Record<string, number> = {
      'QB': 20.0,  // QB10 baseline
      'RB': 14.0,  // RB20 baseline
      'WR': 13.5,  // WR20 baseline
      'TE': 10.0,  // TE10 baseline
      'K': 9.0,    // K10 baseline
      'DEF': 8.0,  // DEF10 baseline
    };
    return baselines[position] || 0;
  }
}
