import React, { useState, useEffect } from 'react';
import { useMsal, useAccount } from "@azure/msal-react";
import { Link } from 'react-router-dom';
import { Image, Calendar, MapPin } from 'lucide-react';
import { apiService } from '../services/api';
import { Farm } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const Farms: React.FC = () => {
  const { accounts, instance } = useMsal();
  const account = useAccount(accounts[0] || null);

  const clientId = account?.homeAccountId;
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mosaicImages, setMosaicImages] = useState<{ [farmId: string]: string }>({});

  useEffect(() => {
    const fetchFarms = async () => {
      if (!account) return;

      try {
        const response = await instance.acquireTokenSilent({
          scopes: ["api://kipepeo.space/kilimoanga-api/read"],
          account
        });

        const token = response.accessToken;
        const farmsData = await apiService.getUserFarms(clientId ?? '', token);
        setFarms(farmsData);

        const imageMap: { [farmId: string]: string } = {};
        for (const farm of farmsData) {
          const images = await apiService.listFiles(clientId ?? '', farm.id, 'mosaic', token);
          if (images.length > 0) {
            imageMap[farm.id] = images[0].url;
          }
        }
        setMosaicImages(imageMap);
      } catch (error) {
        console.error("Error fetching farms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarms();
  }, [account]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Farms</h1>
            <Link
                to="/register-farm"
                className="text-lg text-green-600 hover:text-green-700 font-medium"
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
              Register Farm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm) => (
              <div key={farm.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-4">
                  {mosaicImages[farm.id] ? (
                    <img
                      src={mosaicImages[farm.id]}
                      alt={`Mosaic for ${farm.name}`}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-md text-gray-500">
                      No mosaic image available
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mb-2">
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
                <div className="mt-4">
                  <Link
                    to={`/farm/${farm.id}`}
                    className="block text-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Farms;
