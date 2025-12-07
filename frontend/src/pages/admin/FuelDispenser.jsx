import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Box } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import RealTimeChart from '../../components/charts/RealTimeChart';
import StatusIndicator from '../../components/devices/StatusIndicator';
import FuelDispenser3D from '../../components/devices/FuelDispenser3D';
import { useDeviceData } from '../../hooks/useDeviceData';
import { CHART_COLORS } from '../../utils/constants';

const FuelDispenser = () => {
  const navigate = useNavigate();
  const [show3D, setShow3D] = useState(false);
  
  const { data, currentReading, stats } = useDeviceData('fuel_dispenser', null, true);

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

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Fuel Dispenser Monitor</h1>
          <StatusIndicator status="healthy" />
        </div>
        <Button
          variant="primary"
          onClick={() => setShow3D(true)}
          className="flex items-center gap-2"
        >
          <Box className="w-5 h-5" />
          3D Working Model
        </Button>
      </div>

      {/* 3D Modal */}
      <FuelDispenser3D isOpen={show3D} onClose={() => setShow3D(false)} />

      {/* Current Readings */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <div>
            <p className="text-gray-600 text-sm">Flow Rate</p>
            <p className="text-xl md:text-2xl font-bold text-blue-600 mt-1">
              {currentReading?.flow_rate || '0.00'} L/min
            </p>
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-gray-600 text-sm">Totalizer</p>
            <p className="text-xl md:text-2xl font-bold text-green-600 mt-1">
              {currentReading?.totalizer || '0.00'} L
            </p>
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-gray-600 text-sm">Pulse Count</p>
            <p className="text-xl md:text-2xl font-bold text-purple-600 mt-1">
              {currentReading?.pulse_count || '0'}
            </p>
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-gray-600 text-sm">Magnetic Field</p>
            <p className="text-xl md:text-2xl font-bold text-yellow-600 mt-1">
              {currentReading?.magnetic_field || '0.00'} T
            </p>
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-gray-600 text-sm">Pressure</p>
            <p className="text-xl md:text-2xl font-bold text-red-600 mt-1">
              {currentReading?.pressure || '0.00'} bar
            </p>
          </div>
        </Card>
      </div>

      {/* Real-time Chart */}
      <Card title="Real-Time Flow Rate" className="mb-6">
        <RealTimeChart
          data={data.map(d => ({ ...d, value: d.flow_rate }))}
          label="Flow Rate (L/min)"
          color={CHART_COLORS.primary}
          yAxisLabel="Flow Rate (L/min)"
        />
      </Card>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card title="Nozzle & Flow Meter Status">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pulse Count:</span>
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                NORMAL
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Valve State:</span>
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                OK
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pressure:</span>
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                NORMAL
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Nozzle State:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                {currentReading?.nozzle_state?.toUpperCase() || 'CLOSED'}
              </span>
            </div>
          </div>
        </Card>

        <Card title="Magnetic Tamper Status">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Field Level:</span>
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                {currentReading?.magnetic_field > 1 ? 'HIGH' : 'LOW'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Alerts:</span>
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                NONE
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Reading:</span>
              <span className="font-medium">{currentReading?.magnetic_field || '0.00'} T</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Tamper Event Feed */}
      <Card title="Tamper Event Feed">
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm">Voltage spike detected?</span>
            <span className="font-medium text-green-600">NO</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm">Unauthorized access?</span>
            <span className="font-medium text-green-600">NO</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm">Flow irregularity?</span>
            <span className="font-medium text-green-600">NO</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm">Magnetic interference?</span>
            <span className="font-medium text-green-600">NO</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FuelDispenser;
