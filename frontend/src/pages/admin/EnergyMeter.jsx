import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Activity, TrendingUp } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import RealTimeChart from '../../components/charts/RealTimeChart';
import StatusIndicator from '../../components/devices/StatusIndicator';
import { DataSimulator } from '../../services/dataSimulator';
import { CHART_COLORS } from '../../utils/constants';

const EnergyMeter = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [currentReading, setCurrentReading] = useState(null);

  useEffect(() => {
    const initialData = DataSimulator.generateEnergyMeterData(50);
    setData(initialData);
    setCurrentReading(initialData[initialData.length - 1]);

    const interval = setInterval(() => {
      const newReading = DataSimulator.generateEnergyMeterData(1)[0];
      setData(prev => [...prev.slice(-49), newReading]);
      setCurrentReading(newReading);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/dashboard')}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Energy Meter Monitor</h1>
        <StatusIndicator status="healthy" />
      </div>

      {/* Current Readings */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Voltage</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {currentReading?.voltage || '0.00'} V
              </p>
            </div>
            <Zap className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Current</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {currentReading?.current || '0.00'} A
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Power</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {currentReading?.power || '0.000'} kW
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-gray-600 text-sm">Status</p>
            <p className="text-xl font-bold text-green-600 mt-1">NORMAL</p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Voltage Monitoring">
          <RealTimeChart
            data={data.map(d => ({ ...d, value: d.voltage }))}
            label="Voltage (V)"
            color={CHART_COLORS.warning}
            yAxisLabel="Voltage (V)"
          />
        </Card>

        <Card title="Power Consumption">
          <RealTimeChart
            data={data.map(d => ({ ...d, value: d.power }))}
            label="Power (kW)"
            color={CHART_COLORS.success}
            yAxisLabel="Power (kW)"
          />
        </Card>
      </div>

      {/* Device Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Device Information">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Device ID:</span>
              <span className="font-medium">EM-2025-001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">Industrial Complex A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Installation Date:</span>
              <span className="font-medium">2025-01-15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rated Capacity:</span>
              <span className="font-medium">100A / 230V</span>
            </div>
          </div>
        </Card>

        <Card title="Tamper Detection Status">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Voltage Spike:</span>
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                NONE
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Meter Bypass:</span>
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                NOT DETECTED
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Firmware Integrity:</span>
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                VERIFIED
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Physical Tamper:</span>
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                NONE
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EnergyMeter;
