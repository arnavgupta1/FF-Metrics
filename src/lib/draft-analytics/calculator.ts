import { 
  DraftPickAnalysis, 
  PositionAnalysis, 
  DraftAnalysisData,
  MockoSheetPlayer,
  SleeperDraftPick 
} from '@/types/draft';
import { PlayerMatcher } from '@/lib/player-matching/matcher';
import { SleeperDraftAPI } from '@/lib/sleeper/draftApi';

export class DraftAnalyticsCalculator {
  private playerMatcher: PlayerMatcher;
  private sleeperApi: SleeperDraftAPI;
  private mockoSheetPlayers: MockoSheetPlayer[];

  constructor(mockoSheetPlayers: MockoSheetPlayer[], sleeperPlayers: Record<string, any>) {
    this.mockoSheetPlayers = mockoSheetPlayers;
    this.playerMatcher = new PlayerMatcher(mockoSheetPlayers, sleeperPlayers);
    this.sleeperApi = new SleeperDraftAPI();
  }

  async analyzeDraft(leagueId: string): Promise<DraftAnalysisData> {
    try {
      // Get Sleeper data
      const sleeperData = await this.sleeperApi.getDraftData(leagueId);
      const { league, users, draft, picks, players } = sleeperData;

      // Re-initialize player matcher with actual Sleeper data
      this.playerMatcher = new PlayerMatcher(this.mockoSheetPlayers, players);

      // Analyze each pick
      const analyzedPicks = this.analyzePicks(picks, users, players);



      // Calculate position analysis
      const positionAnalysis = this.calculatePositionAnalysis(analyzedPicks);

      return {
        leagueId,
        draftId: draft.draft_id,
        leagueName: league.name,
        totalPicks: picks.length,
        positionAnalysis,
        allPicks: analyzedPicks,
        mockoSheetData: [], // Will be populated by the parser
      };
    } catch (error) {
      console.error('Error analyzing draft:', error);
      throw error;
    }
  }

  private analyzePicks(
    picks: SleeperDraftPick[], 
    users: any[], 
    players: Record<string, any>
  ): DraftPickAnalysis[] {
    return picks.map(pick => {
      const player = players[pick.player_id];
      const teamName = this.sleeperApi.getTeamName(pick.picked_by, users);
      const playerName = this.sleeperApi.getPlayerName(pick.player_id, players);
      const position = this.sleeperApi.getPlayerPosition(pick.player_id, players);

      // Find matching MockoSheet player
      const mockoPlayer = this.playerMatcher.findMatch(pick.player_id, position);

      if (mockoPlayer) {
        // For DEF and K positions, skip reach calculations since they don't have ADP
        const isDefenseOrKicker = position === 'DEF' || position === 'K';
        const reach = isDefenseOrKicker ? 0 : mockoPlayer.adp - pick.pick_no;
        const isValuePick = isDefenseOrKicker ? false : reach > 0;
        const isReach = isDefenseOrKicker ? false : reach < 0;

        return {
          pickNumber: pick.pick_no,
          playerName,
          position,
          team: teamName,
          expertRank: mockoPlayer.ecr,
          adp: isDefenseOrKicker ? 0 : mockoPlayer.adp,
          actualPick: pick.pick_no,
          reach,
          valAdpScore: isDefenseOrKicker ? 'N/A' : mockoPlayer.valAdp,
          tier: mockoPlayer.posTier,
          valScore: mockoPlayer.val,
          playoffShare: isDefenseOrKicker ? 'N/A' : mockoPlayer.ps,
          isValuePick,
          isReach,
        };
      } else {
        // Player not found in MockoSheet data
        return {
          pickNumber: pick.pick_no,
          playerName,
          position,
          team: teamName,
          expertRank: 0,
          adp: 0,
          actualPick: pick.pick_no,
          reach: 0,
          valAdpScore: 'N/A',
          tier: 'N/A',
          valScore: 0,
          playoffShare: 'N/A',
          isValuePick: false,
          isReach: false,
        };
      }
    });
  }



  private calculatePositionAnalysis(picks: DraftPickAnalysis[]): PositionAnalysis[] {
    const positionMap = new Map<string, DraftPickAnalysis[]>();

    // Group picks by position
    picks.forEach(pick => {
      if (!positionMap.has(pick.position)) {
        positionMap.set(pick.position, []);
      }
      positionMap.get(pick.position)!.push(pick);
    });

    // Calculate analysis for each position
    return Array.from(positionMap.entries()).map(([position, positionPicks]) => {
      const validPicks = positionPicks.filter(pick => pick.adp > 0 && pick.position !== 'DEF' && pick.position !== 'K');
      
      const totalReach = validPicks.reduce((sum, pick) => sum + pick.reach, 0);
      const averageReach = validPicks.length > 0 ? totalReach / validPicks.length : 0;
      
      const valuePicks = validPicks.filter(pick => pick.isValuePick).length;
      const reachPicks = validPicks.filter(pick => pick.isReach).length;
      
      const bestValue = validPicks
        .filter(pick => pick.isValuePick)
        .sort((a, b) => a.reach - b.reach)[0] || null;
      
      const worstReach = validPicks
        .filter(pick => pick.isReach)
        .sort((a, b) => b.reach - a.reach)[0] || null;

      return {
        position,
        totalPicks: validPicks.length,
        averageReach,
        valuePicks,
        reachPicks,
        bestValue,
        worstReach,
        picks: positionPicks,
      };
    });
  }











  // Get draft efficiency metrics
  getDraftEfficiencyMetrics(picks: DraftPickAnalysis[]): {
    totalValuePicks: number;
    totalReaches: number;
    averageReach: number;
    bestValuePick: DraftPickAnalysis | null;
    worstReach: DraftPickAnalysis | null;
    matchRate: number;
  } {
    const validPicks = picks.filter(pick => pick.adp > 0 && pick.position !== 'DEF' && pick.position !== 'K');
    const totalValuePicks = validPicks.filter(pick => pick.isValuePick).length;
    const totalReaches = validPicks.filter(pick => pick.isReach).length;
    const averageReach = validPicks.length > 0 
      ? validPicks.reduce((sum, pick) => sum + pick.reach, 0) / validPicks.length 
      : 0;

    const bestValuePick = validPicks
      .filter(pick => pick.isValuePick)
      .sort((a, b) => a.reach - b.reach)[0] || null;

    const worstReach = validPicks
      .filter(pick => pick.isReach)
      .sort((a, b) => b.reach - a.reach)[0] || null;

    const matchRate = picks.length > 0 ? (validPicks.length / picks.length) * 100 : 0;

    return {
      totalValuePicks,
      totalReaches,
      averageReach,
      bestValuePick,
      worstReach,
      matchRate,
    };
  }
}
