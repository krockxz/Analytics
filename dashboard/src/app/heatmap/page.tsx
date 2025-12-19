'use client';

import { useState } from 'react';
import { analyticsApi } from '@/services/api';
import HeatmapVisualization from '@/components/HeatmapVisualization';

export default function HeatmapPage() {
  const [url, setUrl] = useState('');
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateHeatmap = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await analyticsApi.getHeatmapData(url);
      setHeatmapData(response.data);
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
      setError('Failed to load heatmap data. Make sure the URL has tracked events.');
    } finally {
      setLoading(false);
    }
  };

  // Get unique URLs from sessions for quick selection
  const commonUrls = [
    'http://localhost:3000',
    'http://localhost:3001/demo.html',
    'http://localhost:3001',
    'https://example.com'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Click Heatmap Visualization</h1>
          <p className="text-gray-600">Visualize user click patterns on your pages</p>
        </header>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Page URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/page"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleGenerateHeatmap()}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerateHeatmap}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Generate Heatmap'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Quick select:</p>
            <div className="flex flex-wrap gap-2">
              {commonUrls.map((commonUrl) => (
                <button
                  key={commonUrl}
                  onClick={() => setUrl(commonUrl)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  {commonUrl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {heatmapData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Clicks</h3>
                <p className="text-3xl font-bold text-gray-900">{heatmapData.totalClicks}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Unique Sessions</h3>
                <p className="text-3xl font-bold text-blue-600">{heatmapData.uniqueSessions}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Clicks/Session</h3>
                <p className="text-3xl font-bold text-green-600">
                  {heatmapData.uniqueSessions > 0
                    ? (heatmapData.totalClicks / heatmapData.uniqueSessions).toFixed(1)
                    : '0'}
                </p>
              </div>
            </div>

            <HeatmapVisualization
              url={heatmapData.url}
              data={heatmapData.clicks}
            />
          </>
        )}

        {!heatmapData && !loading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No heatmap data</h3>
            <p className="text-gray-600">
              Enter a URL above to generate a click heatmap visualization
            </p>
          </div>
        )}
      </div>
    </div>
  );
}