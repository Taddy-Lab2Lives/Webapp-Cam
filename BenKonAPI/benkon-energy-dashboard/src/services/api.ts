import axios, { AxiosResponse } from 'axios';
import { 
  LocationData, 
  Equipment, 
  EnergyData, 
  EquipmentEnergyData,
  APIError 
} from '../types';

const BASE_URL = 'https://data-analytics-868579264401.us-central1.run.app';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const apiError: APIError = {
      message: error.response?.data?.error || error.message || 'An unexpected error occurred',
      status: error.response?.status
    };
    
    // Handle specific error cases
    if (error.response?.status === 400) {
      if (error.response.data?.error?.includes('Date range cannot exceed 30 days')) {
        apiError.message = 'Date range cannot exceed 30 days';
      } else if (error.response.data?.error?.includes('startDate must be in format YYYY-MM-DD')) {
        apiError.message = 'Invalid date format. Please use YYYY-MM-DD';
      } else if (error.response.data?.error?.includes('startDate must be less than or equal to endDate')) {
        apiError.message = 'Start date must be less than or equal to end date';
      }
    } else if (error.response?.status === 404) {
      apiError.message = 'Data not found for the specified parameters';
    } else if (error.response?.status >= 500) {
      apiError.message = 'Server error. Please try again later';
    } else if (error.code === 'ECONNABORTED') {
      apiError.message = 'Request timeout. Please check your connection and try again';
    }
    
    return Promise.reject(apiError);
  }
);

export class BenkonAPI {
  /**
   * Get location details by organization and location ID
   */
  static async getLocation(orgId: string, locId: string): Promise<LocationData> {
    try {
      const response = await apiClient.get<LocationData>(`/orgs/${orgId}/locations/${locId}`);
      
      if (response.data === null) {
        throw {
          message: 'Location not found',
          status: 404
        } as APIError;
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get list of equipment for a specific location
   */
  static async getEquipment(orgId: string, locId: string): Promise<Equipment[]> {
    try {
      const response = await apiClient.get<Equipment[]>(`/orgs/${orgId}/locations/${locId}/equips`);
      return response.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get hourly energy data for a location within a date range
   */
  static async getLocationEnergy(
    orgId: string, 
    locId: string, 
    startDate: string, 
    endDate: string
  ): Promise<EnergyData> {
    try {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        throw {
          message: 'Invalid date format. Please use YYYY-MM-DD',
          status: 400
        } as APIError;
      }

      // Validate date range (max 30 days)
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 30) {
        throw {
          message: 'Date range cannot exceed 30 days',
          status: 400
        } as APIError;
      }

      if (start > end) {
        throw {
          message: 'Start date must be less than or equal to end date',
          status: 400
        } as APIError;
      }

      const response = await apiClient.get<EnergyData>(
        `/orgs/${orgId}/locations/${locId}/data/hourlyEnergy`,
        {
          params: { startDate, endDate }
        }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get hourly energy data for specific equipment
   */
  static async getEquipmentEnergy(
    orgId: string, 
    locId: string, 
    equipId: string,
    startDate: string, 
    endDate: string
  ): Promise<{ energy_wh: Record<string, number[]> }> {
    try {
      const response = await apiClient.get<{ energy_wh: Record<string, number[]> }>(
        `/orgs/${orgId}/locations/${locId}/equips/${equipId}/data/hourlyEnergy`,
        {
          params: { startDate, endDate }
        }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get hourly energy data for all equipment in a location
   */
  static async getAllEquipmentEnergy(
    orgId: string, 
    locId: string, 
    startDate: string, 
    endDate: string
  ): Promise<EquipmentEnergyData> {
    try {
      const response = await apiClient.get<EquipmentEnergyData>(
        `/orgs/${orgId}/locations/${locId}/equipsData/hourlyEnergy`,
        {
          params: { startDate, endDate }
        }
      );
      
      return response.data || {};
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all locations for an organization
   */
  static async getAllLocations(orgId: string): Promise<LocationData[]> {
    try {
      const response = await apiClient.get<LocationData[]>(`/orgs/${orgId}/locations`);
      return response.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get API documentation
   */
  static async getApiDocs(): Promise<any> {
    try {
      const response = await apiClient.get('/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default BenkonAPI;