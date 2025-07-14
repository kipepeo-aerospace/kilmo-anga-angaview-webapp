import axios from 'axios';
import { ImageFile, ProcessingJob, UserProfile, Farm } from '../types';

const API_BASE_URL = '/api'; // This would be your actual API URL

// Mock data for development
const mockRawImages: ImageFile[] = [
  {
    id: '1',
    filename: 'drone_field_001.jpg',
    url: 'https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'raw',
    uploadDate: '2024-01-20',
    size: 2.5
  },
  {
    id: '2',
    filename: 'drone_field_002.jpg',
    url: 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'raw',
    uploadDate: '2024-01-20',
    size: 3.1
  },
  {
    id: '3',
    filename: 'drone_field_003.jpg',
    url: 'https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'raw',
    uploadDate: '2024-01-21',
    size: 2.8
  }
];

const mockMosaics: ImageFile[] = [
  {
    id: '4',
    filename: 'mosaic_farm001.jpg',
    url: 'https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'mosaic',
    uploadDate: '2024-01-22',
    size: 8.2
  }
];

const mockIndices: ImageFile[] = [
  {
    id: '5',
    filename: 'vari_farm001.jpg',
    url: 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'indices',
    uploadDate: '2024-01-22',
    size: 4.5
  }
];

export const apiService = {
  // Upload files
  uploadFiles: async (clientId: string, farmId: string, files: FileList): Promise<boolean> => {
    // Mock upload with progress
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Uploading files:', { clientId, farmId, files: Array.from(files) });
    return true;
  },

  // List files
  listFiles: async (clientId: string, farmId: string, type: 'raw' | 'mosaic' | 'indices'): Promise<ImageFile[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    switch (type) {
      case 'raw':
        return mockRawImages;
      case 'mosaic':
        return mockMosaics;
      case 'indices':
        return mockIndices;
      default:
        return [];
    }
  },

  // Process indices
  processIndices: async (clientId: string, farmId: string, indices: string[]): Promise<ProcessingJob> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const job: ProcessingJob = {
      id: 'job_' + Date.now(),
      clientId,
      farmId,
      indices,
      status: 'processing',
      progress: 0,
      startTime: new Date().toISOString()
    };
    
    return job;
  },

  // Check processing status
  checkStatus: async (clientId: string, farmId: string): Promise<ProcessingJob | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock progressive status updates
    const progress = Math.min(100, Math.floor(Math.random() * 100));
    const status = progress === 100 ? 'completed' : 'processing';
    
    return {
      id: 'job_current',
      clientId,
      farmId,
      indices: ['vari'],
      status,
      progress,
      startTime: new Date().toISOString(),
      endTime: status === 'completed' ? new Date().toISOString() : undefined
    };
  },

  // Get user profile
  getUserProfile: async (clientId: string): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      clientId,
      email: 'farmer@example.com',
      signupDate: '2024-01-15',
      farmsCount: 3,
      imagesCount: 15,
      totalProcessingJobs: 8
    };
  },

  // Get user farms
  getUserFarms: async (clientId: string): Promise<Farm[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
      {
        id: 'farm001',
        clientId,
        name: 'North Field',
        createdAt: '2024-01-20',
        imageCount: 12
      },
      {
        id: 'farm002',
        clientId,
        name: 'South Field',
        createdAt: '2024-01-22',
        imageCount: 8
      },
      {
        id: 'farm003',
        clientId,
        name: 'West Field',
        createdAt: '2024-01-25',
        imageCount: 6
      }
    ];
  }
};