import React from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose }) => {
  const icons = {
    success: <CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} />,
    error: <AlertCircle style={{ width: '1.25rem', height: '1.25rem' }} />,
    warning: <AlertTriangle style={{ width: '1.25rem', height: '1.25rem' }} />,
    info: <Info style={{ width: '1.25rem', height: '1.25rem' }} />
  };

  return (
    <div className={`alert alert-${type}`}>
      <div className="flex items-center gap-3">
        {icons[type]}
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="hover-bg-gray p-2 rounded">
          <X style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>
      )}
    </div>
  );
};

export default Alert;
