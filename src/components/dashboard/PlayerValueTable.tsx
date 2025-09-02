'use client';

import React, { useState, useMemo } from 'react';
import { PlayerValue } from '@/types';

interface PlayerValueTableProps {
  playerValues: PlayerValue[];
}

type SortField = 'points' | 'rank' | 'vorp' | 'vors' | 'vobp';
type SortDirection = 'asc' | 'desc';

export const PlayerValueTable: React.FC<PlayerValueTableProps> = ({ playerValues }) => {
  const [sortField, setSortField] = useState<SortField>('points');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredPlayers = useMemo(() => {
    let filtered = playerValues;

    // Filter by position
    if (positionFilter !== 'ALL') {
      filtered = filtered.filter(player => player.position === positionFilter);
    }

    // Filter by team (owner)
    if (teamFilter !== 'ALL') {
      filtered = filtered.filter(player => player.owner === teamFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [playerValues, positionFilter, teamFilter, searchTerm]);

  // Get unique teams for the team filter
  const uniqueTeams = useMemo(() => {
    const teams = Array.from(new Set(playerValues.map(player => player.owner)));
    return teams.sort();
  }, [playerValues]);

  // Get unique positions including DEF
  const positions = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

  const sortedPlayers = useMemo(() => {
    return [...filteredPlayers].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredPlayers, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
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

  const getValueColor = (value: number): string => {
    if (value === 0) return 'text-gray-400';
    return value > 0 ? 'text-positive' : 'text-negative';
  };

  return (
    <div className="bg-gray-800 shadow-lg overflow-hidden rounded-lg border border-gray-700">
      {/* Value Metrics Definitions */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-700">
        <h3 className="text-lg font-medium text-white mb-3">Value Metrics Explained</h3>
        
        {/* Season Notice */}
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-800/50 rounded-lg">
          <p className="text-sm text-yellow-200">
            <strong>Note:</strong> Since the season just started, all player points are currently 0. 
            Points and value metrics will populate once games are played and stats become available.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-800/50">
            <h4 className="font-semibold text-blue-200 mb-2">VORP</h4>
            <p className="text-blue-300 text-xs leading-relaxed">
              <strong>Value Over Replacement Player</strong><br/>
              How much better this player is than a typical waiver wire pickup at their position. 
              Calculated as: Player Points - Average Position Points
            </p>
          </div>
          <div className="bg-green-900/30 p-3 rounded-lg border border-green-800/50">
            <h4 className="font-semibold text-green-200 mb-2">VORS</h4>
            <p className="text-green-300 text-xs leading-relaxed">
              <strong>Value Over Replacement Starter</strong><br/>
              How much better this player is than the minimum acceptable starter at their position.
              Baseline: QB12, RB30, WR30, TE12, K12, DEF12
            </p>
          </div>
          <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-800/50">
            <h4 className="font-semibold text-purple-200 mb-2">VOBP</h4>
            <p className="text-purple-300 text-xs leading-relaxed">
              <strong>Value Over Bench Player</strong><br/>
              How much better this player is than the next best option on their team's bench.
              Shows roster depth value.
            </p>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-300">
          <strong>Baseline Starter Points (10-team league):</strong> QB10 (20.0), RB20 (14.0), WR20 (13.5), TE10 (10.0), K10 (9.0), DEF10 (8.0)
        </div>
        <div className="mt-2 text-xs text-gray-400">
          <strong>Note:</strong> DEF (Defense) players are team defenses, not individual defensive players. They score points based on team defensive performance.
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-200 mb-1">
              Search Players
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or owner..."
              className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-200 mb-1">
              Position
            </label>
            <select
              id="position"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-600 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="team" className="block text-sm font-medium text-gray-200 mb-1">
              Team
            </label>
            <select
              id="team"
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-600 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Teams</option>
              {uniqueTeams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setPositionFilter('ALL');
                setTeamFilter('ALL');
                setSearchTerm('');
              }}
              className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filter Summary */}
      {(positionFilter !== 'ALL' || teamFilter !== 'ALL' || searchTerm) && (
        <div className="px-6 py-3 bg-gray-700 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">Active Filters:</span>
              {positionFilter !== 'ALL' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-200 border border-blue-700">
                  Position: {positionFilter}
                  <button
                    onClick={() => setPositionFilter('ALL')}
                    className="ml-1 text-blue-300 hover:text-blue-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {teamFilter !== 'ALL' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-200 border border-green-700">
                  Team: {teamFilter}
                  <button
                    onClick={() => setTeamFilter('ALL')}
                    className="ml-1 text-green-300 hover:text-green-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-900/50 text-purple-200 border border-purple-700">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 text-purple-300 hover:text-purple-100"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setPositionFilter('ALL');
                setTeamFilter('ALL');
                setSearchTerm('');
              }}
              className="text-xs text-gray-400 hover:text-gray-200 underline"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Player
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Pos
              </th>
              <SortableHeader field="points">Points</SortableHeader>
              <SortableHeader field="rank">Rank</SortableHeader>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider group relative">
                <div className="flex items-center space-x-1">
                  <span>VORP</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                  <strong>Value Over Replacement Player</strong><br/>
                  How much better this player is than a typical waiver wire pickup at their position.
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider group relative">
                <div className="flex items-center space-x-1">
                  <span>VORS</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                  <strong>Value Over Replacement Starter</strong><br/>
                  How much better this player is than the minimum acceptable starter at their position.
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider group relative">
                <div className="flex items-center space-x-1">
                  <span>VOBP</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                  <strong>Value Over Bench Player</strong><br/>
                  How much better this player is than the next best option on their team's bench.
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {sortedPlayers.map((player, index) => (
              <tr key={player.id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">
                    {player.name}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {player.owner}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-200 border border-blue-700">
                    {player.position}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono font-medium text-white">
                    {formatNumber(player.points)}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-white">
                    {player.rank}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className={`text-sm font-mono font-medium ${getValueColor(player.vorp)}`}>
                    {formatNumber(player.vorp)}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className={`text-sm font-mono font-medium ${getValueColor(player.vors)}`}>
                    {formatNumber(player.vors)}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className={`text-sm font-mono font-medium ${getValueColor(player.vobp)}`}>
                    {formatNumber(player.vobp)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      <div className="px-6 py-3 bg-gray-700 border-t border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className="text-sm text-gray-200">
            Showing {sortedPlayers.length} of {playerValues.length} players
          </p>
          {(positionFilter !== 'ALL' || teamFilter !== 'ALL' || searchTerm) && (
            <div className="text-xs text-gray-400">
              <span className="mr-2">Filters:</span>
              {positionFilter !== 'ALL' && <span className="inline-block bg-blue-900/50 text-blue-200 px-2 py-1 rounded mr-1">{positionFilter}</span>}
              {teamFilter !== 'ALL' && <span className="inline-block bg-green-900/50 text-green-200 px-2 py-1 rounded mr-1">{teamFilter}</span>}
              {searchTerm && <span className="inline-block bg-purple-900/50 text-purple-200 px-2 py-1 rounded">"{searchTerm}"</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
