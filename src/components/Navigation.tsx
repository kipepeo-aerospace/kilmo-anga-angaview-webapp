import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMsal, useAccount } from "@azure/msal-react";
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Upload,
  Image,
  Settings,
  User,
  LogOut,
  Sprout
} from 'lucide-react';

const Navigation: React.FC = () => {

  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const displayName = account?.name // unique name

  const logout = () => instance.logoutRedirect({
    postLogoutRedirectUri: window.location.origin
  });

  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/register-farm', label: 'Register Farm', icon: Upload },
    { path: '/process', label: 'Process', icon: Settings },
    { path: '/gallery', label: 'Gallery', icon: Image },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img src="/assets/kilimoanga_logo.png" className="h-8 w-8" alt="Kilimo Anga Logo" />
              <span className="text-xl font-bold text-gray-900">Anga View</span>
            </Link>
          </div>

          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(item.path)
                    ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Welcome, <span className="font-medium">{displayName}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex overflow-x-auto py-2 px-4 space-x-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors duration-200 ${isActive(item.path)
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;