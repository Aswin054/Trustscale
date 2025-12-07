import React from 'react';
import { Menu, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

const Navbar = ({ onMenuClick, onRoleSwitch }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
            Tamper Detection System
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {onRoleSwitch && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRoleSwitch}
            className="hidden md:flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            {user?.role === 'admin' ? 'User View' : 'Admin View'}
          </Button>
        )}
        
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
          <User className="w-5 h-5 text-gray-600" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{user?.username}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
