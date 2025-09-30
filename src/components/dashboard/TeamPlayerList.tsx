'use client';

import React, { useMemo } from 'react';
import { PlayerValue } from '@/types';

interface TeamPlayerListProps {
  playerValues: PlayerValue[];
}

export const TeamPlayerList: React.FC<TeamPlayerListProps> = ({ playerValues }) => {
  // Group players by team owner
  const playersByTeam = useMemo(() => {
    const teams: Record<string, PlayerValue[]> = {};
    
    playerValues.forEach(player => {
      if (!teams[player.owner]) {
        teams[player.owner] = [];
      }
      teams[player.owner].push(player);
    });
    
    // Sort players within each team by points (descending)
    Object.keys(teams).forEach(teamName => {
      teams[teamName].sort((a, b) => b.points - a.points);
    });
    
    return teams;
  }, [playerValues]);

  const teamNames = Object.keys(playersByTeam).sort();

  const formatNumber = (num: number): string => {
    return num.toFixed(1);
  };

  const getValueColor = (value: number): string => {
    if (value === 0) return 'text-gray-400';
    return value > 0 ? 'text-green-400' : 'text-red-400';
  };

  const getPositionColor = (position: string): string => {
    const colors: Record<string, string> = {
      'QB': 'bg-purple-900/50 text-purple-200 border-purple-700',
      'RB': 'bg-green-900/50 text-green-200 border-green-700',
      'WR': 'bg-blue-900/50 text-blue-200 border-blue-700',
      'TE': 'bg-yellow-900/50 text-yellow-200 border-yellow-700',
      'K': 'bg-orange-900/50 text-orange-200 border-orange-700',
      'DEF': 'bg-red-900/50 text-red-200 border-red-700',
    };
    return colors[position] || 'bg-gray-900/50 text-gray-200 border-gray-700';
  };

  if (teamNames.length === 0) {
    return (
      <div className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700">
        <p className="text-gray-400 text-center">No player data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg border border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-700">
        <h3 className="text-lg font-medium text-white mb-3">Team Player Lists</h3>
        
        {/* Season Notice */}
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-800/50 rounded-lg">
          <p className="text-sm text-yellow-200">
            <strong>Note:</strong> Since the season just started, all player points are currently 0. 
            Points and value metrics will populate once games are played and stats become available.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-800/50">
            <h4 className="font-semibold text-blue-200 mb-2">VORP</h4>
            <p className="text-blue-300 text-xs leading-relaxed">
              <strong>Value Over Replacement Player</strong><br/>
              How much better this player is than a typical waiver wire pickup at their position.
            </p>
          </div>
          <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-800/50">
            <h4 className="font-semibold text-purple-200 mb-2">VOBP</h4>
            <p className="text-purple-300 text-xs leading-relaxed">
              <strong>Value Over Bench Player</strong><br/>
              How much better this player is than the next best option on their team's bench.
            </p>
          </div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {teamNames.map(teamName => (
            <div key={teamName} className="bg-gray-700 rounded-lg border border-gray-600">
              {/* Team Header */}
              <div className="px-4 py-3 border-b border-gray-600 bg-gray-600 rounded-t-lg">
                <h4 className="font-semibold text-white text-lg">{teamName}</h4>
                <p className="text-sm text-gray-300">
                  {playersByTeam[teamName].length} players
                </p>
              </div>
              
              {/* Scrollable Player List */}
              <div className="h-96 overflow-y-auto">
                <div className="p-4 space-y-3">
                  {playersByTeam[teamName].map(player => (
                    <div 
                      key={player.id} 
                      className="bg-gray-800 rounded-lg p-3 border border-gray-600 hover:border-gray-500 transition-colors"
                    >
                      {/* Player Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium text-white text-sm">{player.name}</h5>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPositionColor(player.position)}`}>
                            {player.position}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Rank #{player.rank}
                        </div>
                      </div>
                      
                      {/* Player Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-gray-400 mb-1">Points</div>
                          <div className="font-mono font-medium text-white">
                            {formatNumber(player.points)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-400 mb-1">VORP</div>
                          <div className={`font-mono font-medium ${getValueColor(player.vorp)}`}>
                            {formatNumber(player.vorp)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-400 mb-1">VOBP</div>
                          <div className={`font-mono font-medium ${getValueColor(player.vobp)}`}>
                            {formatNumber(player.vobp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with Summary Stats */}
      <div className="px-6 py-4 border-t border-gray-700 bg-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {teamNames.length}
            </div>
            <div className="text-sm text-gray-300">Teams</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {playerValues.length}
            </div>
            <div className="text-sm text-gray-300">Total Players</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {formatNumber(playerValues.reduce((sum, p) => sum + p.points, 0))}
            </div>
            <div className="text-sm text-gray-300">Total Points</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {formatNumber(playerValues.reduce((sum, p) => sum + p.points, 0) / playerValues.length)}
            </div>
            <div className="text-sm text-gray-300">Avg Points/Player</div>
          </div>
        </div>
      </div>
    </div>
  );
};