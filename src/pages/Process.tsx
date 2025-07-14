import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { Farm, ProcessingJob } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { Play, Clock, CheckCircle, XCircle } from 'lucide-react';

const Process: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedFarm, setSelectedFarm] = useState<string>('');
  const [selectedIndices, setSelectedIndices] = useState<string[]>(['vari']);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const availableIndices = [
    { id: 'vari', name: 'VARI (Visible Atmospherically Resistant Index)', description: 'Measures vegetation greenness' },
    { id: 'ndvi', name: 'NDVI (Normalized Difference Vegetation Index)', description: 'Vegetation health indicator' },
    { id: 'gndvi', name: 'GNDVI (Green NDVI)', description: 'Green vegetation index' },
    { id: 'savi', name: 'SAVI (Soil Adjusted Vegetation Index)', description: 'Minimizes soil background effects' }
  ];

  useEffect(() => {
    const fetchFarms = async () => {
      if (!user) return;
      
      try {
        const farmsData = await apiService.getUserFarms(user.clientId);
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
  }, [user, searchParams]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isProcessing && user && selectedFarm) {
      interval = setInterval(async () => {
        try {
          const status = await apiService.checkStatus(user.clientId, selectedFarm);
          if (status) {
            setCurrentJob(status);
            if (status.status === 'completed') {
              setIsProcessing(false);
              setToast({
                message: 'Processing completed successfully!',
                type: 'success'
              });
            } else if (status.status === 'failed') {
              setIsProcessing(false);
              setToast({
                message: 'Processing failed. Please try again.',
                type: 'error'
              });
            }
          }
        } catch (error) {
          console.error('Error checking status:', error);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, user, selectedFarm]);

  const handleIndicesChange = (indexId: string) => {
    setSelectedIndices(prev => 
      prev.includes(indexId) 
        ? prev.filter(id => id !== indexId)
        : [...prev, indexId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedFarm) return;
    
    if (selectedIndices.length === 0) {
      setToast({
        message: 'Please select at least one index to compute.',
        type: 'warning'
      });
      return;
    }

    setIsProcessing(true);
    setCurrentJob(null);

    try {
      const job = await apiService.processIndices(user.clientId, selectedFarm, selectedIndices);
      setCurrentJob(job);
      setToast({
        message: 'Processing started! You will be notified when complete.',
        type: 'success'
      });
    } catch (error) {
      setIsProcessing(false);
      setToast({
        message: 'Failed to start processing. Please try again.',
        type: 'error'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <LoadingSpinner size="sm" className="h-5 w-5" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Process Images</h1>
          <p className="mt-2 text-gray-600">
            Generate vegetation indices and analytics from your aerial images
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Farm Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Farm</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="farm-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Choose the farm to process
                </label>
                <select
                  id="farm-select"
                  value={selectedFarm}
                  onChange={(e) => setSelectedFarm(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select a farm...</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name} ({farm.id}) - {farm.imageCount} images
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Index Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Indices</h2>
            <div className="space-y-4">
              {availableIndices.map((index) => (
                <div key={index.id} className="flex items-start space-x-3">
                  <div className="flex items-center h-5">
                    <input
                      id={index.id}
                      type="checkbox"
                      checked={selectedIndices.includes(index.id)}
                      onChange={() => handleIndicesChange(index.id)}
                      className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label htmlFor={index.id} className="text-sm font-medium text-gray-900 cursor-pointer">
                      {index.name}
                    </label>
                    <p className="text-sm text-gray-500">{index.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <button
              type="submit"
              disabled={isProcessing || !selectedFarm}
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Processing
                </>
              )}
            </button>
          </div>
        </form>

        {/* Processing Status */}
        {currentJob && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Processing Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(currentJob.status)}
                  <span className="text-sm font-medium text-gray-900">
                    {getStatusText(currentJob.status)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {currentJob.progress}% complete
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentJob.progress}%` }}
                />
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Farm:</strong> {selectedFarm}</p>
                <p><strong>Indices:</strong> {currentJob.indices.join(', ').toUpperCase()}</p>
                <p><strong>Started:</strong> {new Date(currentJob.startTime).toLocaleString()}</p>
                {currentJob.endTime && (
                  <p><strong>Completed:</strong> {new Date(currentJob.endTime).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

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

export default Process;