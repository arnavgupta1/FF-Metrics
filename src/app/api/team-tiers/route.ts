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
              round: 0, // Not a draft pick
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
          
          // Debug: Show individual player expert ranks for this position
          if (positionPicks.length > 0) {
            console.log(`  - Player expert ranks for ${teamName} ${position}:`, 
              positionPicks.map(p => `${p.playerName}: expertRank=${p.expertRank}`).join(', ')
            );
          }
          
          // Parse expert rank values for all players
          const playersWithExpertRanks = positionPicks
            .map(pick => {
              let expertRankValue = 0;
              
              // Use expert rank (ECR) instead of tier
              if (pick.expertRank && pick.expertRank > 0) {
                expertRankValue = pick.expertRank;
              }
              
              return {
                ...pick,
                expertRankValue
              };
            })
            .filter(player => player.expertRankValue > 0) // Only include players with valid expert rank data
            .sort((a, b) => a.expertRankValue - b.expertRankValue); // Sort by expert rank (lower is better)
          
          console.log(`${teamName} ${position} players with valid expert ranks:`, playersWithExpertRanks.length);
          
          let averageExpertRank = 0; // Default to 0 when no valid expert ranks
          
          if (playersWithExpertRanks.length > 0) {
            const requiredStarters = starterRequirements[position as keyof typeof starterRequirements];
            const actualStarters = Math.min(requiredStarters, playersWithExpertRanks.length);
            const benchPlayers = Math.max(0, playersWithExpertRanks.length - actualStarters);
            
            // Calculate weighted average with special handling for WR position
            let weightedSum = 0;
            let totalWeight = 0;
            
            if (actualStarters > 0) {
              const starterRanks = playersWithExpertRanks.slice(0, actualStarters).map(p => p.expertRankValue);
              
              if (position === 'WR' && actualStarters >= 2) {
                // Special weighting for WR: top 2 WRs get higher weight
                const top2WRs = starterRanks.slice(0, 2);
                const remainingWRs = starterRanks.slice(2);
                
                // Top 2 WRs get 60% weight, remaining WRs get 20% weight
                const top2Average = top2WRs.reduce((sum, rank) => sum + rank, 0) / top2WRs.length;
                weightedSum += top2Average * 0.6 * 2;
                totalWeight += 0.6 * 2;
                
                console.log(`${teamName} ${position} top 2 WRs: avg expert rank=${top2Average.toFixed(2)}`);
                
                if (remainingWRs.length > 0) {
                  const remainingAverage = remainingWRs.reduce((sum, rank) => sum + rank, 0) / remainingWRs.length;
                  weightedSum += remainingAverage * 0.2 * remainingWRs.length;
                  totalWeight += 0.2 * remainingWRs.length;
                  
                  console.log(`${teamName} ${position} remaining WRs (${remainingWRs.length}): avg expert rank=${remainingAverage.toFixed(2)}`);
                }
              } else {
                // Standard weighting: 70% weight for starters
                const starterAverage = starterRanks.reduce((sum, rank) => sum + rank, 0) / starterRanks.length;
                weightedSum += starterAverage * 0.7 * actualStarters;
                totalWeight += 0.7 * actualStarters;
                
                console.log(`${teamName} ${position} starters (${actualStarters}): avg expert rank=${starterAverage.toFixed(2)}`);
              }
            }
            
            if (benchPlayers > 0) {
              const benchRanks = playersWithExpertRanks.slice(actualStarters).map(p => p.expertRankValue);
              const benchAverage = benchRanks.reduce((sum, rank) => sum + rank, 0) / benchRanks.length;
              
              // Bench gets 20% weight for WR, 30% for other positions
              const benchWeight = position === 'WR' ? 0.2 : 0.3;
              weightedSum += benchAverage * benchWeight * benchPlayers;
              totalWeight += benchWeight * benchPlayers;
              
              console.log(`${teamName} ${position} bench (${benchPlayers}): avg expert rank=${benchAverage.toFixed(2)}`);
            }
            
            averageExpertRank = totalWeight > 0 ? weightedSum / totalWeight : 0;
            console.log(`${teamName} ${position} weighted average expert rank: ${averageExpertRank.toFixed(2)}`);
          } else {
            // No players with valid expert ranks - don't include in overall score
            console.log(`${teamName} ${position} has no players with valid expert ranks - excluding from overall score`);
          }

          // Find best player (lowest expert rank number)
          const bestPlayer = positionPicks
            .filter(pick => pick.expertRank && pick.expertRank > 0)
            .sort((a, b) => a.expertRank - b.expertRank)[0] || null;

          // Hard code Green Bay Packers DEF ranking to 13
          let finalAverageTier = averageExpertRank;
          if (position === 'DEF' && positionPicks.some(pick => pick.playerName === 'Green Bay Packers')) {
            finalAverageTier = 13;
            console.log(`${teamName} ${position}: Hard coding Green Bay Packers DEF ranking to 13`);
          }

          positionTiers[position] = {
            position,
            players: positionPicks,
            averageTier: finalAverageTier,
            bestPlayer,
            totalPlayers: positionPicks.length
          };
        } else {
          // No players at this position
          positionTiers[position] = {
            position,
            players: [],
            averageTier: 0, // Use 0 when no players (will be excluded from overall score)
            bestPlayer: null,
            totalPlayers: 0
          };
        }
      });

      // Calculate overall expert rank score (weighted average with higher weights for key positions)
      const weights = { QB: 1.5, RB: 2.0, WR: 2.0, TE: 1.5, K: 0.5, DEF: 0.8 };
      let weightedSum = 0;
      let totalWeight = 0;

      Object.entries(positionTiers).forEach(([position, data]) => {
        // Only include positions with valid expert rank data (averageTier > 0)
        if (data.totalPlayers > 0 && data.averageTier > 0) {
          weightedSum += data.averageTier * weights[position as keyof typeof weights];
          totalWeight += weights[position as keyof typeof weights];
          console.log(`${teamName} ${position}: expert rank=${data.averageTier.toFixed(2)}, weight=${weights[position as keyof typeof weights]}, contribution=${(data.averageTier * weights[position as keyof typeof weights]).toFixed(2)}`);
        } else {
          console.log(`${teamName} ${position}: excluded from overall score (no valid expert rank data)`);
        }
      });

      const overallExpertRankScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
      console.log(`${teamName} overall expert rank score: ${overallExpertRankScore.toFixed(2)} (total weight: ${totalWeight.toFixed(2)})`);

      teamTierData.push({
        teamName,
        rosterId: roster.roster_id.toString(),
        ownerId: roster.owner_id,
        positionTiers,
        overallTierScore: overallExpertRankScore
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
