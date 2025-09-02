import { SleeperLeague, SleeperRoster, SleeperUser, SleeperPlayer, SleeperMatchup } from '@/types';

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

class SleeperAPI {
  private async fetch<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${SLEEPER_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit exceeded - implement retry with backoff
          await this.delay(1000);
          return this.fetch(endpoint);
        }
        
        // Provide more specific error messages
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        switch (response.status) {
          case 404:
            errorMessage = `Resource not found: ${endpoint}`;
            break;
          case 403:
            errorMessage = `Access forbidden: ${endpoint}`;
            break;
          case 500:
            errorMessage = `Sleeper API server error`;
            break;
          case 502:
          case 503:
          case 504:
            errorMessage = `Sleeper API temporarily unavailable`;
            break;
        }
        
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getLeague(leagueId: string): Promise<SleeperLeague> {
    return this.fetch<SleeperLeague>(`/league/${leagueId}`);
  }

  async getRosters(leagueId: string): Promise<SleeperRoster[]> {
    return this.fetch<SleeperRoster[]>(`/league/${leagueId}/rosters`);
  }

  async getUsers(leagueId: string): Promise<SleeperUser[]> {
    return this.fetch<SleeperUser[]>(`/league/${leagueId}/users`);
  }

  async getMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> {
    return this.fetch<SleeperMatchup[]>(`/league/${leagueId}/matchups/${week}`);
  }

  async getAllMatchups(leagueId: string, maxWeeks: number = 18): Promise<SleeperMatchup[][]> {
    const matchupsPromises = Array.from({ length: maxWeeks }, (_, i) => 
      this.getMatchups(leagueId, i + 1)
    );
    return Promise.all(matchupsPromises);
  }

  async getPlayerStats(season: string, week?: number): Promise<Record<string, any>> {
    const endpoint = week 
      ? `/stats/nfl/${season}/${week}?season_type=regular`
      : `/stats/nfl/${season}?season_type=regular`;
    return this.fetch<Record<string, any>>(endpoint);
  }

  async getPlayerProjections(season: string, week: number): Promise<Record<string, any>> {
    return this.fetch<Record<string, any>>(`/projections/nfl/${season}/${week}?season_type=regular`);
  }

  async getPlayers(): Promise<Record<string, SleeperPlayer>> {
    return this.fetch<Record<string, SleeperPlayer>>('/players/nfl');
  }

  async getNFLState(): Promise<{ week: number; season: string; season_type: string }> {
    return this.fetch<{ week: number; season: string; season_type: string }>('/state/nfl');
  }

  async getTransactions(leagueId: string, week: number): Promise<any[]> {
    return this.fetch<any[]>(`/league/${leagueId}/transactions/${week}`);
  }

  async getDrafts(leagueId: string): Promise<any[]> {
    return this.fetch<any[]>(`/league/${leagueId}/drafts`);
  }

  async getDraftPicks(draftId: string): Promise<any[]> {
    return this.fetch<any[]>(`/draft/${draftId}/picks`);
  }
}

export const sleeperAPI = new SleeperAPI();
