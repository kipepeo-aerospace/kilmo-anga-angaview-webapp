import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './components/AuthProvider';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import RegisterFarm from './pages/RegisterFarm';
import Gallery from './pages/Gallery';
import Process from './pages/Process';
import Profile from './pages/Profile';
import FarmDetails from './pages/FarmDetails';
import Farms from './pages/Farms';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <>
                <Navigation />
                <Dashboard />
              </>
            } />
            <Route path="/register-farm" element={
              <ProtectedRoute>
                <Navigation />
                <RegisterFarm />
              </ProtectedRoute>
            } />
            <Route path="/gallery" element={
              <>
                <Navigation />
                <Gallery />
              </>
            } />
            <Route path="/process" element={
              <ProtectedRoute>
                <Navigation />
                <Process />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <>
                <Navigation />
                <Profile />
              </>
            } />
            <Route path="/farm/:farmId" element={
              <>
                <Navigation />
                <FarmDetails />
              </>
            } />
            <Route path="/farms" element={
              <>
                <Navigation />
                <Farms />
              </>
            } />
          </Routes>
        </div>
    </AuthProvider>
  );
}

export default App;