import React from 'react';
import { Equipment } from '../../types';

interface EquipmentTableProps {
  equipment: Equipment[];
  loading?: boolean;
}

const getTypeBadgeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'ac':
      return 'bg-blue-100 text-blue-800';
    case 'hvac':
      return 'bg-green-100 text-green-800';
    case 'sensor':
      return 'bg-purple-100 text-purple-800';
    case 'wired':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatPower = (watts: number): string => {
  if (watts >= 1000) {
    return `${(watts / 1000).toFixed(1)} kW`;
  }
  return `${watts} W`;
};

const formatBTU = (btu: number): string => {
  if (btu >= 1000) {
    return `${(btu / 1000).toFixed(1)}k BTU`;
  }
  return `${btu} BTU`;
};

const LoadingSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

const EquipmentTable: React.FC<EquipmentTableProps> = ({ 
  equipment, 
  loading = false 
}) => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!equipment || equipment.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Equipment List
        </h3>
        <div className="flex items-center justify-center py-12 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">🔧</div>
            <p>No equipment found</p>
            <p className="text-sm">Equipment data will appear here when available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Equipment List
        </h3>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
          {equipment.length} {equipment.length === 1 ? 'device' : 'devices'}
        </span>
      </div>
      
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Equipment ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">BTU</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Rated Power</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((item, index) => (
              <tr 
                key={item.equip_id} 
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <td className="py-3 px-4">
                  <span className="font-mono text-sm text-gray-900">{item.equip_id}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-900 font-medium">{item.equip_name}</span>
                </td>
                <td className="py-3 px-4">
                  <span 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getTypeBadgeColor(item.type)
                    }`}
                  >
                    {item.type.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-700">{formatBTU(item.btu)}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-700">{formatPower(item.rated_power_w)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {equipment.map((item) => (
          <div key={item.equip_id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 truncate">{item.equip_name}</h4>
              <span 
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  getTypeBadgeColor(item.type)
                }`}
              >
                {item.type.toUpperCase()}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-medium">ID:</span> 
                <span className="font-mono ml-1">{item.equip_id}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <span className="font-medium">BTU:</span> {formatBTU(item.btu)}
                </span>
                <span>
                  <span className="font-medium">Power:</span> {formatPower(item.rated_power_w)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {equipment.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Total cooling capacity: {formatBTU(equipment.reduce((sum, eq) => sum + eq.btu, 0))} • 
          Total rated power: {formatPower(equipment.reduce((sum, eq) => sum + eq.rated_power_w, 0))}
        </div>
      )}
    </div>
  );
};

export default EquipmentTable;