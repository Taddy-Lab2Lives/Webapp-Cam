export interface LocationData {
  org_id: string;
  loc_id: string;
  loc_name: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  area_in_m2: number;
  gps_long: string;
  gps_lat: string;
  total_btu: number;
  btu_per_m2: number;
  rated_btu_per_m2: number;
  rated_energy_wh_per_m2_per_day: number;
}

export interface Equipment {
  org_id: string;
  loc_id: string;
  equip_id: string;
  equip_name: string;
  type: string;
  btu: number;
  rated_power_w: number;
}

export interface EnergyData {
  ac_energy_wh: Record<string, number[]>;
  total_energy_wh: Record<string, number[]>;
  ac_energy_wh_per_m2: Record<string, number[]>;
  total_energy_wh_per_m2: Record<string, number[]>;
}

export interface EquipmentEnergyData {
  [equipId: string]: {
    equip_name: string;
    energy_wh: Record<string, number[]>;
  };
}

export interface ChartDataPoint {
  hour: string;
  ac_energy: number;
  total_energy: number;
  ac_energy_per_m2: number;
  total_energy_per_m2: number;
}

export interface PieChartDataPoint {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface StatsData {
  totalACEnergy: number;
  totalEnergy: number;
  acPercentage: number;
  estimatedCost: number;
  peakHour: string;
  avgHourlyConsumption: number;
}

export interface APIError {
  message: string;
  status?: number;
}

export interface DashboardState {
  loading: boolean;
  error: APIError | null;
  locationData: LocationData | null;
  equipmentData: Equipment[];
  energyData: EnergyData | null;
  equipmentEnergyData: EquipmentEnergyData | null;
  stats: StatsData | null;
}

export interface FormData {
  orgId: string;
  locId: string;
  startDate: string;
  endDate: string;
}

export type MetricType = 'ac_energy_wh' | 'total_energy_wh' | 'ac_energy_wh_per_m2' | 'total_energy_wh_per_m2';

export interface ChartColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
}

export const CHART_COLORS: ChartColors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444'
};

export const ENERGY_COST_PER_KWH = 3000; // VND per kWh