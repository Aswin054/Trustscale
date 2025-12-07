import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { REFRESH_INTERVAL } from '../utils/constants';

export const useRealTimeData = (endpoint, interval = REFRESH_INTERVAL) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get(endpoint);
      setData(response.data.data || response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, interval);
    return () => clearInterval(intervalId);
  }, [fetchData, interval]);

  return { data, loading, error, refetch: fetchData };
};
