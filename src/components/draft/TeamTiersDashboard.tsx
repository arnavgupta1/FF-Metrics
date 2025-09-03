'use client';

import React, { useState, useEffect } from 'react';
import { TeamTiersSpiderChart } from '@/components/charts/TeamTiersSpiderChart';
import { IndividualTeamSpiderChart } from '@/components/charts/IndividualTeamSpiderChart';
import { TeamTierData, DraftAnalysisData } from '@/types/draft';

interface TeamTiersDashboardProps {
  leagueId: string;
  draftAnalysisData: DraftAnalysisData;
}

export function TeamTiersDashboard({ leagueId, draftAnalysisData }: TeamTiersDashboardProps) {
  const [teamTierData, setTeamTierData] = useState<TeamTierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'combined' | 'individual'>('combined');

  useEffect(() => {
    loadTeamTierData();
  }, [leagueId, draftAnalysisData]);

  const loadTeamTierData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/team-tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          leagueId,
          draftAnalysisData 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to load team tier data: ${response.statusText}`);
      }

      const result = await response.json();
      setTeamTierData(result.data);
      
      // Select all teams by default
      setSelectedTeams(result.data.map((team: TeamTierData) => team.teamName));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamToggle = (teamName: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamName) 
        ? prev.filter(name => name !== teamName)
        : [...prev, teamName]
    );
  };

  const handleToggleAllTeams = () => {
    if (selectedTeams.length === teamTierData.length) {
      // If all teams are selected, deselect all
      setSelectedTeams([]);
    } else {
      // If not all teams are selected, select all
      setSelectedTeams(teamTierData.map(team => team.teamName));
    }
  };

  const calculateOverallRanking = (teams: TeamTierData[]) => {
    return teams
      .sort((a, b) => a.overallTierScore - b.overallTierScore)
      .map((team, index) => ({
        ...team,
        rank: index + 1
      }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading team tier data...</p>
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
              onClick={loadTeamTierData}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!teamTierData.length) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">No team tier data available</p>
        </div>
      </div>
    );
  }

  const rankedTeams = calculateOverallRanking(teamTierData);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-white">{draftAnalysisData.leagueName} - Team Expert Rankings</h1>
          <p className="text-gray-300 mt-1">
            Position group analysis based on expert consensus rankings
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* View Mode Toggle */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">Team Position Analysis</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('combined')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'combined'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Combined View
              </button>
              <button
                onClick={() => setViewMode('individual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'individual'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Individual Teams
              </button>
            </div>
          </div>
        </div>

        {/* Charts */}
        {viewMode === 'combined' ? (
          <TeamTiersSpiderChart 
            teams={teamTierData}
            selectedTeams={selectedTeams}
            onTeamToggle={handleTeamToggle}
            onToggleAllTeams={handleToggleAllTeams}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {teamTierData.map((team) => (
              <IndividualTeamSpiderChart key={team.teamName} team={team} />
            ))}
          </div>
        )}

        {/* Team Rankings Table - Only show in combined view */}
        {viewMode === 'combined' && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">Team Rankings by Overall Expert Rank Score</h3>
              <p className="text-sm text-gray-300 mt-1">
                Lower scores indicate better overall roster construction (weighted: RB/WR 2.0x, QB/TE 1.5x, DEF 0.8x, K 0.5x)
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Expert Rank Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      QB
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      RB
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      WR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      TE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      K
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      DEF
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {rankedTeams.map((team) => (
                    <tr key={team.teamName} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          team.rank === 1 ? 'bg-yellow-900 text-yellow-200' :
                          team.rank <= 3 ? 'bg-gray-600 text-gray-200' :
                          team.rank <= 6 ? 'bg-orange-900 text-orange-200' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          #{team.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                        {team.teamName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {team.overallTierScore.toFixed(2)}
                      </td>
                      {['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map(position => {
                        const positionData = team.positionTiers[position];
                        return (
                          <td key={position} className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {positionData && positionData.averageTier > 0 ? (
                              <div className="text-center">
                                <div className="font-medium">{positionData.averageTier.toFixed(1)}</div>
                                <div className="text-xs text-gray-400">({positionData.totalPlayers})</div>
                              </div>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
