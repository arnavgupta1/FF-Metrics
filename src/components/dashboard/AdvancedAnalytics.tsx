'use client';

import React from 'react';
import { Team } from '@/types';

interface AdvancedAnalyticsProps {
  teams: Team[];
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ teams }) => {
  const formatNumber = (num: number): string => {
    return num.toFixed(1);
  };

  const getValueColor = (value: number, isPositive: boolean = true): string => {
    if (value === 0) return 'text-gray-400';
    return isPositive ? 'text-positive' : 'text-negative';
  };

  return (
    <div className="space-y-6">

      {/* Advanced Metrics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Self-Inflicted Losses */}
        <div className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4">Self-Inflicted Losses</h3>
          <div className="space-y-3">
            {teams
              .filter(team => team.selfInflictedLosses > 0)
              .sort((a, b) => b.selfInflictedLosses - a.selfInflictedLosses)
              .map(team => (
                <div key={team.id} className="flex justify-between items-center p-3 bg-red-900/30 rounded-lg border border-red-800/50">
                  <span className="text-sm font-medium text-white">{team.owner}</span>
                  <span className="text-sm font-mono font-bold text-red-300">
                    {team.selfInflictedLosses} loss{team.selfInflictedLosses !== 1 ? 'es' : ''}
                  </span>
                </div>
              ))}
            {teams.filter(team => team.selfInflictedLosses === 0).length > 0 && (
              <div className="text-sm text-gray-400 text-center py-2">
                {teams.filter(team => team.selfInflictedLosses === 0).length} teams with no self-inflicted losses
              </div>
            )}
          </div>
        </div>

        {/* Potential Wins */}
        <div className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4">Potential Wins</h3>
          <div className="space-y-3">
            {teams
              .filter(team => team.potentialWins > 0)
              .sort((a, b) => b.potentialWins - a.potentialWins)
              .map(team => (
                <div key={team.id} className="flex justify-between items-center p-3 bg-green-900/30 rounded-lg border border-green-800/50">
                  <span className="text-sm font-medium text-white">{team.owner}</span>
                  <span className="text-sm font-mono font-bold text-green-300">
                    {team.potentialWins} win{team.potentialWins !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            {teams.filter(team => team.potentialWins === 0).length > 0 && (
              <div className="text-sm text-gray-400 text-center py-2">
                {teams.filter(team => team.potentialWins === 0).length} teams with no potential wins
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Points Analysis */}
      <div className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">Points Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {formatNumber(teams.reduce((sum, team) => sum + team.actualPoints, 0) / teams.length)}
            </div>
            <div className="text-sm text-gray-300">Average Points Per Team</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {formatNumber(Math.max(...teams.map(team => team.actualPoints)))}
            </div>
            <div className="text-sm text-gray-300">Highest Scoring Team</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {formatNumber(Math.min(...teams.map(team => team.actualPoints)))}
            </div>
            <div className="text-sm text-gray-300">Lowest Scoring Team</div>
          </div>
        </div>
      </div>
    </div>
  );
};
