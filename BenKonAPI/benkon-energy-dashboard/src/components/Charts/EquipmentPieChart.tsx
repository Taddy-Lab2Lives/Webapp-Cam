import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  TooltipProps
} from 'recharts';
import { PieChartDataPoint } from '../../types';
import { formatEnergyValue, formatPercentage } from '../../utils/dataProcessing';

interface EquipmentPieChartProps {
  data: PieChartDataPoint[];
  loading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as PieChartDataPoint;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-1">{data.name}</p>
        <p className="text-blue-600">
          Energy: {formatEnergyValue(data.value)}
        </p>
        <p className="text-green-600">
          Share: {formatPercentage(data.percentage)}
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend: React.FC<{ payload?: any[] }> = ({ payload }) => {
  if (!payload) return null;

  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center">
          <div
            className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-700 truncate" title={entry.value}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
    <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
  </div>
);

const EquipmentPieChart: React.FC<EquipmentPieChartProps> = ({ 
  data, 
  loading = false 
}) => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Equipment Energy Distribution
        </h3>
        <div className="flex items-center justify-center h-80 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">⚡</div>
            <p>No equipment data available</p>
            <p className="text-sm">Equipment energy data will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total for display
  const totalEnergy = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Equipment Energy Distribution
        </h3>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Energy</p>
          <p className="text-lg font-semibold text-gray-800">
            {formatEnergyValue(totalEnergy)}
          </p>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={40}
              paddingAngle={2}
              dataKey="value"
              label={({ percentage }) => `${percentage.toFixed(1)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Equipment List */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Equipment Details</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <div className="flex items-center flex-1 min-w-0">
                <div
                  className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700 truncate" title={item.name}>
                  {item.name}
                </span>
              </div>
              <div className="flex flex-col items-end ml-2">
                <span className="text-sm font-medium text-gray-900">
                  {formatEnergyValue(item.value)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatPercentage(item.percentage)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {data.length > 5 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Showing top {data.length} equipment by energy consumption
        </div>
      )}
    </div>
  );
};

export default EquipmentPieChart;