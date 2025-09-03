'use client';

import React, { useState, useEffect } from 'react';
import { DraftAnalysisData, DraftPickAnalysis } from '@/types/draft';
import { TeamTiersDashboard } from './TeamTiersDashboard';

interface DraftAnalysisDashboardProps {
  leagueId: string;
}

export function DraftAnalysisDashboard({ leagueId }: DraftAnalysisDashboardProps) {
  const [analysisData, setAnalysisData] = useState<DraftAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'picks' | 'team-tiers'>('picks');
  const [showDefinitions, setShowDefinitions] = useState(true);
  const [filters, setFilters] = useState({
    team: '',
    position: '',
    sortBy: 'pickNumber',
    sortOrder: 'asc' as 'asc' | 'desc',
  });

  useEffect(() => {
    analyzeDraft();
  }, [leagueId]);

  const analyzeDraft = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/draft-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leagueId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze draft: ${response.statusText}`);
      }

      const result = await response.json();
      setAnalysisData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredPicks = analysisData?.allPicks.filter(pick => {
    const teamMatch = !filters.team || pick.team === filters.team;
    const positionMatch = !filters.position || pick.position === filters.position;
    return teamMatch && positionMatch;
  }).sort((a, b) => {
    const aValue = a[filters.sortBy as keyof DraftPickAnalysis];
    const bValue = b[filters.sortBy as keyof DraftPickAnalysis];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    const aStr = String(aValue);
    const bStr = String(bValue);
    return filters.sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Analyzing draft data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-6 max-w-md">
            <h2 className="text-red-200 text-xl font-semibold mb-2">Error</h2>
            <p className="text-red-300">{error}</p>
            <button
              onClick={analyzeDraft}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">No analysis data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-white">{analysisData.leagueName} - Draft Analysis</h1>
          <p className="text-gray-300 mt-1">
            {analysisData.totalPicks} total picks analyzed
          </p>
          
          {/* Navigation Tabs */}
          <div className="mt-4 flex space-x-1">
            <button
              onClick={() => setActiveTab('picks')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'picks'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Draft Picks
            </button>
            <button
              onClick={() => setActiveTab('team-tiers')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'team-tiers'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Team Tiers
            </button>
          </div>
        </div>
      </div>



      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'picks' ? (
          <>
            {/* Definitions */}
            <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg mb-6">
              <button
                onClick={() => setShowDefinitions(!showDefinitions)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-blue-800/20 transition-colors rounded-lg"
              >
                <h2 className="text-lg font-semibold text-white">Metric Definitions</h2>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    showDefinitions ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showDefinitions && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-300">
                        <span className="font-medium text-white">ADP:</span> Updated based on league settings from Sleeper. Picks are converted to relevant draft format (1.01-1.10, 2.01-2.10, etc.).
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-300">
                        <span className="font-medium text-white">Expert Rank:</span> Based on scoring settings from FantasyPros (not Arnav). Rank within position group.
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-300">
                        <span className="font-medium text-white">VAL-ADP:</span> The pick at which a player becomes good value. Player's current ADP that is higher than VAL-ADP is marked with a "+" indicating good values. Calculated by Linear Regression (ADP vs. Proj Points) and determining expected points per pick given the player's position.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-800/30">
                    <p className="text-sm text-blue-200 italic">
                      Note: N/A is shown for DEF and K positions since they don't have ADP.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <DraftPicksTable 
              picks={filteredPicks}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </>
        ) : (
          <TeamTiersDashboard 
            leagueId={leagueId}
            draftAnalysisData={analysisData}
          />
        )}
      </div>
    </div>
  );
}

// Draft Picks Table Component
function DraftPicksTable({ 
  picks, 
  filters, 
  onFiltersChange
}: { 
  picks: DraftPickAnalysis[];
  filters: any;
  onFiltersChange: (filters: any) => void;
}) {
  const teamOptions = Array.from(new Set(picks.map(pick => pick.team)));
  const positionOptions = ['QB', 'RB', 'WR', 'TE', 'DEF', 'K'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Team</label>
            <select
              value={filters.team}
              onChange={(e) => onFiltersChange({ ...filters, team: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            >
              <option value="">All Teams</option>
              {teamOptions.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
            <select
              value={filters.position}
              onChange={(e) => onFiltersChange({ ...filters, position: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            >
              <option value="">All Positions</option>
              {positionOptions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            >
              <option value="pickNumber">Pick Number</option>
              <option value="reach">Reach Amount</option>
              <option value="adp">ADP</option>
              <option value="expertRank">Expert Rank</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => onFiltersChange({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Picks Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Round
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Pick
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  ADP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Expert Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Reach
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  VAL-ADP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tier
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {picks.map((pick) => (
                <tr key={pick.pickNumber} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {pick.round}.{(pick.pickNumber - 1) % 10 + 1 < 10 ? '0' : ''}{(pick.pickNumber - 1) % 10 + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {pick.pickNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {pick.playerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pick.position === 'QB' ? 'bg-blue-900 text-blue-200' :
                      pick.position === 'RB' ? 'bg-green-900 text-green-200' :
                      pick.position === 'WR' ? 'bg-purple-900 text-purple-200' :
                      pick.position === 'TE' ? 'bg-orange-900 text-orange-200' :
                      'bg-gray-600 text-gray-200'
                    }`}>
                      {pick.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {pick.team}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {pick.adp > 0 ? pick.adp : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {pick.expertRank > 0 ? pick.expertRank : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {pick.reach !== 0 ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pick.reach < 0 
                          ? 'bg-green-900 text-green-200' 
                          : 'bg-red-900 text-red-200'
                      }`}>
                        {pick.reach > 0 ? '+' : ''}{pick.reach}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {pick.valAdpScore}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {pick.tier}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
