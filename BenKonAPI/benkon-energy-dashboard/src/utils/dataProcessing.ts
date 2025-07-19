import { 
  EnergyData, 
  EquipmentEnergyData, 
  ChartDataPoint, 
  PieChartDataPoint, 
  StatsData,
  ENERGY_COST_PER_KWH,
  CHART_COLORS
} from '../types';

/**
 * Process energy data for line chart visualization
 * Combines hourly data across all dates and calculates averages
 */
export function processEnergyDataForChart(energyData: EnergyData): ChartDataPoint[] {
  const chartData: ChartDataPoint[] = [];
  
  // Initialize 24-hour data structure
  for (let hour = 0; hour < 24; hour++) {
    chartData.push({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      ac_energy: 0,
      total_energy: 0,
      ac_energy_per_m2: 0,
      total_energy_per_m2: 0,
    });
  }

  // Get all dates from the data
  const dates = Object.keys(energyData.ac_energy_wh || {});
  
  if (dates.length === 0) return chartData;

  // Sum up values for each hour across all dates
  dates.forEach(date => {
    if (energyData.ac_energy_wh[date]) {
      energyData.ac_energy_wh[date].forEach((value, hourIndex) => {
        if (hourIndex < 24) {
          chartData[hourIndex].ac_energy += value;
        }
      });
    }
    
    if (energyData.total_energy_wh[date]) {
      energyData.total_energy_wh[date].forEach((value, hourIndex) => {
        if (hourIndex < 24) {
          chartData[hourIndex].total_energy += value;
        }
      });
    }
    
    if (energyData.ac_energy_wh_per_m2[date]) {
      energyData.ac_energy_wh_per_m2[date].forEach((value, hourIndex) => {
        if (hourIndex < 24) {
          chartData[hourIndex].ac_energy_per_m2 += value;
        }
      });
    }
    
    if (energyData.total_energy_wh_per_m2[date]) {
      energyData.total_energy_wh_per_m2[date].forEach((value, hourIndex) => {
        if (hourIndex < 24) {
          chartData[hourIndex].total_energy_per_m2 += value;
        }
      });
    }
  });

  // Calculate averages
  const numDays = dates.length;
  chartData.forEach(dataPoint => {
    dataPoint.ac_energy = Math.round(dataPoint.ac_energy / numDays);
    dataPoint.total_energy = Math.round(dataPoint.total_energy / numDays);
    dataPoint.ac_energy_per_m2 = Math.round((dataPoint.ac_energy_per_m2 / numDays) * 100) / 100;
    dataPoint.total_energy_per_m2 = Math.round((dataPoint.total_energy_per_m2 / numDays) * 100) / 100;
  });

  return chartData;
}

/**
 * Process equipment energy data for pie chart visualization
 */
export function processEquipmentDataForPie(equipmentEnergyData: EquipmentEnergyData): PieChartDataPoint[] {
  const equipmentTotals: { [key: string]: { name: string; total: number } } = {};
  
  // Calculate total energy consumption for each equipment
  Object.entries(equipmentEnergyData).forEach(([equipId, data]) => {
    let totalEnergy = 0;
    
    Object.values(data.energy_wh).forEach(hourlyData => {
      totalEnergy += hourlyData.reduce((sum, value) => sum + value, 0);
    });
    
    equipmentTotals[equipId] = {
      name: data.equip_name,
      total: totalEnergy
    };
  });

  // Convert to pie chart format
  const totalSum = Object.values(equipmentTotals).reduce((sum, eq) => sum + eq.total, 0);
  
  if (totalSum === 0) return [];

  const colors = [
    CHART_COLORS.primary,
    CHART_COLORS.secondary,
    CHART_COLORS.success,
    CHART_COLORS.warning,
    CHART_COLORS.error,
    '#8B5CF6', // purple
    '#F97316', // orange
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#EC4899', // pink
  ];

  const pieData: PieChartDataPoint[] = Object.entries(equipmentTotals)
    .map(([equipId, data], index) => ({
      name: data.name || equipId,
      value: Math.round(data.total),
      color: colors[index % colors.length],
      percentage: Math.round((data.total / totalSum) * 100 * 100) / 100
    }))
    .sort((a, b) => b.value - a.value); // Sort by value descending

  return pieData;
}

/**
 * Calculate comprehensive statistics from energy data
 */
export function calculateStats(energyData: EnergyData): StatsData {
  let totalACEnergy = 0;
  let totalEnergy = 0;
  let maxHourlyConsumption = 0;
  let peakHour = '00:00';
  let totalHours = 0;

  // Process all dates
  Object.entries(energyData.ac_energy_wh || {}).forEach(([date, hourlyData]) => {
    hourlyData.forEach((value, hour) => {
      totalACEnergy += value;
      totalHours++;
      
      if (value > maxHourlyConsumption) {
        maxHourlyConsumption = value;
        peakHour = `${hour.toString().padStart(2, '0')}:00`;
      }
    });
  });

  Object.entries(energyData.total_energy_wh || {}).forEach(([date, hourlyData]) => {
    hourlyData.forEach((value) => {
      totalEnergy += value;
    });
  });

  // Calculate derived metrics
  const acPercentage = totalEnergy > 0 ? (totalACEnergy / totalEnergy) * 100 : 0;
  const estimatedCost = (totalEnergy / 1000) * ENERGY_COST_PER_KWH; // Convert Wh to kWh
  const avgHourlyConsumption = totalHours > 0 ? totalEnergy / totalHours : 0;

  return {
    totalACEnergy: Math.round(totalACEnergy),
    totalEnergy: Math.round(totalEnergy),
    acPercentage: Math.round(acPercentage * 100) / 100,
    estimatedCost: Math.round(estimatedCost),
    peakHour,
    avgHourlyConsumption: Math.round(avgHourlyConsumption * 100) / 100
  };
}

/**
 * Format energy values for display
 */
export function formatEnergyValue(value: number, unit: string = 'Wh'): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)} M${unit}`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} k${unit}`;
  }
  return `${value.toFixed(0)} ${unit}`;
}

/**
 * Format currency values for display (VND)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format percentage values for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Validate date range for API calls
 */
export function validateDateRange(startDate: string, endDate: string): { valid: boolean; error?: string } {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return { valid: false, error: 'Invalid date format. Please use YYYY-MM-DD' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid date values' };
  }

  if (start > end) {
    return { valid: false, error: 'Start date must be less than or equal to end date' };
  }

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 30) {
    return { valid: false, error: 'Date range cannot exceed 30 days' };
  }

  return { valid: true };
}

/**
 * Generate default date range (last 7 days)
 */
export function getDefaultDateRange(): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6); // 7 days including today
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}