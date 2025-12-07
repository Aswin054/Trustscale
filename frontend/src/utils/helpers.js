/**
 * Format timestamp to readable date/time
 */
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Format date only
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format time only
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

/**
 * Format number with fixed decimals
 */
export const formatNumber = (number, decimals = 2) => {
  return parseFloat(number).toFixed(decimals);
};

/**
 * Get status color based on value
 */
export const getStatusColor = (status) => {
  const colors = {
    healthy: 'text-green-600',
    active: 'text-blue-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600',
    inactive: 'text-gray-600',
    tampered: 'text-red-600'
  };
  return colors[status] || colors.active;
};

/**
 * Get status background color
 */
export const getStatusBgColor = (status) => {
  const colors = {
    healthy: 'bg-green-100',
    active: 'bg-blue-100',
    warning: 'bg-yellow-100',
    critical: 'bg-red-100',
    inactive: 'bg-gray-100',
    tampered: 'bg-red-100'
  };
  return colors[status] || colors.active;
};

/**
 * Get severity color
 */
export const getSeverityColor = (severity) => {
  const colors = {
    low: 'text-blue-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600'
  };
  return colors[severity] || colors.low;
};

/**
 * Get severity background
 */
export const getSeverityBgColor = (severity) => {
  const colors = {
    low: 'bg-blue-100',
    medium: 'bg-yellow-100',
    high: 'bg-orange-100',
    critical: 'bg-red-100'
  };
  return colors[severity] || colors.low;
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if value is anomaly
 */
export const isAnomaly = (currentValue, historicalValues, threshold = 2) => {
  if (!historicalValues || historicalValues.length < 3) return false;
  
  const mean = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length;
  const variance = historicalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalValues.length;
  const stdDev = Math.sqrt(variance);
  
  const zScore = Math.abs((currentValue - mean) / stdDev);
  return zScore > threshold;
};

/**
 * Calculate average
 */
export const calculateAverage = (values) => {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

/**
 * Get device icon name
 */
export const getDeviceIcon = (deviceType) => {
  const icons = {
    weighing_scale: 'Gauge',
    energy_meter: 'Zap',
    fuel_dispenser: 'Fuel'
  };
  return icons[deviceType] || 'Activity';
};

/**
 * Get device display name
 */
export const getDeviceName = (deviceType) => {
  const names = {
    weighing_scale: 'Weighing Scale',
    energy_meter: 'Energy Meter',
    fuel_dispenser: 'Fuel Dispenser'
  };
  return names[deviceType] || deviceType;
};

/**
 * Download data as JSON
 */
export const downloadJSON = (data, filename = 'data.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Download data as CSV
 */
export const downloadCSV = (data, filename = 'data.csv') => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Format bytes to human readable
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
