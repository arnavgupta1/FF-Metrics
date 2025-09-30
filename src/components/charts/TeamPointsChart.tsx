'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Team } from '@/types';

interface TeamPointsChartProps {
  teams: Team[];
}

export const TeamPointsChart: React.FC<TeamPointsChartProps> = ({ teams }) => {
  const chartData = teams
    .sort((a, b) => b.actualPoints - a.actualPoints)
    .map(team => ({
      name: team.owner,
      actualPoints: team.actualPoints,
      wins: team.wins,
      losses: team.losses,
    }));

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-medium text-white mb-4">Team Performance Overview</h3>
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
            <YAxis stroke="#34d399" tick={{ fill: '#d1d5db' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #4b5563',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
            />
            <Bar dataKey="actualPoints" fill="#34d399" name="Actual Points" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-300 text-center">
        <span className="inline-block w-3 h-3 bg-green-400 rounded mr-2"></span>
        Actual Points
      </div>
    </div>
  );
};
