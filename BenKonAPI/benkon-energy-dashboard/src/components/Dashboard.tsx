import React, { useState, useEffect, useCallback } from 'react';
import { 
  Zap, 
  Battery, 
  Percent, 
  DollarSign, 
  Clock, 
  TrendingUp,
  MapPin,
  Building,
  AlertCircle,
  RefreshCw,
  Calendar,
  Search
} from 'lucide-react';

// Components
import StatsCard from './Cards/StatsCard';
import EnergyLineChart from './Charts/EnergyLineChart';
import EquipmentPieChart from './Charts/EquipmentPieChart';
import EquipmentTable from './Tables/EquipmentTable';

// Services & Utils
import { BenkonAPI } from '../services/api';
import { 
  processEnergyDataForChart,
  processEquipmentDataForPie,
  calculateStats,
  formatCurrency,
  formatEnergyValue,
  formatPercentage,
  validateDateRange,
  getDefaultDateRange
} from '../utils/dataProcessing';

// Types
import { 
  DashboardState, 
  FormData, 
  APIError,
  LocationData,
  Equipment,
  EnergyData,
  EquipmentEnergyData,
  ChartDataPoint,
  PieChartDataPoint,
  StatsData
} from '../types';

const Dashboard: React.FC = () => {
  // State management
  const [state, setState] = useState<DashboardState>({
    loading: false,
    error: null,
    locationData: null,
    equipmentData: [],
    energyData: null,
    equipmentEnergyData: null,
    stats: null
  });

  const [formData, setFormData] = useState<FormData>(() => {
    const { startDate, endDate } = getDefaultDateRange();
    return {
      orgId: '7411698114757914624',
      locId: '7407763056947015680',
      startDate,
      endDate
    };
  });

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [pieData, setPieData] = useState<PieChartDataPoint[]>([]);
  const [showPerM2, setShowPerM2] = useState(false);

  // Error handling
  const handleError = useCallback((error: APIError) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    const { valid, error: validationError } = validateDateRange(formData.startDate, formData.endDate);
    
    if (!valid) {
      handleError({ message: validationError || 'Invalid date range' });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch data in parallel
      const [locationData, equipmentData, energyData, equipmentEnergyData] = await Promise.all([
        BenkonAPI.getLocation(formData.orgId, formData.locId),
        BenkonAPI.getEquipment(formData.orgId, formData.locId),
        BenkonAPI.getLocationEnergy(formData.orgId, formData.locId, formData.startDate, formData.endDate),
        BenkonAPI.getAllEquipmentEnergy(formData.orgId, formData.locId, formData.startDate, formData.endDate)
      ]);

      // Process data
      const processedChartData = processEnergyDataForChart(energyData);
      const processedPieData = processEquipmentDataForPie(equipmentEnergyData);
      const stats = calculateStats(energyData);

      // Update state
      setState({
        loading: false,
        error: null,
        locationData,
        equipmentData,
        energyData,
        equipmentEnergyData,
        stats
      });

      setChartData(processedChartData);
      setPieData(processedPieData);

    } catch (error) {
      handleError(error as APIError);
    }
  }, [formData, handleError]);

  // Handle form submission
  const handleAnalyze = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    fetchAllData();
  }, [fetchAllData]);

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError();
  }, [clearError]);

  // Load initial data
  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🔌 Benkon Energy Dashboard
              </h1>
              <p className="text-gray-600">
                Real-time energy consumption analysis and monitoring
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization ID
                </label>
                <input
                  type="text"
                  value={formData.orgId}
                  onChange={(e) => handleInputChange('orgId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter organization ID"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location ID
                </label>
                <input
                  type="text"
                  value={formData.locId}
                  onChange={(e) => handleInputChange('locId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter location ID"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  disabled={state.loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {state.loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>{state.loading ? 'Analyzing...' : 'Analyze'}</span>
                </button>
                
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPerM2}
                    onChange={(e) => setShowPerM2(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Show per m² values</span>
                </label>
              </div>
              
              {state.error && (
                <button
                  type="button"
                  onClick={clearError}
                  className="text-red-600 hover:text-red-700 text-sm flex items-center space-x-1"
                >
                  <span>Clear Error</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700">{state.error.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Location Info */}
        {state.locationData && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {state.locationData.loc_name}
                  </h2>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {state.locationData.address}, {state.locationData.ward}, {state.locationData.district}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Area</p>
                <p className="text-lg font-semibold text-gray-900">
                  {state.locationData.area_in_m2.toLocaleString()} m²
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {state.stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total AC Energy"
              value={formatEnergyValue(state.stats.totalACEnergy)}
              icon={Zap}
              iconColor="text-blue-500"
              loading={state.loading}
            />
            <StatsCard
              title="Total Energy"
              value={formatEnergyValue(state.stats.totalEnergy)}
              icon={Battery}
              iconColor="text-green-500"
              loading={state.loading}
            />
            <StatsCard
              title="AC Percentage"
              value={formatPercentage(state.stats.acPercentage)}
              icon={Percent}
              iconColor="text-purple-500"
              loading={state.loading}
            />
            <StatsCard
              title="Estimated Cost"
              value={formatCurrency(state.stats.estimatedCost)}
              icon={DollarSign}
              iconColor="text-yellow-500"
              loading={state.loading}
            />
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <EnergyLineChart 
            data={chartData} 
            loading={state.loading}
            showPerM2={showPerM2}
          />
          <EquipmentPieChart 
            data={pieData} 
            loading={state.loading}
          />
        </div>

        {/* Equipment Table */}
        <EquipmentTable 
          equipment={state.equipmentData} 
          loading={state.loading}
        />

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Benkon Energy Dashboard • Real-time energy monitoring and analysis
          </p>
          <p className="mt-1">
            Data refreshed every hour • API response time: ~2s
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;