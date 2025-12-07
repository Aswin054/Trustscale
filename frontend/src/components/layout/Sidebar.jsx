import React from 'react';
import { Home, Fuel, AlertTriangle, FileText, Activity, Lock, Wrench, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, activeMenu, onMenuSelect }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'fuel-stations', label: 'Fuel Stations', icon: <Fuel className="w-5 h-5" /> },
    { id: 'tamper-alerts', label: 'Tamper Alerts', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'calibration', label: 'Calibration Logs', icon: <FileText className="w-5 h-5" /> },
    { id: 'device-health', label: 'Device Health', icon: <Activity className="w-5 h-5" /> },
    { id: 'blockchain', label: 'Blockchain Ledger', icon: <Lock className="w-5 h-5" /> },
    { id: 'technician', label: 'Technician Mode', icon: <Wrench className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white shadow-lg transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64 flex flex-col`}
      >
        {/* Close button for mobile */}
        <div className="lg:hidden flex justify-end p-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onMenuSelect(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeMenu === item.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © 2025 Tamper Detection System
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
