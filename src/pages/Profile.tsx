import React, { useState, useEffect } from 'react';
import { useMsal, useAccount } from "@azure/msal-react";
import { apiService } from '../services/api';
import { UserProfile } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Mail, Calendar, MapPin, Image, Activity } from 'lucide-react';

const Profile: React.FC = () => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const clientId = account?.homeAccountId; // unique identifier for every user
  const email = account?.username // email
  const displayName = account?.name // unique name

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!account) return;

      try {
        const response = await instance.acquireTokenSilent({
          scopes: ["api://kipepeo.space/kilimoanga-api/read"],
          account: account
        });

        const token = response.accessToken;
        const profileData = await apiService.getUserProfile(clientId ?? '', email ?? "", displayName ?? "", token);
        setProfile(profileData);


      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [account]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Profile not found</h2>
          <p className="text-gray-600">Unable to load profile information.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Registered Farms',
      value: profile.farmsCount,
      icon: MapPin,
      color: 'text-green-600'
    },
    {
      label: 'Uploaded Images',
      value: profile.imagesCount,
      icon: Image,
      color: 'text-blue-600'
    },
    {
      label: 'Processing Jobs',
      value: profile.totalProcessingJobs,
      icon: Activity,
      color: 'text-purple-600'
    },
    {
      label: 'Days Active',
      value: Math.floor((Date.now() - new Date(profile.signupDate).getTime()) / (1000 * 60 * 60 * 24)),
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">
            View and manage your account information
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Display Name</p>
                  <p className="text-lg font-medium text-gray-900">{account?.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg font-medium text-gray-900">{account?.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(profile.signupDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-900">Account created</span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(profile.signupDate).toLocaleDateString()}
                </span>
              </div>

              {profile.farmsCount > 0 && (
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">First farm registered</span>
                  </div>
                  <span className="text-sm text-gray-500">Recently</span>
                </div>
              )}

              {profile.imagesCount > 0 && (
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Images uploaded</span>
                  </div>
                  <span className="text-sm text-gray-500">Recently</span>
                </div>
              )}

              {profile.totalProcessingJobs > 0 && (
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Processing jobs completed</span>
                  </div>
                  <span className="text-sm text-gray-500">Recently</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;