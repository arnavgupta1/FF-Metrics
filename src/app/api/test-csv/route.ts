import { NextResponse } from 'next/server';
import { testCSVParser } from '@/lib/csv-parser/testParser';

export async function GET() {
  try {
    const players = await testCSVParser();
    
    return NextResponse.json({
      success: true,
      totalPlayers: players.length,
      playersByPosition: {
        QB: players.filter(p => p.position === 'QB').length,
        RB: players.filter(p => p.position === 'RB').length,
        WR: players.filter(p => p.position === 'WR').length,
        TE: players.filter(p => p.position === 'TE').length,
        DEF: players.filter(p => p.position === 'DEF').length,
        K: players.filter(p => p.position === 'K').length,
      },
      samplePlayers: players.slice(0, 10)
    });
  } catch (error) {
    console.error('Error testing CSV parser:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test CSV parser',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
