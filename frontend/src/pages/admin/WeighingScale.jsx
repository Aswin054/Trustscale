import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Activity, AlertTriangle, Zap } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import RealTimeChart from '../../components/charts/RealTimeChart';
import StatusIndicator from '../../components/devices/StatusIndicator';
import { DataSimulator } from '../../services/dataSimulator';
import { CHART_COLORS } from '../../utils/constants';

const WINDOW_SIZE = 60;          // number of points on chart
const TICK_MS = 700;            // update interval
const MAX_DRIFT_NORMAL = 2.0;   // thresholds to drive UI
const MAX_DRIFT_WARNING = 4.0;

const WeighingScale = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [currentReading, setCurrentReading] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState('healthy');
  const [tamperStatus, setTamperStatus] = useState({
    weightDrift: 'NORMAL',
    seal: 'INTACT',
    firmware: 'VERIFIED',
    access: 'NONE',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // keep smooth trend between ticks
  const baseWeightRef = useRef(100);
  const driftDirectionRef = useRef(1);

  useEffect(() => {
    // initial seed from existing simulator
    const initialData = DataSimulator.generateWeighingScaleData(WINDOW_SIZE).map(
      (d, idx) => ({
        ...d,
        // make sure each point has a timestamp index for RealTimeChart if needed
        index: idx,
      })
    );
    setData(initialData);
    const last = initialData[initialData.length - 1];
    setCurrentReading(last);
    baseWeightRef.current = last.weight || 100;

    const interval = setInterval(() => {
      setIsUpdating(true);
      setData(prev => {
        const lastPoint = prev[prev.length - 1] || last || { weight: 100, calibration_drift: 0 };
        // smooth trend: slowly move around a base, sometimes reverse direction
        const base = baseWeightRef.current;
        const direction = driftDirectionRef.current;

        // occasionally flip drift direction for "breathing" effect
        if (Math.random() < 0.08) {
          driftDirectionRef.current = -direction;
        }

        // target weight around base with small directional drift + noise
        const nextWeight =
          lastPoint.weight +
          direction * (Math.random() * 0.25) + // drift
          (Math.random() - 0.5) * 0.15;        // local noise

        // keep base around 100 but allow slow wandering
        baseWeightRef.current =
          base +
          (Math.random() - 0.5) * 0.05;

        // calibration drift reacts to recent movement
        const calibrationDrift = parseFloat(
          (Math.abs(nextWeight - baseWeightRef.current) * 0.15).toFixed(2)
        );

        const timestamp = Date.now();
        const next = {
          ...lastPoint,
          timestamp,
          index: (lastPoint.index || 0) + 1,
          weight: parseFloat(nextWeight.toFixed(2)),
          calibration_drift: calibrationDrift,
        };

        const updated = [...prev, next].slice(-WINDOW_SIZE);
        setCurrentReading(next);
        setLastUpdate(timestamp);
        updateStatuses(next); // derive UI state from reading
        
        // Reset update indicator after animation
        setTimeout(() => setIsUpdating(false), 200);
        
        return updated;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatuses = reading => {
    const drift = reading?.calibration_drift ?? 0;
    let overall = 'healthy';
    let weightDrift = 'NORMAL';

    if (drift > MAX_DRIFT_WARNING) {
      overall = 'critical';
      weightDrift = 'ALERT';
    } else if (drift > MAX_DRIFT_NORMAL) {
      overall = 'warning';
      weightDrift = 'DRIFTING';
    }

    setDeviceStatus(overall);
    setTamperStatus(prev => ({
      ...prev,
      weightDrift,
      // you can extend these with actual backend flags later
      seal: 'INTACT',
      firmware: 'VERIFIED',
      access: 'NONE',
    }));
  };

  const currentWeight = currentReading?.weight?.toFixed(2) || '0.00';
  const currentDrift = currentReading?.calibration_drift?.toFixed(2) || '0.00';
  const timeSinceUpdate = Math.floor((Date.now() - lastUpdate) / 1000);

  const statusText =
    deviceStatus === 'healthy'
      ? 'NORMAL'
      : deviceStatus === 'warning'
      ? 'WARNING'
      : 'ALERT';

  const statusColorClass =
    deviceStatus === 'healthy'
      ? 'text-green-600'
      : deviceStatus === 'warning'
      ? 'text-yellow-600'
      : 'text-red-600';

  const statusBgClass =
    deviceStatus === 'healthy'
      ? 'bg-green-50'
      : deviceStatus === 'warning'
      ? 'bg-yellow-50'
      : 'bg-red-50';

  const badgeClass = state => {
    if (state === 'ALERT') {
      return 'px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium animate-pulse';
    }
    if (state === 'DRIFTING') {
      return 'px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm font-medium';
    }
    return 'px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium';
  };

  const getStatusIcon = () => {
    if (deviceStatus === 'critical') return <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />;
    if (deviceStatus === 'warning') return <TrendingUp className="w-5 h-5 text-yellow-600" />;
    return <Zap className="w-5 h-5 text-green-600" />;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/dashboard')}
        className="mb-6 flex items-center gap-2 hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-800">
              Weighing Scale Monitor
            </h1>
            {isUpdating && (
              <span className="inline-flex h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
            )}
          </div>
          <p className="text-gray-500 text-sm">
            Real-time simulated measurements with responsive tamper indicators.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Last update: {timeSinceUpdate}s ago
          </p>
        </div>
        <StatusIndicator status={deviceStatus} />
      </div>

      {/* Current Reading */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium">Current Weight</p>
              <p className={`text-3xl font-bold text-blue-600 mt-1 transition-all duration-300 ${isUpdating ? 'scale-105' : 'scale-100'}`}>
                {currentWeight} kg
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <p className="text-xs text-gray-400">
                  Updates every {(TICK_MS / 1000).toFixed(1)}s
                </p>
              </div>
            </div>
            <Activity className={`w-10 h-10 text-blue-600 transition-transform duration-300 ${isUpdating ? 'scale-110' : 'scale-100'}`} />
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium">Calibration Drift</p>
              <p
                className={`text-3xl font-bold mt-1 transition-all duration-300 ${
                  deviceStatus === 'healthy'
                    ? 'text-green-600'
                    : deviceStatus === 'warning'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                } ${isUpdating ? 'scale-105' : 'scale-100'}`}
              >
                {currentDrift} kg
              </p>
              <p className="text-xs text-gray-400 mt-2">
                <span className="text-green-600">Normal: &lt;{MAX_DRIFT_NORMAL}</span>
                {' | '}
                <span className="text-yellow-600">Warning: &lt;{MAX_DRIFT_WARNING}</span>
              </p>
            </div>
            <TrendingUp className={`w-10 h-10 ${
              deviceStatus === 'healthy' ? 'text-green-600' :
              deviceStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
            } transition-all duration-300`} />
          </div>
        </Card>

        <Card className={`hover:shadow-lg transition-all duration-300 ${statusBgClass}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium">System Status</p>
              <div className="flex items-center gap-2 mt-1">
                <p
                  className={`text-2xl font-bold transition-all duration-300 ${statusColorClass}`}
                >
                  {statusText}
                </p>
                {getStatusIcon()}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                AI-powered tamper detection active
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Real-time Chart */}
      <Card title="Real-Time Weight Measurements" className="hover:shadow-lg transition-shadow duration-300">
        <RealTimeChart
          data={data.map(d => ({
            ...d,
            value: d.weight,
          }))}
          label="Weight (kg)"
          color={CHART_COLORS.primary}
          yAxisLabel="Weight (kg)"
        />
      </Card>

      {/* Device Info + Tamper */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card title="Device Information" className="hover:shadow-lg transition-shadow duration-300">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-600 font-medium">Device ID:</span>
              <span className="font-semibold text-gray-800">WS-2025-001</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-600 font-medium">Location:</span>
              <span className="font-semibold text-gray-800">Market Street Shop</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-600 font-medium">Last Calibration:</span>
              <span className="font-semibold text-gray-800">2025-12-01</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 font-medium">Next Calibration:</span>
              <span className="font-semibold text-green-600">2026-06-01</span>
            </div>
          </div>
        </Card>

        <Card title="Tamper Detection Status" className="hover:shadow-lg transition-shadow duration-300">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-600 font-medium">Weight Drift:</span>
              <span className={badgeClass(tamperStatus.weightDrift)}>
                {tamperStatus.weightDrift}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-600 font-medium">Seal Status:</span>
              <span className={badgeClass(tamperStatus.seal)}>
                {tamperStatus.seal}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-600 font-medium">Firmware:</span>
              <span className={badgeClass(tamperStatus.firmware)}>
                {tamperStatus.firmware}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium">Unauthorized Access:</span>
              <span className={badgeClass(tamperStatus.access)}>
                {tamperStatus.access}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WeighingScale;
