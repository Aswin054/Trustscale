import React from 'react';
import { Activity, AlertCircle, Gauge, Zap, Fuel } from 'lucide-react';
import Card from '../common/Card';

const DeviceCard = ({ device, onClick }) => {
  const deviceIcons = {
    weighing_scale: <Gauge className="w-12 h-12 text-blue-600" />,
    energy_meter: <Zap className="w-12 h-12 text-yellow-600" />,
    fuel_dispenser: <Fuel className="w-12 h-12 text-green-600" />
  };

  const deviceNames = {
    weighing_scale: 'Weighing Scale',
    energy_meter: 'Energy Meter',
    fuel_dispenser: 'Fuel Dispenser'
  };

  return (
    <Card 
      className="hover:scale-105 transition-transform cursor-pointer" 
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-4 bg-gray-50 rounded-full">
          {deviceIcons[device.type]}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            {deviceNames[device.type]}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{device.description}</p>
        </div>
        {device.activeAlerts > 0 && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{device.activeAlerts} Active Alerts</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-green-600">
          <Activity className="w-5 h-5" />
          <span className="text-sm font-medium">Online</span>
        </div>
      </div>
    </Card>
  );
};

export default DeviceCard;
