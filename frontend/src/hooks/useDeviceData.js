import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { DataSimulator } from '../services/dataSimulator';

/**
 * Custom hook to fetch and manage device data
 * Can work with both real API and simulated data
 */
export const useDeviceData = (deviceType, deviceId, useSimulated = true) => {
  const [data, setData] = useState([]);
  const [currentReading, setCurrentReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    average: 0,
    min: 0,
    max: 0,
    anomalyCount: 0
  });

  // Generate simulated data
  const generateSimulatedData = useCallback((count = 50) => {
    let newData = [];
    
    switch (deviceType) {
      case 'weighing_scale':
        newData = DataSimulator.generateWeighingScaleData(count);
        break;
      case 'energy_meter':
        newData = DataSimulator.generateEnergyMeterData(count);
        break;
      case 'fuel_dispenser':
        newData = DataSimulator.generateFuelDispenserData(count);
        break;
      default:
        newData = [];
    }
    
    return newData;
  }, [deviceType]);

  // Fetch real data from API
  const fetchRealData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/${deviceType}/readings/${deviceId}`);
      setData(response.data.readings || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching device data:', err);
    } finally {
      setLoading(false);
    }
  }, [deviceType, deviceId]);

  // Calculate statistics
  const calculateStats = useCallback((dataArray) => {
    if (!dataArray || dataArray.length === 0) {
      return { average: 0, min: 0, max: 0, anomalyCount: 0 };
    }

    const getValue = (item) => {
      return item.value || item.weight || item.power || item.flow_rate || 0;
    };

    const values = dataArray.map(getValue);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const anomalyCount = dataArray.filter(item => item.is_anomaly).length;

    return {
      average: parseFloat(average.toFixed(2)),
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      anomalyCount
    };
  }, []);

  // Initialize data
  useEffect(() => {
    if (useSimulated) {
      const initialData = generateSimulatedData(50);
      setData(initialData);
      setCurrentReading(initialData[initialData.length - 1]);
      setStats(calculateStats(initialData));
      setLoading(false);
    } else {
      fetchRealData();
    }
  }, [useSimulated, generateSimulatedData, fetchRealData, calculateStats]);

  // Update data periodically
  useEffect(() => {
    if (!useSimulated) return;

    const interval = setInterval(() => {
      const newReading = generateSimulatedData(1)[0];
      
      setData(prevData => {
        const updatedData = [...prevData.slice(-49), newReading];
        setStats(calculateStats(updatedData));
        return updatedData;
      });
      
      setCurrentReading(newReading);
    }, 2000);

    return () => clearInterval(interval);
  }, [useSimulated, generateSimulatedData, calculateStats]);

  // Refresh data manually
  const refresh = useCallback(() => {
    if (useSimulated) {
      const newData = generateSimulatedData(50);
      setData(newData);
      setCurrentReading(newData[newData.length - 1]);
      setStats(calculateStats(newData));
    } else {
      fetchRealData();
    }
  }, [useSimulated, generateSimulatedData, fetchRealData, calculateStats]);

  // Add new reading manually
  const addReading = useCallback((reading) => {
    setData(prevData => {
      const updatedData = [...prevData.slice(-49), reading];
      setStats(calculateStats(updatedData));
      return updatedData;
    });
    setCurrentReading(reading);
  }, [calculateStats]);

  // Clear data
  const clearData = useCallback(() => {
    setData([]);
    setCurrentReading(null);
    setStats({ average: 0, min: 0, max: 0, anomalyCount: 0 });
  }, []);

  return {
    data,
    currentReading,
    loading,
    error,
    stats,
    refresh,
    addReading,
    clearData
  };
};

// Hook for fetching device list
export const useDeviceList = (deviceType = null) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = deviceType 
        ? `/devices?type=${deviceType}` 
        : '/devices';
      const response = await api.get(endpoint);
      setDevices(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
    }
  }, [deviceType]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return {
    devices,
    loading,
    error,
    refresh: fetchDevices
  };
};

// Hook for device health monitoring
export const useDeviceHealth = (deviceId) => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = useCallback(async () => {
    if (!deviceId) return;

    try {
      setLoading(true);
      const response = await api.get(`/devices/${deviceId}/health`);
      setHealth(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching device health:', err);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return {
    health,
    loading,
    error,
    refresh: fetchHealth
  };
};

// Hook for alerts
export const useAlerts = (deviceId = null) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = deviceId 
        ? `/alerts?device_id=${deviceId}` 
        : '/alerts';
      const response = await api.get(endpoint);
      setAlerts(response.data.alerts || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const resolveAlert = useCallback(async (alertId) => {
    try {
      await api.post(`/alerts/${alertId}/resolve`);
      fetchAlerts(); // Refresh alerts after resolving
    } catch (err) {
      console.error('Error resolving alert:', err);
      throw err;
    }
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    refresh: fetchAlerts,
    resolveAlert
  };
};
