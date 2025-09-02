import { SleeperLeague, SleeperUser, SleeperPlayer } from '@/types/index';
import { SleeperDraftPick } from '@/types/draft';

export class SleeperDraftAPI {
  private baseUrl = 'https://api.sleeper.app/v1';

  async getLeague(leagueId: string): Promise<SleeperLeague> {
    const response = await fetch(`${this.baseUrl}/league/${leagueId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch league: ${response.statusText}`);
    }
    return response.json();
  }

  async getLeagueUsers(leagueId: string): Promise<SleeperUser[]> {
    const response = await fetch(`${this.baseUrl}/league/${leagueId}/users`);
    if (!response.ok) {
      throw new Error(`Failed to fetch league users: ${response.statusText}`);
    }
    return response.json();
  }

  async getLeagueDrafts(leagueId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/league/${leagueId}/drafts`);
    if (!response.ok) {
      throw new Error(`Failed to fetch league drafts: ${response.statusText}`);
    }
    return response.json();
  }

  async getDraftPicks(draftId: string): Promise<SleeperDraftPick[]> {
    const response = await fetch(`${this.baseUrl}/draft/${draftId}/picks`);
    if (!response.ok) {
      throw new Error(`Failed to fetch draft picks: ${response.statusText}`);
    }
    return response.json();
  }

  async getNFLPlayers(): Promise<Record<string, SleeperPlayer>> {
    const response = await fetch(`${this.baseUrl}/players/nfl`);
    if (!response.ok) {
      throw new Error(`Failed to fetch NFL players: ${response.statusText}`);
    }
    return response.json();
  }

  async getDraftData(leagueId: string): Promise<{
    league: SleeperLeague;
    users: SleeperUser[];
    draft: any;
    picks: SleeperDraftPick[];
    players: Record<string, SleeperPlayer>;
  }> {
    try {
      // Get league info
      const league = await this.getLeague(leagueId);
      
      // Get users
      const users = await this.getLeagueUsers(leagueId);
      
      // Get drafts (usually just one for the current season)
      const drafts = await this.getLeagueDrafts(leagueId);
      if (drafts.length === 0) {
        throw new Error('No drafts found for this league');
      }
      
      // Use the most recent draft
      const draft = drafts[drafts.length - 1];
      
      // Get draft picks
      const picks = await this.getDraftPicks(draft.draft_id);
      
      // Get NFL players database
      const players = await this.getNFLPlayers();
      
      return {
        league,
        users,
        draft,
        picks,
        players,
      };
    } catch (error) {
      console.error('Error fetching draft data:', error);
      throw error;
    }
  }

  // Helper method to get team name from roster_id
  getTeamName(rosterId: string, users: SleeperUser[]): string {
    const user = users.find(u => u.user_id === rosterId);
    return user?.display_name || `Team ${rosterId}`;
  }

  // Helper method to get player name from player_id
  getPlayerName(playerId: string, players: Record<string, SleeperPlayer>): string {
    const player = players[playerId];
    if (!player) return `Unknown Player (${playerId})`;
    return `${player.first_name} ${player.last_name}`;
  }

  // Helper method to get player position from player_id
  getPlayerPosition(playerId: string, players: Record<string, SleeperPlayer>): string {
    const player = players[playerId];
    if (!player) return 'UNKNOWN';
    return player.position || 'UNKNOWN';
  }
}
