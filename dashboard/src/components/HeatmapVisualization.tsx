'use client';

import { useEffect, useRef, useState } from 'react';

interface HeatmapData {
  x: number;
  y: number;
  count: number;
}

interface HeatmapVisualizationProps {
  url: string;
  data: HeatmapData[];
  width?: number;
  height?: number;
}

export default function HeatmapVisualization({
  url,
  data,
  width = 1200,
  height = 800
}: HeatmapVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSize, setImageSize] = useState({ width, height });

  useEffect(() => {
    drawHeatmap();
  }, [data, imageSize]);

  const drawHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find max count for normalization
    const maxCount = Math.max(...data.map(d => d.count), 1);

    // Draw each click point
    data.forEach(point => {
      const intensity = point.count / maxCount;
      const radius = 20 + (intensity * 30); // Radius based on intensity

      // Create gradient for each point
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, radius
      );

      // Color gradient from transparent to opaque red
      gradient.addColorStop(0, `rgba(255, 0, 0, ${0.8 * intensity})`);
      gradient.addColorStop(0.5, `rgba(255, 100, 0, ${0.5 * intensity})`);
      gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');

      // Draw the point
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Click Heatmap</h2>
      <p className="text-gray-600 mb-4">
        URL: <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{url}</span>
      </p>

      <div className="relative overflow-auto max-h-screen">
        <div className="relative inline-block">
          {/* Background image preview */}
          <img
            src={`https://screenshot.abstractapi.com/v1/?api_key=free&url=${encodeURIComponent(url)}`}
            alt="Page screenshot"
            className="max-w-full h-auto opacity-50"
            onLoad={handleImageLoad}
            onError={() => {
              // Fallback if screenshot service fails
              const canvas = canvasRef.current;
              if (canvas) {
                canvas.style.backgroundColor = '#f3f4f6';
              }
            }}
          />

          {/* Heatmap overlay */}
          <canvas
            ref={canvasRef}
            width={imageSize.width}
            height={imageSize.height}
            className="absolute top-0 left-0 pointer-events-none"
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-200 rounded"></div>
            <span className="text-sm text-gray-600">Low activity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-400 rounded"></div>
            <span className="text-sm text-gray-600">Medium activity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-sm text-gray-600">High activity</span>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {data.length} clicks recorded
        </div>
      </div>
    </div>
  );
}