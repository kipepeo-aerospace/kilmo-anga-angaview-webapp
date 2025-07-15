import React, { useState, useEffect } from 'react';
import { useMsal, useAccount } from "@azure/msal-react";
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { ImageFile, Farm } from '../types';
import ImageThumbnail from '../components/ImageThumbnail';
import ImagePreviewModal from '../components/ImagePreviewModal';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const Gallery: React.FC = () => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});


  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'raw' | 'mosaic' | 'indices'>('raw');
  const [selectedFarm, setSelectedFarm] = useState<string>('');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<ImageFile | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const tabs = [
    { id: 'raw', label: 'Raw Images', count: 0 },
    { id: 'mosaic', label: 'Mosaics', count: 0 },
    { id: 'indices', label: 'Index Maps', count: 0 }
  ];

  useEffect(() => {
    const fetchFarms = async () => {
      if (!account) return;

      try {
        const response = await instance.acquireTokenSilent({
          scopes: ["api://kipepeo.space/kilimoanga-api/read"],
          account
        });

        const token = response.accessToken;

        const [farmsData] = await Promise.all([
          apiService.getUserFarms(account.name ?? '', token),
        ]);

        setFarms(farmsData);

        // Set initial farm selection from URL param or first farm
        const farmParam = searchParams.get('farm');
        if (farmParam && farmsData.some(f => f.id === farmParam)) {
          setSelectedFarm(farmParam);
        } else if (farmsData.length > 0) {
          setSelectedFarm(farmsData[0].id);
        }
      } catch (error) {
        console.error('Error fetching farms:', error);
      }
    };

    fetchFarms();
  }, [account, searchParams]);


  useEffect(() => {
    const fetchImages = async () => {
      if (!account || !selectedFarm) return;

      setIsLoading(true);
      try {
        const response = await instance.acquireTokenSilent({
          scopes: ["api://kipepeo.space/kilimoanga-api/read"],
          account
        });

        const token = response.accessToken;

        const [imagesData] = await Promise.all([
          apiService.listFiles(
            account.name ?? '',
            selectedFarm,
            activeTab,
            token),
        ]);

        setImages(imagesData);


      } catch (error) {
        console.error('Error fetching images:', error);
        setToast({
          message: 'Failed to load images. Please try again.',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [account, selectedFarm, activeTab]);

  const handlePreview = (image: ImageFile) => {
    setPreviewImage(image);
  };

  const handleDownload = (image: ImageFile) => {
    // Mock download functionality
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.filename;
    link.click();

    setToast({
      message: `Downloaded ${image.filename}`,
      type: 'success'
    });
  };

  const getTabCounts = () => {
    return {
      raw: activeTab === 'raw' ? images.length : 0,
      mosaic: activeTab === 'mosaic' ? images.length : 0,
      indices: activeTab === 'indices' ? images.length : 0
    };
  };


  const tabCounts = getTabCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
          <p className="mt-2 text-gray-600">
            Browse and download your processed images
          </p>
        </div>

        {/* Farm Selection */}
        <div className="mb-6">
          <label htmlFor="farm-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Farm
          </label>
          <select
            id="farm-select"
            value={selectedFarm}
            onChange={(e) => setSelectedFarm(e.target.value)}
            className="block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select a farm...</option>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name} ({farm.id})
              </option>
            ))}
          </select>
        </div>

        {selectedFarm && (
          <>
            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'raw' | 'mosaic' | 'indices')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      {tab.label}
                      <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                        {tabCounts[tab.id as keyof typeof tabCounts]}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {activeTab} images found
                  </h3>
                  <p className="text-gray-600">
                    {activeTab === 'raw'
                      ? 'Upload some images to get started.'
                      : 'Process your raw images to generate these results.'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {images.map((image) => (
                    <ImageThumbnail
                      key={image.id}
                      image={image}
                      onPreview={handlePreview}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {previewImage && (
        <ImagePreviewModal
          image={previewImage}
          onClose={() => setPreviewImage(null)}
          onDownload={handleDownload}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Gallery;