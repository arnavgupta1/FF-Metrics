import Papa from 'papaparse';
import { MockoSheetPlayer, CSV_SECTIONS, COLUMN_MAPPINGS } from '@/types/draft';

export class MockoSheetParser {
  private csvData: string[][] = [];
  private players: MockoSheetPlayer[] = [];

  async parseCSV(csvContent: string): Promise<MockoSheetPlayer[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        complete: (results) => {
          try {
            this.csvData = results.data as string[][];
            this.players = this.extractPlayers();
            resolve(this.players);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: any) => {
          reject(error);
        },
        skipEmptyLines: true,
      });
    });
  }

  private extractPlayers(): MockoSheetPlayer[] {
    const players: MockoSheetPlayer[] = [];
    
    // Find the header row (row 6, index 6)
    const headerRow = this.csvData[6];
    if (!headerRow) {
      throw new Error('Could not find header row in CSV');
    }

    // Extract QB, RB, WR sections (rows 7-73, indices 7-73)
    // Data continues much further than originally thought
    for (let rowIndex = 7; rowIndex < 74; rowIndex++) {
      const row = this.csvData[rowIndex];
      if (!row || row.length === 0) continue;

      // Extract QB data (columns 0-15)
      const qbPlayer = this.extractPlayerFromRow(row, 0, 'QB', rowIndex);
      if (qbPlayer) players.push(qbPlayer);

      // Extract RB data (columns 16-31)
      const rbPlayer = this.extractPlayerFromRow(row, 16, 'RB', rowIndex);
      if (rbPlayer) players.push(rbPlayer);

      // Extract WR data (columns 32-47)
      const wrPlayer = this.extractPlayerFromRow(row, 32, 'WR', rowIndex);
      if (wrPlayer) players.push(wrPlayer);
    }

    // Extract TE section (starts around row 41, continues until row 73)
    for (let rowIndex = 41; rowIndex < 74; rowIndex++) {
      const row = this.csvData[rowIndex];
      if (!row || row.length === 0) continue;

      const tePlayer = this.extractPlayerFromRow(row, 0, 'TE', rowIndex);
      if (tePlayer) players.push(tePlayer);
    }

    // Extract DEF and K sections (starts around row 74, continues to end)
    for (let rowIndex = 74; rowIndex < this.csvData.length; rowIndex++) {
      const row = this.csvData[rowIndex];
      if (!row || row.length === 0) continue;

      // DEF section
      const defPlayer = this.extractPlayerFromRow(row, 0, 'DEF', rowIndex);
      if (defPlayer) players.push(defPlayer);

      // K section
      const kPlayer = this.extractPlayerFromRow(row, 7, 'K', rowIndex);
      if (kPlayer) players.push(kPlayer);
    }

    return players.filter(player => player.player && player.player.trim() !== '');
  }

  private extractPlayerFromRow(
    row: string[], 
    startColumn: number, 
    position: string, 
    rowIndex: number
  ): MockoSheetPlayer | null {
    try {
      const playerName = row[startColumn + COLUMN_MAPPINGS.player]?.trim();
      if (!playerName || playerName === '' || playerName === 'Player') {
        return null;
      }

      // Special handling for DEF and K positions (different column structure)
      if (position === 'DEF' || position === 'K') {
        return this.extractDefenseOrKickerFromRow(row, startColumn, position, rowIndex);
      }

      const teamBye = row[startColumn + COLUMN_MAPPINGS.teamBye]?.trim() || '';
      const posRankStr = row[startColumn + COLUMN_MAPPINGS.posRank]?.trim();
      const ecrStr = row[startColumn + COLUMN_MAPPINGS.ecr]?.trim();
      const posTier = row[startColumn + COLUMN_MAPPINGS.posTier]?.trim() || '';
      const adpStr = row[startColumn + COLUMN_MAPPINGS.adp]?.trim();
      const valAdp = row[startColumn + COLUMN_MAPPINGS.valAdp]?.trim() || '';
      const valFStr = row[startColumn + COLUMN_MAPPINGS.valF]?.trim();
      const valStr = row[startColumn + COLUMN_MAPPINGS.val]?.trim();
      const valCStr = row[startColumn + COLUMN_MAPPINGS.valC]?.trim();
      const ps = row[startColumn + COLUMN_MAPPINGS.ps]?.trim() || '';
      const dynStr = row[startColumn + COLUMN_MAPPINGS.dyn]?.trim();
      const drafted = row[startColumn + COLUMN_MAPPINGS.drafted]?.trim() || '';

      // Parse numeric values
      const posRank = this.parseNumber(posRankStr);
      const ecr = this.parseNumber(ecrStr);
      const adp = this.parseADP(adpStr);
      const valF = this.parseNumber(valFStr);
      const val = this.parseNumber(valStr);
      const valC = this.parseNumber(valCStr);
      const dyn = this.parseNumber(dynStr);

      return {
        player: playerName,
        teamBye,
        posRank,
        ecr,
        posTier,
        adp,
        valAdp,
        valF,
        val,
        valC,
        ps,
        dyn,
        drafted,
        position,
      };
    } catch (error) {
      console.warn(`Error parsing player in row ${rowIndex}, position ${position}:`, error);
      return null;
    }
  }

  private extractDefenseOrKickerFromRow(
    row: string[], 
    startColumn: number, 
    position: string, 
    rowIndex: number
  ): MockoSheetPlayer | null {
    try {
      const playerName = row[startColumn + 3]?.trim(); // Player name is at column +3
      if (!playerName || playerName === '' || playerName === 'Player') {
        return null;
      }

      const teamBye = row[startColumn + 4]?.trim() || '';
      const posRankStr = row[startColumn + 5]?.trim();
      const ecrStr = row[startColumn + 6]?.trim();
      const projectedPointsStr = row[startColumn + 7]?.trim();
      const posTier = row[startColumn + 8]?.trim() || '';

      // Parse numeric values
      const posRank = this.parseNumber(posRankStr);
      const ecr = this.parseNumber(ecrStr);
      const projectedPoints = this.parseNumber(projectedPointsStr);

      return {
        player: playerName,
        teamBye,
        posRank,
        ecr,
        posTier,
        adp: 0, // No ADP data for DEF/K
        valAdp: 'N/A', // No VAL-ADP data for DEF/K
        valF: 0, // No VAL F data for DEF/K
        val: projectedPoints, // Use projected points as the main value metric
        valC: 0, // No VAL C data for DEF/K
        ps: 'N/A', // No playoff share data for DEF/K
        dyn: 0, // No dynasty data for DEF/K
        drafted: '', // No drafted status for DEF/K
        position,
      };
    } catch (error) {
      console.warn(`Error parsing ${position} player in row ${rowIndex}:`, error);
      return null;
    }
  }

  private parseNumber(str: string | undefined): number {
    if (!str || str.trim() === '') return 0;
    const cleaned = str.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  private parseADP(str: string | undefined): number {
    if (!str || str.trim() === '') return 0;
    
    // Handle formats like "3.03", "1.04", etc.
    if (str.includes('.')) {
      const parts = str.split('.');
      if (parts.length === 2) {
        const round = parseInt(parts[0]) || 0;
        const pick = parseInt(parts[1]) || 0;
        // For 10-team league: Round 1 = picks 1-10, Round 2 = picks 11-20, etc.
        return (round - 1) * 10 + pick;
      }
    }
    
    return this.parseNumber(str);
  }

  getPlayers(): MockoSheetPlayer[] {
    return this.players;
  }

  getPlayerByName(name: string, position?: string): MockoSheetPlayer | null {
    const normalizedName = this.normalizePlayerName(name);
    
    return this.players.find(player => {
      const playerNormalizedName = this.normalizePlayerName(player.player);
      const nameMatch = playerNormalizedName === normalizedName;
      const positionMatch = !position || player.position === position;
      return nameMatch && positionMatch;
    }) || null;
  }

  private normalizePlayerName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  getPlayersByPosition(position: string): MockoSheetPlayer[] {
    return this.players.filter(player => player.position === position);
  }

  getAllPlayers(): MockoSheetPlayer[] {
    return this.players;
  }
}
