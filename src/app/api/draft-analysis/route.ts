import { NextRequest, NextResponse } from 'next/server';
import { MockoSheetParser } from '@/lib/csv-parser/mockoSheetParser';
import { DraftAnalyticsCalculator } from '@/lib/draft-analytics/calculator';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { leagueId } = await request.json();

    if (!leagueId) {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 }
      );
    }

    // Read and parse the CSV file
    const csvPath = join(process.cwd(), 'ARNAV MockoSheet Draft Aid 2025 v3.0_ 10T_STD_4ptPTD_1QB_2RB_2WR_1TE_1FLEX_1K_1D - 10T_STD_4ptPTD_1QB_2RB_2WR_1TE_1FLEX_1K_1D.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');

    // Parse MockoSheet data
    const parser = new MockoSheetParser();
    const mockoSheetPlayers = await parser.parseCSV(csvContent);

    // Initialize calculator (we'll get Sleeper players in the calculator)
    const calculator = new DraftAnalyticsCalculator(mockoSheetPlayers, {});

    // Analyze the draft
    const analysis = await calculator.analyzeDraft(leagueId);

    return NextResponse.json({
      success: true,
      data: analysis,
      mockoSheetStats: {
        totalPlayers: mockoSheetPlayers.length,
        playersByPosition: {
          QB: mockoSheetPlayers.filter(p => p.position === 'QB').length,
          RB: mockoSheetPlayers.filter(p => p.position === 'RB').length,
          WR: mockoSheetPlayers.filter(p => p.position === 'WR').length,
          TE: mockoSheetPlayers.filter(p => p.position === 'TE').length,
          DEF: mockoSheetPlayers.filter(p => p.position === 'DEF').length,
          K: mockoSheetPlayers.filter(p => p.position === 'K').length,
        }
      }
    });

  } catch (error) {
    console.error('Error in draft analysis API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Draft Analysis API - Use POST with leagueId to analyze a draft'
  });
}
