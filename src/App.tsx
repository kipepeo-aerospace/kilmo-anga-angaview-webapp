import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import RegisterFarm from './pages/RegisterFarm';
import Gallery from './pages/Gallery';
import Process from './pages/Process';
import Profile from './pages/Profile';
import FarmDetails from './pages/FarmDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Navigation />
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/register-farm" element={
              <ProtectedRoute>
                <Navigation />
                <RegisterFarm />
              </ProtectedRoute>
            } />
            <Route path="/gallery" element={
              <ProtectedRoute>
                <Navigation />
                <Gallery />
              </ProtectedRoute>
            } />
            <Route path="/process" element={
              <ProtectedRoute>
                <Navigation />
                <Process />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Navigation />
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/farm/:farmId" element={
              <ProtectedRoute>
                <Navigation />
                <FarmDetails />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;