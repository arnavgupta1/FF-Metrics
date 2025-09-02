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
    if (positionData && positionData.totalPlayers > 0) {
      // Convert tier to numeric value (lower tier number = better)
      // Reverse the scale: lower tiers (better players) = higher values (longer stems)
      const tierValue = Math.max(1, Math.min(10, Math.round(positionData.averageTier || 10)));
      const reversedValue = 11 - tierValue; // Reverse: tier 1 becomes 10, tier 10 becomes 1
      return {
        position,
        tier: reversedValue,
        players: positionData.totalPlayers,
        bestPlayer: positionData.bestPlayer?.playerName || 'N/A'
      };
    } else {
      // No players at this position - use min value (shortest stem)
      return {
        position,
        tier: 1,
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
            Average Tier: {positionData.averageTier.toFixed(1)} | Players: {positionData.totalPlayers}
          </div>
          <div className="space-y-1">
            {positionData.players.map((player, index) => (
              <div key={index} className="text-gray-300 text-sm">
                • {player.playerName}
                {player.tier !== 'N/A' && (
                  <span className="text-gray-500 ml-1">({player.tier})</span>
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
        <p className="text-sm text-gray-300">Overall Tier Score: {team.overallTierScore.toFixed(2)}</p>
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
              domain={[1, 10]} 
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickCount={5}
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
        {chartData.map((data) => (
          <div key={data.position} className="bg-gray-700 rounded p-2">
            <div className="text-xs text-gray-300">{data.position}</div>
            <div className="text-sm text-white font-medium">
              Tier: {data.tier === 1 ? 'N/A' : (11 - data.tier).toFixed(1)}
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
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-300 text-center">
        <p>
          <span className="text-yellow-400">Longer stems = Better players</span>
        </p>
      </div>
    </div>
  );
};
