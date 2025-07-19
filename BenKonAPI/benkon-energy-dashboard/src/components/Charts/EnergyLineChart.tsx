import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { ChartDataPoint, CHART_COLORS } from '../../types';
import { formatEnergyValue } from '../../utils/dataProcessing';

interface EnergyLineChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  showPerM2?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  showPerM2?: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, showPerM2 }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-2">{`Time: ${label}`}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center text-sm">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700">
              {entry.name}: {formatEnergyValue(entry.value || 0, showPerM2 ? 'Wh/m²' : 'Wh')}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const LoadingSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
    <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
  </div>
);

const EnergyLineChart: React.FC<EnergyLineChartProps> = ({ 
  data, 
  loading = false, 
  showPerM2 = false 
}) => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Hourly Energy Consumption
        </h3>
        <div className="flex items-center justify-center h-80 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No data available</p>
            <p className="text-sm">Select a date range to view energy consumption</p>
          </div>
        </div>
      </div>
    );
  }

  const acKey = showPerM2 ? 'ac_energy_per_m2' : 'ac_energy';
  const totalKey = showPerM2 ? 'total_energy_per_m2' : 'total_energy';
  const acLabel = showPerM2 ? 'AC Energy (Wh/m²)' : 'AC Energy (Wh)';
  const totalLabel = showPerM2 ? 'Total Energy (Wh/m²)' : 'Total Energy (Wh)';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Hourly Energy Consumption {showPerM2 ? '(per m²)' : ''}
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm text-gray-600">AC Energy</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-600">Total Energy</span>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="hour"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatEnergyValue(value, showPerM2 ? 'Wh/m²' : 'Wh')}
            />
            <Tooltip content={<CustomTooltip showPerM2={showPerM2} />} />
            <Legend />
            <Line
              type="monotone"
              dataKey={acKey}
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: CHART_COLORS.primary, strokeWidth: 2 }}
              name={acLabel}
            />
            <Line
              type="monotone"
              dataKey={totalKey}
              stroke={CHART_COLORS.secondary}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.secondary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: CHART_COLORS.secondary, strokeWidth: 2 }}
              name={totalLabel}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {data.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Average hourly consumption over the selected period
        </div>
      )}
    </div>
  );
};

export default EnergyLineChart;