import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMsal, useAccount } from "@azure/msal-react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Image as ImageIcon,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Droplet,
  Leaf,
  Bug,
  FileText
} from 'lucide-react';
import { apiService } from '../services/api';
import { Farm, Analytics, Advisory, ImageFile } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ImagePreviewModal from '../components/ImagePreviewModal';

const FarmDetails: React.FC = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const { accounts, instance } = useMsal();
  const account = useAccount(accounts[0] || null);

  const clientId = account?.homeAccountId;
  const [farm, setFarm] = useState<Farm | null>(null);
  const [mosaicImages, setMosaicImages] = useState<ImageFile[]>([]);
  const [indicesImages, setIndicesImages] = useState<ImageFile[]>([]);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>('mosaic');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);

  useEffect(() => {
    const fetchFarmData = async () => {
      if (!account || !farmId) return;

      try {
        const response = await instance.acquireTokenSilent({
          scopes: ["api://kipepeo.space/kilimoanga-api/read"],
          account
        });

        const token = response.accessToken;

        const [farmData, mosaicData, indicesData, analyticsData, advisoriesData] = await Promise.all([
          apiService.getFarmDetails(clientId ?? '', farmId, token),
          apiService.listFiles(clientId ?? '', farmId, 'mosaic', token),
          apiService.listFiles(clientId ?? '', farmId, 'indices', token),
          apiService.getFarmAnalytics(farmId, token),
          apiService.getFarmAdvisories(farmId, token)
        ]);

        setFarm(farmData);
        setMosaicImages(mosaicData);
        setIndicesImages(indicesData);
        setAnalytics(analyticsData);
        setAdvisories(advisoriesData);
      } catch (error) {
        console.error("Error fetching farm data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmData();
  }, [account, farmId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Farm not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const availableIndices = ['mosaic', ...Array.from(new Set(indicesImages.map(img => {
    const match = img.filename.match(/_(NDVI|NDRE|GNDVI|EVI|SAVI|MSAVI)_/);
    return match ? match[1] : null;
  }).filter(Boolean)))];

  const getCurrentImage = () => {
    if (selectedIndex === 'mosaic') {
      return mosaicImages[0];
    }
    return indicesImages.find(img => img.filename.includes(`_${selectedIndex}_`));
  };

  const currentImage = getCurrentImage();

  const getAdvisoryIcon = (type: string) => {
    switch (type) {
      case 'irrigation':
        return Droplet;
      case 'fertilization':
        return Leaf;
      case 'pest_control':
        return Bug;
      default:
        return FileText;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{farm.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>Farm ID: {farm.id}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(farm.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ImageIcon className="h-4 w-4" />
                  <span>{farm.imageCount} images</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Farm Imagery</h2>

              <div className="flex flex-wrap gap-2 mb-4">
                {availableIndices.map((index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      selectedIndex === index
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index.toUpperCase()}
                  </button>
                ))}
              </div>

              {currentImage ? (
                <div
                  className="relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                  style={{ paddingBottom: '66.67%' }}
                  onClick={() => setSelectedImage(currentImage)}
                >
                  <img
                    src={currentImage.url}
                    alt={`${selectedIndex} view`}
                    className="absolute inset-0 w-full h-full object-contain group-hover:opacity-90 transition-opacity duration-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                      Click to enlarge
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-12 text-center">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No {selectedIndex} image available</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics</h2>
              {analytics.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No analytics data available yet</p>
                  <p className="text-gray-500 text-xs mt-1">Process images to generate analytics</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.slice(0, 1).map((analytic) => (
                    <div key={analytic.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Health Score</span>
                        <span className="text-2xl font-bold text-green-600">{analytic.healthScore}%</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">NDVI Average</span>
                          <span className="font-semibold">{analytic.ndviAverage.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">NDVI Range</span>
                          <span className="font-semibold">{analytic.ndviMin.toFixed(2)} - {analytic.ndviMax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Healthy Areas</span>
                          <span className="font-semibold text-green-600">{analytic.healthyAreas}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Stress Areas</span>
                          <span className="font-semibold text-red-600">{analytic.stressAreas}%</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 pt-2 border-t">
                        Last analysis: {new Date(analytic.analysisDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Farm Advisories</h2>
          {advisories.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">No advisories available yet</p>
              <p className="text-gray-500 text-xs mt-1">
                Your pipeline will generate advisories after processing images and analytics
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {advisories.map((advisory) => {
                const Icon = getAdvisoryIcon(advisory.advisoryType);
                return (
                  <div
                    key={advisory.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <Icon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{advisory.title}</h3>
                          <p className="text-sm text-gray-500 capitalize">
                            {advisory.advisoryType.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(advisory.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(advisory.priority)}`}>
                          {advisory.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">{advisory.description}</p>
                    {advisory.actionItems.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Action Items:</p>
                        <ul className="space-y-1">
                          {advisory.actionItems.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                              <span className="text-green-600 mr-2">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-3">
                      Created {new Date(advisory.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedImage && (
        <ImagePreviewModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default FarmDetails;
