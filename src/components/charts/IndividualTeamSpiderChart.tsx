'use client';

import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { TeamTierData } from '@/types/draft';

interface IndividualTeamSpiderChartProps {
  team: TeamTierData;
}

export const IndividualTeamSpiderChart: React.FC<IndividualTeamSpiderChartProps> = ({ team }) => {
  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
  
  // Prepare data for the radar chart
  const chartData = positions.map(position => {
    const positionData = team.positionTiers[position];
    if (positionData && positionData.totalPlayers > 0 && positionData.averageTier > 0) {
      // Invert expert rank so lower ranks (better players) get longer stems
      // Expert rank 1 (best) should be at outer edge (30), expert rank 30 (worst) should be at inner edge (1)
      const expertRank = positionData.averageTier;
      
      // Adjust axis scaling for RB and WR to start at 10 instead of 0/1
      let adjustedRank = expertRank;
      if (position === 'RB' || position === 'WR') {
        adjustedRank = expertRank - 5;
      }
      
      const invertedValue = 31 - adjustedRank; // Invert: rank 1 becomes 30, rank 30 becomes 1
      
      return {
        position,
        tier: invertedValue,
        players: positionData.totalPlayers,
        bestPlayer: positionData.bestPlayer?.playerName || 'N/A'
      };
    } else {
      // No players at this position or no valid expert rank - use 0 to maintain line connections
      return {
        position,
        tier: 0,
        players: 0,
        bestPlayer: 'N/A'
      };
    }
  });

  const teamColor = '#3b82f6'; // Default blue, could be made dynamic

  // Custom tooltip component for individual team
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const position = label;
      const positionData = team.positionTiers[position];
      
      if (!positionData || positionData.totalPlayers === 0) {
        return (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
            <h4 className="text-white font-semibold mb-1">{position}</h4>
            <p className="text-gray-400 text-sm">No players at this position</p>
          </div>
        );
      }
      
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg max-w-xs">
          <h4 className="text-white font-semibold mb-2">{position} - {team.teamName}</h4>
          <div className="text-gray-400 text-sm mb-2">
            Average Expert Rank: {positionData.averageTier.toFixed(1)} | Players: {positionData.totalPlayers}
          </div>
          <div className="space-y-1">
            {positionData.players.map((player, index) => (
              <div key={index} className="text-gray-300 text-sm">
                • {player.playerName}
                {player.expertRank > 0 && (
                  <span className="text-gray-500 ml-1">(Rank: {player.expertRank})</span>
                )}
                {player.pickNumber > 0 && (
                  <span className="text-blue-400 ml-1">[Draft Pick #{player.pickNumber}]</span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white">{team.teamName}</h3>
        <p className="text-sm text-gray-300">Overall Expert Rank Score: {team.overallTierScore.toFixed(2)}</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <PolarGrid stroke="#4b5563" />
            <PolarAngleAxis 
              dataKey="position" 
              tick={{ fill: '#d1d5db', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[1, 30]} 
              tick={false}
              tickCount={6}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Tier"
              dataKey="tier"
              stroke={teamColor}
              fill={teamColor}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Position Details */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        {chartData.map((data) => {
          const positionData = team.positionTiers[data.position];
          return (
          <div key={data.position} className="bg-gray-700 rounded p-2">
            <div className="text-xs text-gray-300">{data.position}</div>
            <div className="text-sm text-white font-medium">
              Expert Rank: {data.tier === 0 ? 'N/A' : (31 - data.tier).toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">
              Players: {data.players}
            </div>
            {data.bestPlayer !== 'N/A' && (
              <div className="text-xs text-gray-400 truncate">
                Best: {data.bestPlayer}
              </div>
            )}
          </div>
          );
        })}
      </div>


    </div>
  );
};
