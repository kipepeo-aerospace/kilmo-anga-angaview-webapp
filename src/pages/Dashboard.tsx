import React, { useState, useEffect } from 'react';
import { useMsal, useAccount } from "@azure/msal-react";
import { Link } from 'react-router-dom';
import {
  Upload,
  Image,
  Settings,
  BarChart3,
  Calendar,
  MapPin,
  TrendingUp,
  Activity
} from 'lucide-react';
import { apiService } from '../services/api';
import { Farm, UserProfile } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { accounts, instance } = useMsal();
  const account = useAccount(accounts[0] || null);

  const clientId = account?.homeAccountId; // unique identifier for every user
  const email = account?.username // email
  const displayName = account?.name // unique name

  const [farms, setFarms] = useState<Farm[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!account) return;

      try {
        const response = await instance.acquireTokenSilent({
          scopes: ["api://kipepeo.space/kilimoanga-api/read"],
          account
        });

        const token = response.accessToken;

        const [profileData, farmsData] = await Promise.all([
          apiService.getUserProfile(clientId ?? '', email ?? "", displayName ?? "", token),
          apiService.getUserFarms(clientId ?? '', token)
        ]);

        setFarms(farmsData);
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }

    };

    fetchDashboardData();
  }, [account]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Register New Farm',
      description: 'Add a new farm and upload aerial images',
      icon: Upload,
      link: '/register-farm',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'View Gallery',
      description: 'Browse your uploaded images and results',
      icon: Image,
      link: '/gallery',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Process Images',
      description: 'Generate indices and analytics',
      icon: Settings,
      link: '/process',
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  const stats = [
    {
      title: 'Total Farms',
      value: profile?.farmsCount || 0,
      icon: MapPin,
      color: 'text-green-600'
    },
    {
      title: 'Images Uploaded',
      value: profile?.imagesCount || 0,
      icon: Image,
      color: 'text-blue-600'
    },
    {
      title: 'Processing Jobs',
      value: profile?.totalProcessingJobs || 0,
      icon: Activity,
      color: 'text-purple-600'
    },
    {
      title: 'Days Active',
      value: profile ? Math.ceil((Date.now() - new Date(profile.signupDate).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {displayName}
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your farms and process drone imagery with ease
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.link}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Farms */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Farms</h2>
            <Link
              to="/register-farm"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Register new farm →
            </Link>
          </div>

          {farms.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No farms registered yet</h3>
              <p className="text-gray-600 mb-4">
                Get started by registering your first farm and uploading aerial images
              </p>
              <Link
                to="/register-farm"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                Register Farm
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farms.map((farm) => (
                <div key={farm.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{farm.name}</h3>
                    <span className="text-sm text-gray-500">ID: {farm.id}</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Image className="h-4 w-4" />
                      <span>{farm.imageCount} images</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Created {new Date(farm.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Link
                      to={`/farm/${farm.id}`}
                      className="flex-1 text-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/gallery?farm=${farm.id}`}
                      className="flex-1 text-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                    >
                      Gallery
                    </Link>
                    <Link
                      to={`/process?farm=${farm.id}`}
                      className="flex-1 text-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                    >
                      Process
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;