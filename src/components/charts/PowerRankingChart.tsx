'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Team } from '@/types';

interface PowerRankingChartProps {
  teams: Team[];
}

export const PowerRankingChart: React.FC<PowerRankingChartProps> = ({ teams }) => {
  const chartData = teams
    .sort((a, b) => a.powerRank - b.powerRank)
    .map(team => ({
      name: team.owner,
      powerRank: team.powerRank,
      powerRankValue: team.powerRankValue,
      actualPoints: team.actualPoints,
    }));

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-medium text-white mb-4">Power Rankings vs Actual Points</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 12, fill: '#d1d5db' }}
            />
            <YAxis yAxisId="left" orientation="left" stroke="#a78bfa" tick={{ fill: '#d1d5db' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#34d399" tick={{ fill: '#d1d5db' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #4b5563',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
            />
            <Bar yAxisId="left" dataKey="powerRankValue" fill="#a78bfa" name="Power Rank Value" />
            <Bar yAxisId="right" dataKey="actualPoints" fill="#34d399" name="Actual Points" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-300 text-center">
        <span className="inline-block w-3 h-3 bg-purple-400 rounded mr-2"></span>
        Power Rank Value
        <span className="inline-block w-3 h-3 bg-green-400 rounded ml-4 mr-2"></span>
        Actual Points
      </div>
    </div>
  );
};
