import { MockoSheetPlayer } from '@/types/draft';
import { SleeperPlayer } from '@/types/index';

export class PlayerMatcher {
  private mockoSheetPlayers: MockoSheetPlayer[] = [];
  private sleeperPlayers: Record<string, SleeperPlayer> = {};

  constructor(mockoSheetPlayers: MockoSheetPlayer[], sleeperPlayers: Record<string, SleeperPlayer>) {
    this.mockoSheetPlayers = mockoSheetPlayers;
    this.sleeperPlayers = sleeperPlayers;
  }

  findMatch(playerId: string, position: string): MockoSheetPlayer | null {
    const sleeperPlayer = this.sleeperPlayers[playerId];
    if (!sleeperPlayer) return null;

    const sleeperName = `${sleeperPlayer.first_name} ${sleeperPlayer.last_name}`;
    const normalizedSleeperName = this.normalizeName(sleeperName);

    // Try exact match first
    let match = this.mockoSheetPlayers.find(player => {
      const normalizedMockoName = this.normalizeName(player.player);
      return normalizedMockoName === normalizedSleeperName && player.position === position;
    });

    if (match) return match;

    // Try fuzzy matching
    match = this.mockoSheetPlayers.find(player => {
      const normalizedMockoName = this.normalizeName(player.player);
      const similarity = this.calculateSimilarity(normalizedSleeperName, normalizedMockoName);
      return similarity > 0.8 && player.position === position;
    });

    if (match) return match;

    // Try matching by last name and position (for common names)
    const sleeperLastName = this.normalizeName(sleeperPlayer.last_name);
    match = this.mockoSheetPlayers.find(player => {
      const mockoLastName = this.extractLastName(player.player);
      const normalizedMockoLastName = this.normalizeName(mockoLastName);
      return normalizedMockoLastName === sleeperLastName && player.position === position;
    });

    return match || null;
  }

  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  private extractLastName(fullName: string): string {
    const parts = fullName.split(' ');
    return parts[parts.length - 1] || fullName;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Get all unmatched players for manual review
  getUnmatchedPlayers(draftPicks: any[]): Array<{
    playerId: string;
    playerName: string;
    position: string;
    team: string;
  }> {
    const unmatched: Array<{
      playerId: string;
      playerName: string;
      position: string;
      team: string;
    }> = [];

    draftPicks.forEach(pick => {
      const match = this.findMatch(pick.player_id, pick.metadata?.position);
      if (!match) {
        const sleeperPlayer = this.sleeperPlayers[pick.player_id];
        if (sleeperPlayer) {
          unmatched.push({
            playerId: pick.player_id,
            playerName: `${sleeperPlayer.first_name} ${sleeperPlayer.last_name}`,
            position: pick.metadata?.position || 'UNKNOWN',
            team: pick.metadata?.team || 'UNKNOWN',
          });
        }
      }
    });

    return unmatched;
  }

  // Get match statistics
  getMatchStats(draftPicks: any[]): {
    totalPicks: number;
    matchedPicks: number;
    unmatchedPicks: number;
    matchRate: number;
  } {
    let matchedCount = 0;
    
    draftPicks.forEach(pick => {
      const match = this.findMatch(pick.player_id, pick.metadata?.position);
      if (match) matchedCount++;
    });

    return {
      totalPicks: draftPicks.length,
      matchedPicks: matchedCount,
      unmatchedPicks: draftPicks.length - matchedCount,
      matchRate: draftPicks.length > 0 ? (matchedCount / draftPicks.length) * 100 : 0,
    };
  }
}
