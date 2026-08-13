import React from 'react';
import { SimulationSnapshot } from '../lib/simulation';

interface ChartsProps {
  simulationData: SimulationSnapshot[];
  isLoading: boolean;
}

function LineChart({ data, dataKey, color, title }: {
  data: SimulationSnapshot[];
  dataKey: keyof SimulationSnapshot;
  color: string;
  title: string;
}) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map(d => (d[dataKey] as number)));
  const minY = 0;

  const width = 600;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const xStep = graphWidth / (data.length - 1 || 1);
  const yScale = graphHeight / (max || 1);

  const points = data.map((d, i) => ({
    x: padding.left + i * xStep,
    y: padding.top + graphHeight - ((d[dataKey] as number - minY) * yScale)
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <svg width={width} height={height} className="w-full">
        <g>
          {/* Y-axis */}
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#e5e7eb" strokeWidth="1" />

          {/* X-axis */}
          <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#e5e7eb" strokeWidth="1" />

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const yValue = Math.round(max * ratio);
            const yPos = padding.top + graphHeight - (ratio * graphHeight);
            return (
              <g key={`y-${i}`}>
                <line x1={padding.left - 5} y1={yPos} x2={padding.left} y2={yPos} stroke="#d1d5db" strokeWidth="1" />
                <text x={padding.left - 10} y={yPos + 4} textAnchor="end" fontSize="12" fill="#6b7280">
                  {yValue}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.map((_, i) => {
            if (i % Math.ceil(data.length / 6) === 0) {
              const xPos = padding.left + (i * graphWidth / (data.length - 1 || 1));
              return (
                <g key={`x-${i}`}>
                  <line x1={xPos} y1={height - padding.bottom} x2={xPos} y2={height - padding.bottom + 5} stroke="#d1d5db" strokeWidth="1" />
                  <text x={xPos} y={height - padding.bottom + 20} textAnchor="middle" fontSize="12" fill="#6b7280">
                    {i}h
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio, i) => {
            const yPos = padding.top + graphHeight - (ratio * graphHeight);
            return (
              <line key={`grid-${i}`} x1={padding.left} y1={yPos} x2={width - padding.right} y2={yPos} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4" />
            );
          })}

          {/* Line */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="2" />

          {/* Area under line */}
          <path
            d={`${pathD} L ${padding.left + graphWidth} ${padding.top + graphHeight} L ${padding.left} ${padding.top + graphHeight} Z`}
            fill={color}
            opacity="0.1"
          />

          {/* Points */}
          {points.map((p, i) => (
            <circle key={`point-${i}`} cx={p.x} cy={p.y} r="3" fill={color} opacity="0.6" />
          ))}
        </g>
      </svg>
    </div>
  );
}

function Heatmap({ data }: { data: number[][] }) {
  if (data.length === 0) return null;

  const rows = data.length;
  const cols = data[0].length;
  const cellWidth = 40;
  const cellHeight = 30;

  const getColor = (value: number) => {
    if (value < 25) return '#10b981';
    if (value < 50) return '#eab308';
    if (value < 75) return '#f97316';
    return '#ef4444';
  };

  const staffLevels = Array.from({ length: rows }, (_, i) => `${(i + 1) * 5} staff`);
  const demandLevels = Array.from({ length: cols }, (_, i) => `${(i + 1) * 25} pat/day`);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Utilization Heatmap (Demand vs Staffing)</h3>
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={`row-${rowIdx}`}>
                <td className="text-xs font-medium text-gray-600 pr-2 py-1 w-16 text-right">
                  {staffLevels[rowIdx]}
                </td>
                {row.map((value, colIdx) => (
                  <td
                    key={`cell-${rowIdx}-${colIdx}`}
                    style={{
                      backgroundColor: getColor(value),
                      width: cellWidth,
                      height: cellHeight,
                      textAlign: 'center',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    title={`${value.toFixed(1)}%`}
                    className="border border-gray-200"
                  >
                    <span className="text-xs font-medium text-white opacity-0 hover:opacity-100 transition-opacity">
                      {value.toFixed(0)}%
                    </span>
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td />
              {demandLevels.map((label, i) => (
                <td key={`header-${i}`} className="text-xs font-medium text-gray-600 text-center pt-2" style={{ width: cellWidth }}>
                  {label}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }} />
          <span>Low (&lt;25%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }} />
          <span>Medium (25-50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }} />
          <span>High (50-75%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
          <span>Critical (&gt;75%)</span>
        </div>
      </div>
    </div>
  );
}

export function Charts({ simulationData, isLoading }: ChartsProps) {
  if (isLoading) return null;

  if (simulationData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        <p>No simulation data available. Run optimization to generate charts.</p>
      </div>
    );
  }

  const utilizationHeatmap = generateUtilizationHeatmap(simulationData);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Patient Flow Simulation (24-Hour)</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={simulationData}
          dataKey="queue_length"
          color="#3b82f6"
          title="Queue Length Over Time"
        />
        <LineChart
          data={simulationData}
          dataKey="bedsOccupied"
          color="#10b981"
          title="Beds Occupied Over Time"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={simulationData}
          dataKey="avg_wait_time"
          color="#f97316"
          title="Average Wait Time Over Time"
        />
        <LineChart
          data={simulationData}
          dataKey="staff_utilization"
          color="#8b5cf6"
          title="Staff Utilization Over Time"
        />
      </div>

      <Heatmap data={utilizationHeatmap} />
    </div>
  );
}

function generateUtilizationHeatmap(simulationData: SimulationSnapshot[]): number[][] {
  const staffLevels = [5, 10, 15, 20, 25];
  const demandLevels = [25, 50, 75, 100, 125];
  const heatmap: number[][] = [];

  for (const staffLevel of staffLevels) {
    const row: number[] = [];
    for (const demandLevel of demandLevels) {
      const baseUtilization = (demandLevel / (staffLevel * 4)) * 100;
      const variation = Math.random() * 10 - 5;
      row.push(Math.max(0, Math.min(100, baseUtilization + variation)));
    }
    heatmap.push(row);
  }

  return heatmap;
}
