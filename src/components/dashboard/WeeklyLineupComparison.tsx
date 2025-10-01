'use client';

import React, { useState, useMemo } from 'react';
import { Team, WeeklyLineup } from '@/types';

interface WeeklyLineupComparisonProps {
  teams: Team[];
}

export const WeeklyLineupComparison: React.FC<WeeklyLineupComparisonProps> = ({ teams }) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(teams[0] || null);

  const formatNumber = (num: number): string => {
    return num.toFixed(1);
  };

  const getRowColor = (lineup: WeeklyLineup): string => {
    if (lineup.isSelfInflicted) {
      return 'bg-red-900/30 border-l-4 border-red-500';
    }
    if (lineup.isUnavoidableLoss) {
      return 'bg-orange-900/20 border-l-4 border-orange-600';
    }
    if (lineup.isLoss) {
      return 'bg-gray-700';
    }
    return 'bg-gray-800';
  };

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => a.owner.localeCompare(b.owner));
  }, [teams]);

  if (!selectedTeam || !selectedTeam.weeklyLineups || selectedTeam.weeklyLineups.length === 0) {
    return (
      <div className="bg-gray-800 shadow-lg overflow-hidden rounded-lg border border-gray-700 p-6">
        <p className="text-gray-400 text-center">No weekly lineup data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Team Selector */}
      <div className="bg-gray-800 shadow-lg overflow-hidden rounded-lg border border-gray-700 p-4">
        <label htmlFor="team-select" className="block text-sm font-medium text-gray-300 mb-2">
          Select Team
        </label>
        <select
          id="team-select"
          value={String(selectedTeam.id)}
          onChange={(e) => {
            const team = teams.find(t => String(t.id) === e.target.value);
            if (team) setSelectedTeam(team);
          }}
          className="w-full md:w-auto bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sortedTeams.map((team) => (
            <option key={team.id} value={String(team.id)}>
              {team.owner} ({team.wins}-{team.losses})
            </option>
          ))}
        </select>
      </div>

      {/* Weekly Comparison Table */}
      <div className="bg-gray-800 shadow-lg overflow-hidden rounded-lg border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Week
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actual Points
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Optimal Points
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Points Left on Bench
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Opponent
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Opponent Points
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Result
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {selectedTeam.weeklyLineups.map((lineup) => (
                <tr key={lineup.week} className={getRowColor(lineup)}>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-white">
                      {lineup.week}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-white">
                      {formatNumber(lineup.actualPoints)}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-white">
                      {formatNumber(lineup.optimalPoints)}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className={`text-sm font-mono font-medium ${
                      lineup.pointsLeftOnBench > 10 ? 'text-red-400' :
                      lineup.pointsLeftOnBench > 5 ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}>
                      {formatNumber(lineup.pointsLeftOnBench)}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {lineup.opponentName}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-white">
                      {formatNumber(lineup.opponentPoints)}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {lineup.isSelfInflicted ? (
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-200">
                          Self-Inflicted Loss
                        </span>
                      </div>
                    ) : lineup.isUnavoidableLoss ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-900/50 text-orange-200">
                        Unavoidable Loss
                      </span>
                    ) : lineup.isLoss ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        Loss
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-200">
                        Win
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 shadow-lg overflow-hidden rounded-lg border border-gray-700 p-4">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Total Self-Inflicted Losses
          </div>
          <div className="text-2xl font-bold text-red-400">
            {selectedTeam.selfInflictedLosses}
          </div>
        </div>
        <div className="bg-gray-800 shadow-lg overflow-hidden rounded-lg border border-gray-700 p-4">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Total Unavoidable Losses
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {selectedTeam.unavoidableLosses}
          </div>
        </div>
        <div className="bg-gray-800 shadow-lg overflow-hidden rounded-lg border border-gray-700 p-4">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Average Points Left on Bench
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {formatNumber(
              selectedTeam.weeklyLineups.reduce((sum, l) => sum + l.pointsLeftOnBench, 0) /
              selectedTeam.weeklyLineups.length
            )}
          </div>
        </div>
        <div className="bg-gray-800 shadow-lg overflow-hidden rounded-lg border border-gray-700 p-4">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Optimal Win %
          </div>
          <div className="text-2xl font-bold text-green-400">
            {formatNumber(
              (selectedTeam.weeklyLineups.filter(l => l.optimalPoints > l.opponentPoints).length /
              selectedTeam.weeklyLineups.length) * 100
            )}%
          </div>
        </div>
      </div>
    </div>
  );
};
