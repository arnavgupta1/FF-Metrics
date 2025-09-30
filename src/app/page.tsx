'use client';

import React, { useState } from 'react';
import { Dashboard } from '@/components/dashboard/Dashboard';

import { DraftAnalysisDashboard } from '@/components/draft/DraftAnalysisDashboard';

export default function HomePage() {
  const LEAGUE_ID = '1253253109279375360';
  const [leagueId, setLeagueId] = useState<string>(LEAGUE_ID);
  const [showDashboard, setShowDashboard] = useState<boolean>(false);

  const [showDraftAnalysis, setShowDraftAnalysis] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (leagueId.trim()) {
      setShowDashboard(true);

      setShowDraftAnalysis(false);
    }
  };

  const handleDraftAnalysis = () => {
    if (leagueId.trim()) {
      setShowDraftAnalysis(true);
      setShowDashboard(false);

    }
  };

  const handleBack = () => {
    setShowDashboard(false);
    setShowDraftAnalysis(false);
    setLeagueId('');
  };

  if (showDashboard) {
    return (
      <div>
        <div className="bg-gray-800 shadow-sm border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
          </div>
        </div>
        <Dashboard leagueId={leagueId} />
      </div>
    );
  }



  if (showDraftAnalysis) {
    return (
      <div>
        <div className="bg-gray-800 shadow-sm border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
          </div>
        </div>
        <DraftAnalysisDashboard leagueId={leagueId} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">

          <h1 className="text-3xl font-bold text-white mb-2">
            Fantasy Football Analytics Dashboard
          </h1>
          <p className="text-lg text-gray-300">
            Get comprehensive insights into your fantasy football league
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-6 shadow-lg rounded-lg border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="leagueId" className="block text-sm font-medium text-gray-200 mb-2">
                Sleeper League ID
              </label>
              <input
                id="leagueId"
                name="leagueId"
                type="text"
                required
                value={leagueId}
                onChange={(e) => setLeagueId(e.target.value)}
                placeholder="Enter your Sleeper league ID"
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-2 text-sm text-gray-400">
                Find your league ID in the URL when viewing your league on Sleeper
              </p>
            </div>

            <div className="space-y-3">
              {/* TODO: Uncomment the Analyze Season button when ready to release this feature */}
              <button
                type="submit"
                disabled={!leagueId.trim()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze Season
              </button>
              
              <button
                type="button"
                onClick={handleDraftAnalysis}
                disabled={!leagueId.trim()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze Draft
              </button>
              

            </div>
          </form>




        </div>
      </div>
    </div>
  );
}
