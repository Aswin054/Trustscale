import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/common/Card';
import RealTimeChart from '../../components/charts/RealTimeChart';
import { DataSimulator } from '../../services/dataSimulator';
import { CHART_COLORS } from '../../utils/constants';
import { AlertTriangle, Activity, CheckCircle } from 'lucide-react';

const UserDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('home');
  const [fuelData, setFuelData] = useState([]);
  const [currentReading, setCurrentReading] = useState(null);

  useEffect(() => {
    const initialData = DataSimulator.generateFuelDispenserData(50);
    setFuelData(initialData);
    setCurrentReading(initialData[initialData.length - 1]);

    const interval = setInterval(() => {
      const newReading = DataSimulator.generateFuelDispenserData(1)[0];
      setFuelData(prev => [...prev.slice(-49), newReading]);
      setCurrentReading(newReading);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeMenu={activeMenu}
        onMenuSelect={setActiveMenu}
      />

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Fuel Dispenser Dashboard</h1>

          {/* Real-time Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card title="Real-time Fuel Flow Rate">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Flow:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {currentReading?.flow_rate || '0.00'} L/min
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Totalizer:</span>
                  <span className="text-xl font-bold text-green-600">
                    {currentReading?.totalizer || '0.00'} L
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Magnetic Tamper Status">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Field Level:</span>
                  <span className={`font-medium ${
                    currentReading?.magnetic_field > 1 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {currentReading?.magnetic_field > 1 ? 'HIGH' : 'LOW'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Alerts:</span>
                  <span className="text-green-600 font-medium">NONE</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Flow Chart */}
          <Card title="Flow Rate Trend" className="mb-6">
            <RealTimeChart
              data={fuelData.map(d => ({ ...d, value: d.flow_rate }))}
              label="Flow Rate (L/min)"
              color={CHART_COLORS.primary}
              yAxisLabel="Flow Rate (L/min)"
            />
          </Card>

          {/* Nozzle & Flow Meter Status */}
          <Card title="Nozzle & Flow Meter Status" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="text-gray-700">Pulse Count:</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-600">NORMAL</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="text-gray-700">Valve State:</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-600">OK</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="text-gray-700">Pressure:</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-600">NORMAL</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Nozzle State:</span>
                <span className="font-medium text-blue-600">
                  {currentReading?.nozzle_state?.toUpperCase() || 'CLOSED'}
                </span>
              </div>
            </div>
          </Card>

          {/* Tamper Event Feed */}
          <Card title="Tamper Event Feed">
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Voltage spike detected?</span>
                <span className="ml-auto font-medium text-green-600">NO</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Unauthorized access?</span>
                <span className="ml-auto font-medium text-green-600">NO</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Flow irregularity?</span>
                <span className="ml-auto font-medium text-green-600">NO</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
