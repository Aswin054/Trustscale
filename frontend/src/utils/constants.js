// Use environment variable for API URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const DEVICE_TYPES = {
  WEIGHING_SCALE: 'weighing_scale',
  ENERGY_METER: 'energy_meter',
  FUEL_DISPENSER: 'fuel_dispenser'
};

export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const CHART_COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  secondary: '#8B5CF6',
  info: '#06B6D4'
};

export const REFRESH_INTERVAL = 5000; // 5 seconds
