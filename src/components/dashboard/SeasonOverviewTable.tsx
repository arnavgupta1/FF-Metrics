'use client';

import React, { useState, useMemo } from 'react';
import { Team } from '@/types';

interface SeasonOverviewTableProps {
  teams: Team[];
}

type SortField = 'sleeperRank' | 'wins' | 'actualPoints';
type SortDirection = 'asc' | 'desc';

export const SeasonOverviewTable: React.FC<SeasonOverviewTableProps> = ({ teams }) => {
  const [sortField, setSortField] = useState<SortField>('sleeperRank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [teams, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <th
      className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          <svg
            className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </th>
  );

  const formatNumber = (num: number): string => {
    return num.toFixed(1);
  };

  const getValueColor = (value: number, isPositive: boolean = true): string => {
    if (value === 0) return 'text-gray-400';
    return isPositive ? 'text-positive' : 'text-negative';
  };

  return (
    <div className="bg-gray-800 shadow-lg overflow-hidden rounded-lg border border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <SortableHeader field="sleeperRank">Sleeper Rank</SortableHeader>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Owner
              </th>
              <SortableHeader field="wins">W</SortableHeader>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                L
              </th>
              <SortableHeader field="actualPoints">Actual Points</SortableHeader>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Opponent Points
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Self Inflicted Losses
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Potential Wins
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {sortedTeams.map((team, index) => (
              <tr key={team.id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-white">
                    {team.sleeperRank}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">
                    {team.owner}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-white">
                    {team.wins}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-white">
                    {team.losses}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className={`text-sm font-mono font-medium ${getValueColor(team.actualPoints)}`}>
                    {formatNumber(team.actualPoints)}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-white">
                    {formatNumber(team.opponentPoints)}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className={`text-sm font-mono font-medium ${getValueColor(team.selfInflictedLosses, false)}`}>
                    {team.selfInflictedLosses}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className={`text-sm font-mono font-medium ${getValueColor(team.potentialWins)}`}>
                    {team.potentialWins}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
