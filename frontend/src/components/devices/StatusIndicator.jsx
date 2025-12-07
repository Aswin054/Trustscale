import React from 'react';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';

const StatusIndicator = ({ status, label }) => {
  const statusConfig = {
    healthy: {
      color: 'text-green-600',
      bg: 'bg-green-100',
      icon: <CheckCircle className="w-5 h-5" />,
      text: 'Healthy'
    },
    warning: {
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      icon: <AlertCircle className="w-5 h-5" />,
      text: 'Warning'
    },
    critical: {
      color: 'text-red-600',
      bg: 'bg-red-100',
      icon: <AlertCircle className="w-5 h-5" />,
      text: 'Critical'
    },
    active: {
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      icon: <Activity className="w-5 h-5" />,
      text: 'Active'
    }
  };

  const config = statusConfig[status] || statusConfig.active;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} ${config.color}`}>
      {config.icon}
      <span className="font-medium text-sm">{label || config.text}</span>
    </div>
  );
};

export default StatusIndicator;
