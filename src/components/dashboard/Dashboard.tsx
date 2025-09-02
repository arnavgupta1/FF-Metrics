'use client';

import React, { useState, useEffect } from 'react';
import { Team, PlayerValue } from '@/types';
import { SeasonOverviewTable } from './SeasonOverviewTable';
import { PlayerValueTable } from './PlayerValueTable';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { sleeperAPI } from '@/lib/sleeper/api';
import { DataProcessor } from '@/lib/analytics/dataProcessor';

interface DashboardProps {
  leagueId: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ leagueId }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [playerValues, setPlayerValues] = useState<PlayerValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leagueInfo, setLeagueInfo] = useState<any>(null);
  const [isPreDraft, setIsPreDraft] = useState(false);
  const [isRosterOnly, setIsRosterOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, get league info to check status
        const league = await sleeperAPI.getLeague(leagueId);
        setLeagueInfo(league);
        
        // Check if league is in pre-draft status or other statuses without data
        if (['pre_draft', 'drafting', 'draft_paused', 'draft_complete'].includes(league.status)) {
          setIsPreDraft(true);
          setLoading(false);
          return;
        }

        // Get current NFL state to determine season and current week
        const nflState = await sleeperAPI.getNFLState();
        const currentSeason = nflState.season;
        const currentWeek = nflState.week;

        // Fetch all required data from Sleeper API
        const [rosters, users, players] = await Promise.all([
          sleeperAPI.getRosters(leagueId),
          sleeperAPI.getUsers(leagueId),
          sleeperAPI.getPlayers(),
        ]);

        // Check if there are any players on rosters
        const hasPlayers = rosters.some(roster => roster.players && roster.players.length > 0);
        if (!hasPlayers) {
          setIsPreDraft(true);
          setLoading(false);
          return;
        }

        // Fetch player stats for the current season (needed for both modes)
        let playerStats: Record<string, any> = {};
        try {
          playerStats = await sleeperAPI.getPlayerStats(currentSeason);
        } catch (error) {
          console.warn('Could not fetch player stats:', error);
          // Continue without stats
        }

        // Fetch matchups for completed weeks (up to current week - 1)
        const completedWeeks = Math.min(currentWeek - 1, 18); // Max 18 weeks
        let matchups: any[][] = [];
        
        if (completedWeeks > 0) {
          try {
            matchups = await sleeperAPI.getAllMatchups(leagueId, completedWeeks);
          } catch (error) {
            console.warn('Could not fetch matchups:', error);
            // Continue without matchups
          }
        }

        // Check if there are any matchups with actual data
        // Note: For leagues that just started, there might not be any completed matchups yet
        const hasMatchupData = matchups.some(weekMatchups => 
          weekMatchups.some(matchup => matchup.points > 0 || matchup.opponent_points > 0)
        );
        
        // If no matchup data but we have players, this might be a league that just started
        // We'll still show the dashboard with roster information, just without matchup-based analytics
        if (!hasMatchupData && completedWeeks === 0) {
          console.log('League is in season but no games played yet - showing roster-only dashboard');
          console.log('Rosters data:', rosters);
          console.log('Users data:', users);
          console.log('Players data sample:', Object.keys(players).slice(0, 5));
          console.log('Sample player data:', players[Object.keys(players)[0]]);
          
          setIsRosterOnly(true);
          
          // Process data for roster-only mode (without matchup data)
          const processedTeams = DataProcessor.processTeams(rosters, users, [], players, {});
          const processedPlayerValues = DataProcessor.processPlayerValues(rosters, users, players, playerStats);
          
          console.log('Processed teams:', processedTeams);
          console.log('Processed player values:', processedPlayerValues);
          
          setTeams(processedTeams);
          setPlayerValues(processedPlayerValues);
          setLoading(false);
          return;
        }

        // Fetch projections for the most recent week (if available)
        let projections: Record<string, any> = {};
        if (completedWeeks > 0) {
          try {
            projections = await sleeperAPI.getPlayerProjections(currentSeason, completedWeeks);
          } catch (error) {
            console.warn('Could not fetch projections:', error);
            // Continue without projections
          }
        }

        // Process data into dashboard-ready format for full analytics
        const processedTeams = DataProcessor.processTeams(rosters, users, matchups, players, projections);
        const processedPlayerValues = DataProcessor.processPlayerValues(rosters, users, players, playerStats);

        setTeams(processedTeams);
        setPlayerValues(processedPlayerValues);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (leagueId) {
      fetchData();
    }
  }, [leagueId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-700 rounded mb-6"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isPreDraft) {
    const getStatusMessage = (status: string) => {
      switch (status) {
        case 'pre_draft':
          return 'Your league is currently in pre-draft status.';
        case 'drafting':
          return 'Your league is currently drafting.';
        case 'draft_paused':
          return 'Your league draft is currently paused.';
        case 'draft_complete':
          return 'Your league draft is complete, but the season hasn\'t started yet.';
        default:
          return 'Your league is not ready for analytics yet.';
      }
    };

    const getActionMessage = (status: string) => {
      switch (status) {
        case 'pre_draft':
        case 'drafting':
        case 'draft_paused':
          return 'The dashboard will be available once the draft is completed and the season begins.';
        case 'draft_complete':
          return 'The dashboard will be available once the season begins and games are played.';
        default:
          return 'Check back later to see your team analytics!';
      }
    };

    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-blue-900/30 border border-blue-800/50 rounded-md p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-800/50 mb-4">
              <svg className="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-blue-200 mb-2">League Not Ready Yet</h3>
            <div className="text-blue-300 mb-6">
              <p className="mb-2">
                <strong>{leagueInfo?.name || 'Your league'}</strong> {getStatusMessage(leagueInfo?.status || 'unknown')}
              </p>
              <p className="text-sm">
                {getActionMessage(leagueInfo?.status || 'unknown')}
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
              <h4 className="font-medium text-white mb-2">League Details</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p><strong>Status:</strong> <span className="capitalize">{leagueInfo?.status?.replace('_', ' ') || 'Unknown'}</span></p>
                <p><strong>Season:</strong> {leagueInfo?.season || 'Unknown'}</p>
                <p><strong>Teams:</strong> {leagueInfo?.total_rosters || 'Unknown'}</p>
                <p><strong>Draft Rounds:</strong> {leagueInfo?.settings?.draft_rounds || 'Unknown'}</p>
              </div>
            </div>

            <div className="text-sm text-blue-300">
              <p>Check back after your draft is completed to see your team analytics!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isRosterOnly) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Fantasy Football Analytics Dashboard</h1>
          
          {/* League Status Banner */}
          <div className="bg-blue-900/30 border border-blue-800/50 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-200">Season Just Started</h3>
                <div className="mt-2 text-sm text-blue-300">
                  <p>Your league <strong>{leagueInfo?.name || 'NYC BALLERS'}</strong> is in season but hasn't played any games yet.</p>
                  <p className="mt-1">The dashboard will show full analytics once games are played and matchup data becomes available.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Rosters Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">Team Rosters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div key={team.id} className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">{team.owner}</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><strong>Team ID:</strong> {team.id}</p>
                    <p><strong>Wins:</strong> {team.wins}</p>
                    <p><strong>Losses:</strong> {team.losses}</p>
                    <p><strong>Total Points:</strong> {team.actualPoints.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Player Value Analysis Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">Player Value Analysis</h2>
            <PlayerValueTable playerValues={playerValues} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/30 border border-red-800/50 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-200">Error Loading Dashboard</h3>
                <div className="mt-2 text-sm text-red-300">{error}</div>
                <div className="mt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-800/50 text-red-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-800/70 border border-red-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Fantasy Football Analytics Dashboard</h1>
        
        {/* Season Overview Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-200 mb-4">Season Overview</h2>
          <SeasonOverviewTable teams={teams} />
        </div>

        {/* Advanced Analytics Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-200 mb-4">Advanced Analytics</h2>
          <AdvancedAnalytics teams={teams} />
        </div>

        {/* Player Value Analysis Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-200 mb-4">Player Value Analysis</h2>
          <PlayerValueTable playerValues={playerValues} />
        </div>
      </div>
    </div>
  );
};
