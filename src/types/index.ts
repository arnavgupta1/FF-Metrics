// Sleeper API Types
export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  status: string;
  total_rosters: number;
  settings: any;
}

export interface SleeperRoster {
  roster_id: string;
  owner_id: string;
  players: string[];
  taxi: string[];
  metadata: any;
  starters: string[];
  reserve: string[];
  settings: {
    wins: number;
    waiver_position: number;
    waiver_budget_used: number;
    total_moves: number;
    ties: number;
    losses: number;
    fpts_decimal: number;
    fpts_against_decimal: number;
    fpts_against: number;
    fpts: number;
  };
  league_id: string;
}

export interface SleeperUser {
  user_id: string;
  display_name: string;
  avatar: string;
}

export interface SleeperPlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  position: string;
  team: string;
  fantasy_positions: string[];
  status: string;
  age: number;
  years_exp: number;
  height: string;
  weight: string;
  college: string;
  hashtag: string;
  depth_chart_position: number;
  depth_chart_order: number;
  number: number;
  search_last_name: string;
  search_first_name: string;
  search_full_name: string;
  search_rank: number;
  fantasy_data_id: number;
  espn_id: string;
  yahoo_id: string | null;
  rotowire_id: string | null;
  rotoworld_id: number | null;
  sportradar_id: string;
  stats_id: string;
  birth_country: string;
  injury_status: string | null;
  injury_start_date: string | null;
  practice_participation: string | null;
  sport: string;
  points?: number; // Optional points field for calculated values
}

export interface SleeperMatchup {
  matchup_id: string | number;
  roster_id: string | number;
  points: number;
  players: string[];
  starters: string[];
  starters_points: number[];
  players_points: Record<string, number>;
  custom_points?: number | null;
}

// Dashboard Types
export interface WeeklyLineup {
  week: number;
  actualPoints: number;
  optimalPoints: number;
  opponentPoints: number;
  opponentName: string;
  pointsLeftOnBench: number;
  isLoss: boolean;
  isSelfInflicted: boolean;
  isUnavoidableLoss: boolean; // Loss where even optimal lineup wouldn't have won
}

export interface Team {
  id: string;
  owner: string;
  wins: number;
  losses: number;
  sleeperRank: number;
  actualPoints: number;
  opponentPoints: number;
  selfInflictedLosses: number;
  unavoidableLosses: number; // Losses where even optimal lineup wouldn't have won
  weeklyLineups: WeeklyLineup[];
}

export interface PlayerValue {
  id: string;
  name: string;
  owner: string;
  position: string;
  points: number;
  rank: number;
  vorp: number;
  vobp: number;
}

export interface LineupAnalysis {
  actualPoints: number;
  projectedPoints: number;
  optimalPoints: number;
  pointsLeftOnBench: number;
  week: number;
}
