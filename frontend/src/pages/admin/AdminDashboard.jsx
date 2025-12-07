import React from 'react';
import { useNavigate } from 'react-router-dom';
import DeviceCard from '../../components/devices/DeviceCard';
import { DEVICE_TYPES } from '../../utils/constants';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const devices = [
    {
      type: DEVICE_TYPES.WEIGHING_SCALE,
      description: 'Monitor weight measurements and detect calibration drift',
      activeAlerts: 0
    },
    {
      type: DEVICE_TYPES.ENERGY_METER,
      description: 'Track voltage, current and detect power anomalies',
      activeAlerts: 0
    },
    {
      type: DEVICE_TYPES.FUEL_DISPENSER,
      description: 'Monitor fuel flow and magnetic tampering',
      activeAlerts: 0
    }
  ];

  const handleDeviceClick = (deviceType) => {
    navigate(`/dashboard/${deviceType}`);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor and manage all metrology devices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <DeviceCard
            key={device.type}
            device={device}
            onClick={() => handleDeviceClick(device.type)}
          />
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Devices</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">12</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Active Alerts</p>
          <p className="text-3xl font-bold text-red-600 mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Devices Online</p>
          <p className="text-3xl font-bold text-green-600 mt-2">12</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">System Health</p>
          <p className="text-3xl font-bold text-green-600 mt-2">98%</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
