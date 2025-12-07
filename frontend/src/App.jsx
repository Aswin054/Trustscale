import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import WeighingScale from './pages/admin/WeighingScale';
import EnergyMeter from './pages/admin/EnergyMeter';
import FuelDispenser from './pages/admin/FuelDispenser';
import UserDashboard from './pages/user/UserDashboard';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();
  const [viewMode, setViewMode] = useState('admin'); // admin or user

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'admin' ? 'user' : 'admin');
  };

  return (
    <BrowserRouter>
      {isAuthenticated && (
        <Navbar onRoleSwitch={toggleViewMode} />
      )}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {viewMode === 'admin' ? <AdminDashboard /> : <UserDashboard />}
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/weighing_scale"
          element={
            <PrivateRoute>
              <WeighingScale />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/energy_meter"
          element={
            <PrivateRoute>
              <EnergyMeter />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/fuel_dispenser"
          element={
            <PrivateRoute>
              <FuelDispenser />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
