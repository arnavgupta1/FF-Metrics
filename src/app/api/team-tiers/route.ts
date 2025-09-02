import { NextRequest, NextResponse } from 'next/server';
import { sleeperAPI } from '@/lib/sleeper/api';
import { PlayerMatcher } from '@/lib/player-matching/matcher';
import { DraftAnalysisData, TeamTierData, PositionTierData, DraftPickAnalysis } from '@/types/draft';

export async function POST(request: NextRequest) {
  try {
    const { leagueId, draftAnalysisData } = await request.json();

    if (!leagueId || !draftAnalysisData) {
      return NextResponse.json(
        { error: 'League ID and draft analysis data are required' },
        { status: 400 }
      );
    }

    console.log('Team tiers API called with leagueId:', leagueId);
    console.log('Draft analysis data available:', !!draftAnalysisData);
    console.log('MockoSheet data length:', draftAnalysisData.mockoSheetData?.length || 0);

    // Get rosters, users, and players from Sleeper
    console.log('Fetching data from Sleeper API...');
    const [rosters, users, players] = await Promise.all([
      sleeperAPI.getRosters(leagueId),
      sleeperAPI.getUsers(leagueId),
      sleeperAPI.getPlayers()
    ]);
    
    console.log('Sleeper data fetched:', {
      rosters: rosters?.length || 0,
      users: users?.length || 0,
      players: players ? Object.keys(players).length : 0
    });

    // Create a map of roster_id to team name
    const rosterToTeamMap = new Map<string, string>();
    rosters.forEach(roster => {
      const user = users.find(u => u.user_id === roster.owner_id);
      if (user) {
        rosterToTeamMap.set(roster.roster_id.toString(), user.display_name);
      }
    });

    console.log('MockoSheet data available:', draftAnalysisData.mockoSheetData?.length || 0);
    
    // Debug: Show sample MockoSheet tier data for each position
    if (draftAnalysisData.mockoSheetData && draftAnalysisData.mockoSheetData.length > 0) {
      const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
      positions.forEach(pos => {
        const topPlayers = draftAnalysisData.mockoSheetData
          .filter((p: any) => p.position === pos)
          .sort((a: any, b: any) => a.posRank - b.posRank)
          .slice(0, 3);
        console.log(`Top 3 ${pos} players in MockoSheet:`, 
          topPlayers.map((p: any) => `${p.player} (Rank: ${p.posRank}, Tier: ${p.posTier})`).join(', ')
        );
      });
    }
    
    // Use the existing PlayerMatcher for consistent player matching
    const playerMatcher = new PlayerMatcher(
      draftAnalysisData.mockoSheetData || [],
      players
    );

    // Group draft picks by team
    const teamPicks = new Map<string, DraftPickAnalysis[]>();
    draftAnalysisData.allPicks.forEach((pick: any) => {
      // Find the roster_id for this team
      const rosterId = Array.from(rosterToTeamMap.entries())
        .find(([_, teamName]) => teamName === pick.team)?.[0];
      
      if (rosterId) {
        if (!teamPicks.has(rosterId)) {
          teamPicks.set(rosterId, []);
        }
        teamPicks.get(rosterId)!.push(pick);
      }
    });

    console.log('Team picks mapping:');
    teamPicks.forEach((picks, rosterId) => {
      const teamName = rosterToTeamMap.get(rosterId);
      console.log(`${teamName} (${rosterId}): ${picks.length} picks`);
    });

    // Calculate team tier data
    const teamTierData: TeamTierData[] = [];
    
    console.log('Processing teams:', rosters.length);
    console.log('Draft picks available:', draftAnalysisData.allPicks.length);

    rosters.forEach((roster, index) => {
      const teamName = rosterToTeamMap.get(roster.roster_id.toString());
      if (!teamName) {
        console.log(`Skipping roster ${roster.roster_id} - no team name found`);
        return;
      }
      
      try {
        console.log(`Processing team ${index + 1}/${rosters.length}: ${teamName}`);

      const teamPicksList = teamPicks.get(roster.roster_id.toString()) || [];
      
      console.log(`Team ${teamName} has ${teamPicksList.length} draft picks`);
      
      // Get current roster players and match with MockoSheet data using existing PlayerMatcher
      const currentRosterPlayers: DraftPickAnalysis[] = [];
      if (roster.players && Array.isArray(roster.players)) {
        roster.players.forEach(playerId => {
          const player = players[playerId];
          if (player && player.first_name && player.last_name && player.position) {
            // Use the existing PlayerMatcher for consistent matching
            const mockoPlayer = playerMatcher.findMatch(playerId, player.position);
            
            currentRosterPlayers.push({
              pickNumber: 0, // Not a draft pick
              playerName: `${player.first_name} ${player.last_name}`,
              position: player.position,
              team: teamName,
              expertRank: mockoPlayer ? mockoPlayer.ecr : 0,
              adp: mockoPlayer ? mockoPlayer.adp : 0,
              actualPick: 0,
              reach: 0,
              valAdpScore: mockoPlayer ? mockoPlayer.valAdp : 'N/A',
              tier: mockoPlayer ? mockoPlayer.posTier : 'N/A',
              valScore: mockoPlayer ? mockoPlayer.val : 0,
              playoffShare: mockoPlayer ? mockoPlayer.ps : 'N/A',
              isValuePick: false,
              isReach: false,
            });
          }
        });
      }
      
      console.log(`Team ${teamName} has ${currentRosterPlayers.length} current roster players`);
      
      // Show matching statistics
      const matchedPlayers = currentRosterPlayers.filter(p => p.tier !== 'N/A');
      const unmatchedPlayers = currentRosterPlayers.filter(p => p.tier === 'N/A');
      console.log(`  - Matched with tier data: ${matchedPlayers.length}, No tier data: ${unmatchedPlayers.length}`);
      
      // Combine draft picks and current roster players, removing duplicates
      const allTeamPlayers = [...teamPicksList];
      
      // Add current roster players that aren't already in draft picks
      currentRosterPlayers.forEach(rosterPlayer => {
        const isDuplicate = teamPicksList.some(draftPlayer => 
          draftPlayer.playerName === rosterPlayer.playerName && 
          draftPlayer.position === rosterPlayer.position
        );
        if (!isDuplicate) {
          allTeamPlayers.push(rosterPlayer);
        }
      });
      
      // Group all players by position
      const positionGroups = new Map<string, DraftPickAnalysis[]>();
      allTeamPlayers.forEach(player => {
        if (!positionGroups.has(player.position)) {
          positionGroups.set(player.position, []);
        }
        positionGroups.get(player.position)!.push(player);
      });

      // Define starter requirements for each position
      const starterRequirements = {
        QB: 1,
        RB: 2,
        WR: 2,
        TE: 1,
        K: 1,
        DEF: 1
      };

      // Calculate position tier data with weighted averages
      const positionTiers: Record<string, PositionTierData> = {};
      const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
      
      positions.forEach(position => {
        const positionPicks = positionGroups.get(position) || [];
        
        if (positionPicks.length > 0) {
          const draftPicks = positionPicks.filter(p => p.pickNumber > 0);
          const rosterPlayers = positionPicks.filter(p => p.pickNumber === 0);
          console.log(`${teamName} ${position}: ${draftPicks.length} draft picks, ${rosterPlayers.length} roster players`);
          
          // Debug: Show individual player tiers for this position
          if (positionPicks.length > 0) {
            console.log(`  - Player tiers for ${teamName} ${position}:`, 
              positionPicks.map(p => `${p.playerName}: tier="${p.tier}"`).join(', ')
            );
          }
          
          // Parse tier values for all players
          const playersWithTiers = positionPicks
            .map(pick => {
              let tierValue = 0;
              
              // Handle different tier formats
              if (typeof pick.tier === 'number') {
                tierValue = pick.tier;
              } else if (typeof pick.tier === 'string') {
                // Handle N/A as 0 (worst tier)
                if (pick.tier === 'N/A') {
                  tierValue = 0;
                } else {
                  // Parse tier from format like "QB1", "TE2", "K3" etc.
                  const tierMatch = pick.tier.match(/\d+$/);
                  if (tierMatch) {
                    tierValue = parseInt(tierMatch[0], 10);
                  } else {
                    // Fallback: try to parse as regular number
                    const parsed = parseFloat(pick.tier);
                    tierValue = isNaN(parsed) ? 0 : parsed;
                  }
                }
              }
              
              return {
                ...pick,
                tierValue
              };
            })
            .filter(player => player.tierValue > 0) // Only include players with valid tier data
            .sort((a, b) => a.tierValue - b.tierValue); // Sort by tier (lower is better)
          
          console.log(`${teamName} ${position} players with valid tiers:`, playersWithTiers.length);
          
          let averageTier = 10; // Default to worst tier
          
          if (playersWithTiers.length > 0) {
            const requiredStarters = starterRequirements[position as keyof typeof starterRequirements];
            const actualStarters = Math.min(requiredStarters, playersWithTiers.length);
            const benchPlayers = Math.max(0, playersWithTiers.length - actualStarters);
            
            // Calculate weighted average: 70% weight for starters, 30% for bench
            let weightedSum = 0;
            let totalWeight = 0;
            
            if (actualStarters > 0) {
              const starterTiers = playersWithTiers.slice(0, actualStarters).map(p => p.tierValue);
              const starterAverage = starterTiers.reduce((sum, tier) => sum + tier, 0) / starterTiers.length;
              weightedSum += starterAverage * 0.7 * actualStarters;
              totalWeight += 0.7 * actualStarters;
              
              console.log(`${teamName} ${position} starters (${actualStarters}): avg tier=${starterAverage.toFixed(2)}`);
            }
            
            if (benchPlayers > 0) {
              const benchTiers = playersWithTiers.slice(actualStarters).map(p => p.tierValue);
              const benchAverage = benchTiers.reduce((sum, tier) => sum + tier, 0) / benchTiers.length;
              weightedSum += benchAverage * 0.3 * benchPlayers;
              totalWeight += 0.3 * benchPlayers;
              
              console.log(`${teamName} ${position} bench (${benchPlayers}): avg tier=${benchAverage.toFixed(2)}`);
            }
            
            averageTier = totalWeight > 0 ? weightedSum / totalWeight : 10;
            console.log(`${teamName} ${position} weighted average tier: ${averageTier.toFixed(2)}`);
          } else {
            // Fallback: assign tiers based on draft position (earlier picks = better tiers)
            const draftPositions = positionPicks.map(pick => pick.pickNumber).filter(pos => pos > 0);
            if (draftPositions.length > 0) {
              const avgDraftPosition = draftPositions.reduce((sum, pos) => sum + pos, 0) / draftPositions.length;
              // Convert draft position to tier (1-10 scale)
              // Earlier picks (lower numbers) = better tiers (lower numbers)
              averageTier = Math.min(10, Math.max(1, Math.round(avgDraftPosition / 20) + 1));
            }
            console.log(`${teamName} ${position} using fallback tier calculation: avg draft pos=${draftPositions.length > 0 ? draftPositions.reduce((sum, pos) => sum + pos, 0) / draftPositions.length : 'N/A'}, calculated tier=${averageTier}`);
          }

          // Find best player (lowest tier number)
          const bestPlayer = positionPicks
            .filter(pick => {
              if (typeof pick.tier === 'number') return pick.tier > 0;
              if (typeof pick.tier === 'string') {
                if (pick.tier === 'N/A') return false;
                const tierMatch = pick.tier.match(/\d+$/);
                if (tierMatch) return parseInt(tierMatch[0], 10) > 0;
                const parsed = parseFloat(pick.tier);
                return !isNaN(parsed) && parsed > 0;
              }
              return false;
            })
            .sort((a, b) => {
              const getTierValue = (pick: any) => {
                if (typeof pick.tier === 'number') return pick.tier;
                if (typeof pick.tier === 'string') {
                  if (pick.tier === 'N/A') return 999;
                  const tierMatch = pick.tier.match(/\d+$/);
                  if (tierMatch) return parseInt(tierMatch[0], 10);
                  const parsed = parseFloat(pick.tier);
                  return isNaN(parsed) ? 999 : parsed;
                }
                return 999;
              };
              return getTierValue(a) - getTierValue(b);
            })[0] || null;

          positionTiers[position] = {
            position,
            players: positionPicks,
            averageTier,
            bestPlayer,
            totalPlayers: positionPicks.length
          };
        } else {
          // No players at this position
          positionTiers[position] = {
            position,
            players: [],
            averageTier: 10, // Use 10 as worst tier when no players
            bestPlayer: null,
            totalPlayers: 0
          };
        }
      });

      // Calculate overall tier score (weighted average)
      const weights = { QB: 1.2, RB: 1.5, WR: 1.5, TE: 1.0, K: 0.3, DEF: 0.5 };
      let weightedSum = 0;
      let totalWeight = 0;

      Object.entries(positionTiers).forEach(([position, data]) => {
        if (data.totalPlayers > 0) {
          weightedSum += data.averageTier * weights[position as keyof typeof weights];
          totalWeight += weights[position as keyof typeof weights];
        }
      });

      const overallTierScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

      teamTierData.push({
        teamName,
        rosterId: roster.roster_id.toString(),
        ownerId: roster.owner_id,
        positionTiers,
        overallTierScore
      });
      
      } catch (error) {
        console.error(`Error processing team ${teamName || 'unknown'}:`, error);
        // Continue with other teams even if one fails
      }
    });

    return NextResponse.json({
      success: true,
      data: teamTierData
    });

  } catch (error) {
    console.error('Error processing team tiers:', error);
    return NextResponse.json(
      { error: 'Failed to process team tier data' },
      { status: 500 }
    );
  }
}
