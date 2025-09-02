'use client';

import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TeamTierData } from '@/types/draft';

interface TeamTiersSpiderChartProps {
  teams: TeamTierData[];
  selectedTeams: string[];
  onTeamToggle: (teamName: string) => void;
  onToggleAllTeams: () => void;
}

export const TeamTiersSpiderChart: React.FC<TeamTiersSpiderChartProps> = ({ 
  teams, 
  selectedTeams, 
  onTeamToggle,
  onToggleAllTeams
}) => {
  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
  
  // Generate colors for teams
  const teamColors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#ec4899', // pink
    '#6b7280', // gray
    '#14b8a6', // teal
    '#a855f7', // violet
  ];

  // Prepare data for the radar chart
  const chartData = positions.map(position => {
    const dataPoint: any = { position };
    
    teams.forEach((team, index) => {
      if (selectedTeams.includes(team.teamName)) {
        const positionData = team.positionTiers[position];
        if (positionData && positionData.totalPlayers > 0) {
          // Convert tier to numeric value (lower tier number = better)
          // Reverse the scale: lower tiers (better players) = higher values (longer stems)
          const tierValue = Math.max(1, Math.min(10, Math.round(positionData.averageTier || 10)));
          const reversedValue = 11 - tierValue; // Reverse: tier 1 becomes 10, tier 10 becomes 1
          dataPoint[team.teamName] = reversedValue;
          console.log(`Chart data: ${team.teamName} ${position} = ${reversedValue} (from avgTier: ${positionData.averageTier}, reversed)`);
        } else {
          // No players at this position - use min value (shortest stem)
          dataPoint[team.teamName] = 1;
        }
      }
    });
    
    return dataPoint;
  });

  const visibleTeams = teams.filter(team => selectedTeams.includes(team.teamName));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const position = label;
      
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg max-w-sm">
          <h4 className="text-white font-semibold mb-2">{position} Position Groups</h4>
          {visibleTeams.map((team, index) => {
            const positionData = team.positionTiers[position];
            if (!positionData || positionData.totalPlayers === 0) return null;
            
            return (
              <div key={team.teamName} className="mb-3 last:mb-0">
                <div className="flex items-center mb-1">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: teamColors[index % teamColors.length] }}
                  ></div>
                  <span className="text-white font-medium">{team.teamName}</span>
                  <span className="text-gray-400 ml-2">
                    (Tier: {positionData.averageTier.toFixed(1)})
                  </span>
                </div>
                <div className="ml-5 text-sm">
                  {positionData.players.slice(0, 3).map((player, playerIndex) => (
                    <div key={playerIndex} className="text-gray-300">
                      • {player.playerName}
                      {player.tier !== 'N/A' && (
                        <span className="text-gray-500 ml-1">({player.tier})</span>
                      )}
                    </div>
                  ))}
                  {positionData.players.length > 3 && (
                    <div className="text-gray-500 text-xs">
                      +{positionData.players.length - 3} more players
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-white">Team Position Tiers</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleAllTeams}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedTeams.length === teams.length
                ? 'bg-green-600 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            {selectedTeams.length === teams.length ? 'Deselect All' : 'Select All'}
          </button>
          <div className="flex flex-wrap gap-2">
            {teams.map((team, index) => (
              <button
                key={team.teamName}
                onClick={() => onTeamToggle(team.teamName)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedTeams.includes(team.teamName)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                style={{
                  backgroundColor: selectedTeams.includes(team.teamName) 
                    ? teamColors[index % teamColors.length] 
                    : undefined
                }}
              >
                {team.teamName}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 20, right: 80, bottom: 20, left: 20 }}>
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
            {visibleTeams.map((team, index) => (
              <Radar
                key={team.teamName}
                name={team.teamName}
                dataKey={team.teamName}
                stroke={teamColors[index % teamColors.length]}
                fill={teamColors[index % teamColors.length]}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            ))}
            <Legend 
              wrapperStyle={{ color: '#d1d5db' }}
              iconType="circle"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-300">
        <p className="text-center">
          <span className="text-yellow-400">Longer stems = Better players</span>
        </p>
        <p className="text-center mt-1">
          Click team names above to toggle visibility
        </p>
      </div>
    </div>
  );
};
