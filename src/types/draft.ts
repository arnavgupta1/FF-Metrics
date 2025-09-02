// Draft Analysis Types

export interface MockoSheetPlayer {
  player: string;
  teamBye: string;
  posRank: number;
  ecr: number;
  posTier: string;
  adp: number;
  valAdp: string;
  valF: number;
  val: number;
  valC: number;
  ps: string;
  dyn: number;
  drafted: string;
  position: string;
}

export interface SleeperDraftPick {
  pick_no: number;
  player_id: string;
  picked_by: string;
  roster_id: string;
  round: number;
  draft_slot: number;
  draft_id: string;
  metadata: {
    team: string;
    status: string;
    sport: string;
    position: string;
    player_id: string;
    number: string;
    news_updated: string;
    last_name: string;
    injury_status: string;
    first_name: string;
  };
}

export interface DraftPickAnalysis {
  pickNumber: number;
  playerName: string;
  position: string;
  team: string;
  expertRank: number;
  adp: number;
  actualPick: number;
  reach: number;
  valAdpScore: string;
  tier: string;
  valScore: number;
  playoffShare: string;
  isValuePick: boolean;
  isReach: boolean;
}



export interface PositionAnalysis {
  position: string;
  totalPicks: number;
  averageReach: number;
  valuePicks: number;
  reachPicks: number;
  bestValue: DraftPickAnalysis | null;
  worstReach: DraftPickAnalysis | null;
  picks: DraftPickAnalysis[];
}

export interface DraftAnalysisData {
  leagueId: string;
  draftId: string;
  leagueName: string;
  totalPicks: number;
  positionAnalysis: PositionAnalysis[];
  allPicks: DraftPickAnalysis[];
  mockoSheetData: MockoSheetPlayer[];
}

// Team Tiers Types
export interface PositionTierData {
  position: string;
  players: DraftPickAnalysis[];
  averageTier: number;
  bestPlayer: DraftPickAnalysis | null;
  totalPlayers: number;
}

export interface TeamTierData {
  teamName: string;
  rosterId: string;
  ownerId: string;
  positionTiers: Record<string, PositionTierData>;
  overallTierScore: number;
}

// CSV Section Configuration
export interface CSVSection {
  name: string;
  startColumn: number;
  endColumn: number;
  position: string;
}

export const CSV_SECTIONS: CSVSection[] = [
  { name: 'QUARTERBACKS', startColumn: 0, endColumn: 15, position: 'QB' },
  { name: 'RUNNINGBACKS', startColumn: 16, endColumn: 31, position: 'RB' },
  { name: 'Wide Receivers', startColumn: 32, endColumn: 47, position: 'WR' },
  { name: 'TIGHT ENDS', startColumn: 0, endColumn: 15, position: 'TE' }, // TE section starts around row 41
  { name: 'DEFENSES', startColumn: 0, endColumn: 15, position: 'DEF' },
  { name: 'KICKERS', startColumn: 16, endColumn: 31, position: 'K' },
];

// Column mappings for each section
export const COLUMN_MAPPINGS = {
  player: 3,
  teamBye: 4,
  posRank: 5,
  ecr: 6,
  posTier: 7,
  adp: 8,
  valAdp: 9,
  valF: 10,
  val: 11,
  valC: 12,
  ps: 13,
  dyn: 14,
  drafted: 15,
};
