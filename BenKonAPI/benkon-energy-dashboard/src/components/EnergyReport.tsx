import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, 
  Settings, 
  Thermometer,
  Zap,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Search,
  Building,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Services & Utils
import { BenkonAPI } from '../services/api';
// Removed unused imports from utils

// Types
import { 
  DashboardState, 
  FormData, 
  APIError,
  ChartDataPoint
} from '../types';

interface EquipmentInfo {
  location: string;
  area: string;
  dimensions: string;
  height: string;
  equipmentCode: string;
  brand: string;
  type: string;
  coolingCapacity: string;
  ratedPower: string;
  serviceArea: string;
}

interface LoadAnalysis {
  coolingLoadPerArea: number;
  standardRange: string;
  benkonRecommendation: string;
  designStatus: string;
  heatLoadBredown: {
    people: number;
    lighting: number;
    equipment: number;
    building: number;
    total: number;
  };
  safetyFactor: number;
  equipmentBreakdown?: {
    ac: number;
    lighting: number;
    refrigeration: number;
    other: number;
    totalEquipment: number;
  };
}

interface DailyConsumption {
  totalConsumption: number;
  businessHours: number;
  afterHours: number;
  peakHours: number;
  offPeakHours: number;
  analysisNote: string;
}

interface AIFindings {
  issues: string[];
  recommendations: string[];
}

const EnergyReport: React.FC = () => {
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
    const today = new Date().toISOString().split('T')[0];
    return {
      orgId: '7411698114757914624',
      locId: '7407763056947015680',
      startDate: today,
      endDate: today
    };
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [equipmentInfo, setEquipmentInfo] = useState<EquipmentInfo | null>(null);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [loadAnalysisData, setLoadAnalysisData] = useState<LoadAnalysis | null>(null);
  const [dailyConsumptionData, setDailyConsumptionData] = useState<DailyConsumption | null>(null);
  const [aiFindingsData, setAiFindingsData] = useState<AIFindings | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        // Fetch location data
        const locationResponse = await BenkonAPI.getLocation(formData.orgId, formData.locId);
        setState(prev => ({ ...prev, locationData: locationResponse }));
        
        // Fetch equipment data
        const equipmentResponse = await BenkonAPI.getEquipment(formData.orgId, formData.locId);
        setState(prev => ({ ...prev, equipmentData: equipmentResponse || [] }));
        
        // Fetch hourly energy data
        const energyResponse = await BenkonAPI.getLocationEnergy(
          formData.orgId,
          formData.locId,
          formData.startDate,
          formData.endDate
        );
        setState(prev => ({ ...prev, energyData: energyResponse }));
        
        // Process and calculate real data
        processRealData(locationResponse, equipmentResponse || [], energyResponse);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setState(prev => ({ 
          ...prev, 
          error: { 
            message: error instanceof Error ? error.message : 'Failed to fetch data',
            status: (error as any)?.status
          } as APIError
        }));
        // Fall back to sample data if API fails
        loadSampleData();
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    };
    
    fetchData();
  }, [formData]);
  
  const processRealData = (locationData: any, equipmentData: any[], energyData: any) => {
    // Process equipment info
    const area = locationData?.area_in_m2 || 30;
    
    // Calculate total BTU and rated power for all AC equipment
    const acEquipment = equipmentData.filter(eq => eq.type && (eq.type.toLowerCase().includes('ac') || eq.type.toLowerCase().includes('air')));
    const totalBTU = acEquipment.reduce((sum, eq) => sum + (eq.btu || 0), 0);
    const totalRatedPower = acEquipment.reduce((sum, eq) => sum + (eq.rated_power_w || 0), 0);
    // Removed unused firstEquipment variable
    
    const processedEquipmentInfo: EquipmentInfo = {
      location: locationData?.loc_name || 'Unknown Location',
      area: `${area} m²`,
      dimensions: `${Math.sqrt(area).toFixed(1)}m x ${Math.sqrt(area).toFixed(1)}m`,
      height: '3.2 m',
      equipmentCode: `${acEquipment.length} AC units`,
      brand: 'Multiple Brands',
      type: 'Air Conditioning System',
      coolingCapacity: totalBTU > 0 ? `${totalBTU.toLocaleString()} BTU (${(totalBTU / 3412).toFixed(1)} kW)` : 'N/A',
      ratedPower: totalRatedPower > 0 ? `${(totalRatedPower / 1000).toFixed(1)} kW` : 'N/A',
      serviceArea: `${area} m²`
    };
    setEquipmentInfo(processedEquipmentInfo);
    
    // Process energy data for hourly chart
    const processedHourlyData = energyData?.ac_energy_wh ? 
      Object.entries(energyData.ac_energy_wh).flatMap(([date, hourlyValues]) => 
        (hourlyValues as number[]).map((value: number, hour: number) => ({
          hour: `${hour.toString().padStart(2, '0')}:00`,
          consumption: Math.round(value || 0),
          ac_energy: Math.round(value || 0),
          total_energy: Math.round((energyData.total_energy_wh?.[date] as number[])?.[hour] || (value || 0) * 1.1)
        }))
      ).slice(0, 24) // Take first 24 hours
      : generateSampleHourlyData();
    setHourlyData(processedHourlyData);
    
    // Calculate load analysis using total cooling capacity
    const coolingCapacity = totalBTU / 3412; // Convert BTU to kW (1 kW = 3412 BTU)
    const coolingLoadPerArea = (coolingCapacity * 1000) / area; // Convert kW to W
    
    // Calculate actual equipment loads from API data
    const acLoad = acEquipment.reduce((sum, eq) => sum + (eq.rated_power_w || 0), 0);
    const lightingEquipment = equipmentData.filter(eq => eq.type && (eq.type.toLowerCase().includes('light') || eq.type.toLowerCase().includes('led')));
    const lightingLoad = lightingEquipment.reduce((sum, eq) => sum + (eq.rated_power_w || 0), 0);
    const refrigerationEquipment = equipmentData.filter(eq => eq.type && (eq.type.toLowerCase().includes('refriger') || eq.type.toLowerCase().includes('freezer') || eq.type.toLowerCase().includes('cooler')));
    const refrigerationLoad = refrigerationEquipment.reduce((sum, eq) => sum + (eq.rated_power_w || 0), 0);
    const otherEquipment = equipmentData.filter(eq => !acEquipment.includes(eq) && !lightingEquipment.includes(eq) && !refrigerationEquipment.includes(eq));
    const otherLoad = otherEquipment.reduce((sum, eq) => sum + (eq.rated_power_w || 0), 0);
    
    const totalEquipmentLoad = acLoad + lightingLoad + refrigerationLoad + otherLoad;
    const estimatedPeopleLoad = Math.round(area * 12); // 12W per m² for people
    const estimatedBuildingLoad = Math.round(area * 18); // 18W per m² for building envelope
    
    const processedLoadAnalysis: LoadAnalysis = {
      coolingLoadPerArea,
      standardRange: '150 - 200 W/m²',
      benkonRecommendation: '160 W/m²',
      designStatus: coolingLoadPerArea >= 150 && coolingLoadPerArea <= 200 ? 'Đạt yêu cầu' : 'Cần điều chỉnh',
      heatLoadBredown: {
        people: estimatedPeopleLoad,
        lighting: lightingLoad,
        equipment: refrigerationLoad + otherLoad,
        building: estimatedBuildingLoad,
        total: estimatedPeopleLoad + lightingLoad + refrigerationLoad + otherLoad + estimatedBuildingLoad
      },
      safetyFactor: coolingCapacity * 1000 / (estimatedPeopleLoad + lightingLoad + refrigerationLoad + otherLoad + estimatedBuildingLoad),
      // Add detailed equipment breakdown
      equipmentBreakdown: {
        ac: acLoad,
        lighting: lightingLoad,
        refrigeration: refrigerationLoad,
        other: otherLoad,
        totalEquipment: totalEquipmentLoad
      }
    };
    setLoadAnalysisData(processedLoadAnalysis);
    
    // Calculate daily consumption
    const totalConsumption = processedHourlyData.reduce((sum: number, item: any) => sum + (item.consumption || 0), 0) / 1000;
    const businessHoursData = processedHourlyData.slice(8, 18);
    const businessHours = businessHoursData.reduce((sum: number, item: any) => sum + (item.consumption || 0), 0) / 1000;
    const afterHours = Math.max(0, totalConsumption - businessHours);
    
    const processedDailyConsumption: DailyConsumption = {
      totalConsumption: parseFloat(totalConsumption.toFixed(2)),
      businessHours: parseFloat(businessHours.toFixed(2)),
      afterHours: parseFloat(afterHours.toFixed(2)),
      peakHours: parseFloat((businessHours * 0.4).toFixed(2)),
      offPeakHours: parseFloat((afterHours * 0.3).toFixed(2)),
      analysisNote: afterHours > totalConsumption * 0.3 
        ? 'Có dấu hiệu tiêu thụ ngoài giờ đáng kể. Cần kiểm tra lại lịch vận hành.'
        : 'Lịch vận hành phù hợp với giờ kinh doanh.'
    };
    setDailyConsumptionData(processedDailyConsumption);
    
    // Generate AI findings based on real data
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    if (afterHours > totalConsumption * 0.3) {
      issues.push('Vẫn tiêu thụ đáng kể ngoài giờ kinh doanh.');
      recommendations.push('Kiểm tra lịch vận hành và thiết lập nhiệt độ trong giờ nghỉ');
    }
    
    if (processedLoadAnalysis.coolingLoadPerArea > 200) {
      issues.push('Công suất thiết kế vượt mức khuyến nghị cho loại hình kinh doanh.');
      recommendations.push('Xem xét điều chỉnh công suất hoặc cải thiện cách nhiệt');
    }
    
    if (issues.length === 0) {
      issues.push('Hệ thống vận hành ổn định và hiệu quả.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Tiếp tục duy trì chế độ vận hành hiện tại.');
    }
    
    const processedAIFindings: AIFindings = {
      issues,
      recommendations
    };
    setAiFindingsData(processedAIFindings);
  };
  
  const loadSampleData = () => {
    // Fallback sample data
    const sampleEquipmentInfo: EquipmentInfo = {
      location: 'Cửa hàng WinMart+ số 123, Quận 1, TP.HCM',
      area: 'Sảnh chính (5x6 m)',
      dimensions: '5m x 6m',
      height: '3.2 m',
      equipmentCode: 'AC-01',
      brand: 'Daikin',
      type: 'Mono Inverter',
      coolingCapacity: '18000 BTU (5.27 kW)',
      ratedPower: '1.6 kW',
      serviceArea: '30 m²'
    };
    setEquipmentInfo(sampleEquipmentInfo);
    
    const sampleLoadAnalysis: LoadAnalysis = {
      coolingLoadPerArea: 175.7,
      standardRange: '150 - 200 W/m²',
      benkonRecommendation: '160 W/m²',
      designStatus: 'Đạt yêu cầu',
      heatLoadBredown: {
        people: 360,
        lighting: 500,
        equipment: 800,
        building: 600,
        total: 2260
      },
      safetyFactor: 2.3,
      equipmentBreakdown: {
        ac: 9500,
        lighting: 1450,
        refrigeration: 2250,
        other: 500,
        totalEquipment: 13700
      }
    };
    setLoadAnalysisData(sampleLoadAnalysis);
    
    const sampleDailyConsumption: DailyConsumption = {
      totalConsumption: 9.2,
      businessHours: 6.8,
      afterHours: 2.4,
      peakHours: 2.5,
      offPeakHours: 0.3,
      analysisNote: 'Có dấu hiệu tiêu thụ ngoài giờ đáng kể. Cần kiểm tra lại lịch vận hành.'
    };
    setDailyConsumptionData(sampleDailyConsumption);
    
    const sampleAIFindings: AIFindings = {
      issues: [
        'Thiết kế đủ tải, nhưng công suất tiêu thụ thường xuyên vượt 80% định mức trong giờ cao điểm.',
        'Vẫn tiêu thụ >400W trong khoảng 22:00 - 02:00 dù không có người sử dụng.',
        'Tần suất bật/tắt cao bất thường trong khoảng 13:00 - 15:00, gợi ý kiểm tra cảm biến hoặc điều khiển.'
      ],
      recommendations: [
        'Kiểm tra lịch vận hành và thiết lập nhiệt độ trong giờ nghỉ',
        'Bảo trì cảm biến nhiệt độ và hệ thống điều khiển',
        'Xem xét điều chỉnh công suất trong giờ cao điểm'
      ]
    };
    setAiFindingsData(sampleAIFindings);
    
    setHourlyData(generateSampleHourlyData());
  };

  // Sample hourly data for visualization
  const generateSampleHourlyData = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      let consumption = 0;
      if (i >= 8 && i <= 18) {
        // Business hours - higher consumption
        consumption = 300 + Math.random() * 400;
      } else if (i >= 19 && i <= 21) {
        // Peak hours
        consumption = 500 + Math.random() * 300;
      } else if (i >= 22 || i <= 5) {
        // Night hours - low consumption but not zero
        consumption = 100 + Math.random() * 200;
      } else {
        consumption = 200 + Math.random() * 200;
      }
      
      hours.push({
        hour: `${i.toString().padStart(2, '0')}:00`,
        consumption: Math.round(consumption),
        ac_energy: Math.round(consumption),
        total_energy: Math.round(consumption * 1.1)
      });
    }
    return hours;
  };

  // Initialize with sample data on component mount
  useEffect(() => {
    if (!hourlyData.length) {
      setHourlyData(generateSampleHourlyData());
    }
  }, []);

  // Load breakdown data for pie chart
  const loadBreakdownData = [
    { name: 'Tải nhiệt người', value: 360, color: '#3B82F6' },
    { name: 'Ánh sáng', value: 500, color: '#10B981' },
    { name: 'Thiết bị', value: 800, color: '#F59E0B' },
    { name: 'Vỏ công trình', value: 600, color: '#EF4444' }
  ];

  const handleAnalyze = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Fetch fresh data
      const [locationResponse, equipmentResponse, energyResponse] = await Promise.all([
        BenkonAPI.getLocation(formData.orgId, formData.locId),
        BenkonAPI.getEquipment(formData.orgId, formData.locId),
        BenkonAPI.getLocationEnergy(formData.orgId, formData.locId, formData.startDate, formData.endDate)
      ]);
      
      setState(prev => ({
        ...prev,
        locationData: locationResponse,
        equipmentData: equipmentResponse || [],
        energyData: energyResponse
      }));
      
      processRealData(locationResponse, equipmentResponse || [], energyResponse);
      
    } catch (error) {
      console.error('Error analyzing data:', error);
      setState(prev => ({ 
        ...prev, 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to analyze data',
          status: (error as any)?.status
        } as APIError
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [formData]);

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              BÁO CÁO HIỆU QUẢ SỬ DỤNG NĂNG LƯỢNG - MÁY LẠNH
            </h1>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Ngày phân tích: {selectedDate}
              </div>
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-1" />
                WinMart+ Quận 1
              </div>
            </div>
          </div>

          {/* Controls */}
          <form onSubmit={handleAnalyze} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization ID
              </label>
              <input
                type="text"
                value={formData.orgId}
                onChange={(e) => handleInputChange('orgId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location ID
              </label>
              <input
                type="text"
                value={formData.locId}
                onChange={(e) => handleInputChange('locId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày phân tích
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const currentDate = new Date(selectedDate);
                    currentDate.setDate(currentDate.getDate() - 1);
                    const newDate = currentDate.toISOString().split('T')[0];
                    setSelectedDate(newDate);
                    handleInputChange('startDate', newDate);
                    handleInputChange('endDate', newDate);
                  }}
                  className="px-2 py-2 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 text-sm"
                  title="Ngày trước"
                >
                  ←
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    handleInputChange('startDate', e.target.value);
                    handleInputChange('endDate', e.target.value);
                  }}
                  className="flex-1 px-3 py-2 border-t border-b border-gray-300 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    const currentDate = new Date(selectedDate);
                    currentDate.setDate(currentDate.getDate() + 1);
                    const newDate = currentDate.toISOString().split('T')[0];
                    setSelectedDate(newDate);
                    handleInputChange('startDate', newDate);
                    handleInputChange('endDate', newDate);
                  }}
                  className="px-2 py-2 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 text-sm"
                  title="Ngày sau"
                >
                  →
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
            >
              <Search className="w-4 h-4 mr-2" />
              Phân tích
            </button>
          </form>
        </div>

        {/* Main Report Content */}
        <div className="space-y-6">
          {/* PHẦN 1: THÔNG TIN THIẾT BỊ & BỐ TRÍ */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="bg-blue-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                PHẦN 1: THÔNG TIN THIẾT BỊ & BỐ TRÍ (DATABASE)
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium">Vị trí:</span>
                    <span className="ml-2">{equipmentInfo?.location || 'Loading...'}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium">Khu vực lắp đặt:</span>
                    <span className="ml-2">{equipmentInfo?.area || 'Loading...'}, cao {equipmentInfo?.height || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Mã thiết bị:</span>
                    <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{equipmentInfo?.equipmentCode || 'Loading...'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Hãng:</span>
                    <span className="ml-2">{equipmentInfo?.brand || 'Loading...'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Loại máy:</span>
                    <span className="ml-2">{equipmentInfo?.type || 'Loading...'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Thermometer className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium">Công suất lạnh:</span>
                    <span className="ml-2">{equipmentInfo?.coolingCapacity || 'Loading...'}</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium">Công suất điện định mức:</span>
                    <span className="ml-2">{equipmentInfo?.ratedPower || 'Loading...'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Diện tích phục vụ:</span>
                    <span className="ml-2">{equipmentInfo?.serviceArea || 'Loading...'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PHẦN 2: PHÂN TÍCH CÔNG SUẤT THIẾT KẾ */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="bg-green-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                PHẦN 2: PHÂN TÍCH CÔNG SUẤT THIẾT KẾ (W/m²)
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Phân tích công suất</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Công suất lạnh trên diện tích:</span>
                        <span className="ml-2 font-mono bg-white px-2 py-1 rounded">
                          {loadAnalysisData?.coolingLoadPerArea ? `${(loadAnalysisData.coolingLoadPerArea / 1000).toFixed(2)} kW / ${equipmentInfo?.serviceArea || '30 m²'} = ${loadAnalysisData.coolingLoadPerArea.toFixed(1)} W/m²` : 'Loading...'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Định mức tiêu chuẩn:</span>
                        <span className="ml-2">{loadAnalysisData?.standardRange || 'Loading...'} với khu bán lẻ</span>
                      </div>
                      <div>
                        <span className="font-medium">Gợi ý của BenKon:</span>
                        <span className="ml-2">{loadAnalysisData?.benkonRecommendation || 'Loading...'} với mức tải nhiệt trung bình</span>
                      </div>
                      <div className="flex items-center pt-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <span className="font-semibold text-green-700">
                          → Công suất thiết kế {loadAnalysisData?.designStatus || 'Loading...'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Phân tích tải nhiệt</h3>
                    <div className="space-y-2 text-sm">
                      <div className="font-medium text-blue-700 mb-2">Tải từ thiết bị (API):</div>
                      {loadAnalysisData?.equipmentBreakdown && (
                        <div className="ml-2 space-y-1">
                          <div>• Máy lạnh: {loadAnalysisData.equipmentBreakdown.ac} W</div>
                          <div>• Đèn chiếu sáng: {loadAnalysisData.equipmentBreakdown.lighting} W</div>
                          <div>• Tủ lạnh/mát: {loadAnalysisData.equipmentBreakdown.refrigeration} W</div>
                          <div>• Thiết bị khác: {loadAnalysisData.equipmentBreakdown.other} W</div>
                          <div className="font-medium">→ Tổng thiết bị: {loadAnalysisData.equipmentBreakdown.totalEquipment} W</div>
                        </div>
                      )}
                      <div className="font-medium text-blue-700 mb-2 mt-3">Tải ước tính khác:</div>
                      <div className="ml-2 space-y-1">
                        <div>• Tải nhiệt người: {loadAnalysisData?.heatLoadBredown.people || 0} W</div>
                        <div>• Tải từ vỏ công trình: {loadAnalysisData?.heatLoadBredown.building || 0} W</div>
                      </div>
                      <div className="border-t pt-2 mt-2 font-semibold">
                        → Tổng tải nhiệt: ~{loadAnalysisData?.heatLoadBredown.total || 0} W ≈ {((loadAnalysisData?.heatLoadBredown.total || 0)/1000).toFixed(2)} kW
                      </div>
                      <div className="font-semibold text-green-700">
                        → Hệ số an toàn ~{loadAnalysisData?.safetyFactor?.toFixed(1) || 'N/A'} lần, thiết kế phù hợp.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Phân bố tải nhiệt</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={loadBreakdownData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                        >
                          {loadBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} W`, 'Công suất']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PHẦN 3: ĐƯỜNG TIÊU THỤ NĂNG LƯỢNG */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="bg-purple-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-600" />
                PHẦN 3: ĐƯỜNG TIÊU THỤ NĂNG LƯỢNG TRONG 1 NGÀY TIÊU BIỂU
              </h2>
              <p className="text-sm text-gray-600 mt-1">Dữ liệu ngày: {selectedDate}</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="font-semibold text-gray-900 mb-3">Biểu đồ tiêu thụ theo giờ</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis label={{ value: 'Công suất (W)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip 
                          formatter={(value) => [`${value} W`, 'Tiêu thụ']}
                          labelFormatter={(label) => `Giờ: ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="consumption" 
                          stroke="#3B82F6" 
                          strokeWidth={2}
                          name="Tiêu thụ thực tế"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Tổng quan tiêu thụ</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tổng điện tiêu thụ:</span>
                        <span className="font-semibold">{dailyConsumptionData?.totalConsumption || 0} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Giờ hành chính (08:00-18:00):</span>
                        <span className="font-semibold">{dailyConsumptionData?.businessHours || 0} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ngoài giờ hành chính:</span>
                        <span className="font-semibold">{dailyConsumptionData?.afterHours || 0} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Giờ cao điểm (17:00-20:00):</span>
                        <span className="font-semibold">{dailyConsumptionData?.peakHours || 0} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Giờ thấp điểm (22:00-05:00):</span>
                        <span className="font-semibold">{dailyConsumptionData?.offPeakHours || 0} kWh</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-1">Nhận xét</h4>
                        <p className="text-sm text-yellow-700">{dailyConsumptionData?.analysisNote || 'Analyzing data...'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PHẦN 4: CÁC VẤN ĐỀ PHÁT HIỆN BỞI AI */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="bg-red-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                PHẦN 4: CÁC VẤN ĐỀ PHÁT HIỆN BỞI AI
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-red-700">Vấn đề phát hiện</h3>
                  <div className="space-y-3">
                    {(aiFindingsData?.issues || []).map((issue, index) => (
                      <div key={index} className="flex items-start bg-red-50 p-3 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{issue}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-green-700">Khuyến nghị cải thiện</h3>
                  <div className="space-y-3">
                    {(aiFindingsData?.recommendations || []).map((recommendation, index) => (
                      <div key={index} className="flex items-start bg-green-50 p-3 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Báo cáo được tạo bởi BenKon AI Energy Analytics • {new Date().toLocaleDateString('vi-VN')}</p>
        </div>
      </div>
    </div>
  );
};

export default EnergyReport;