export interface User {
  clientId: string;
  displayName: string;
  email: string;
  signupDate: string;
}

export interface Farm {
  id: string;
  clientId: string;
  name: string;
  createdAt: string;
  imageCount: number;
}

export interface ImageFile {
  id: string;
  filename: string;
  farmId: string,
  clientId: string,
  url: string;
  type: 'raw' | 'mosaic' | 'indices';
  uploadDate: string;
  size: number;
}

export interface ProcessingJob {
  id: string;
  clientId: string;
  farmId: string;
  indices: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
}

export interface UserProfile {
  clientId: string;
  email: string;
  signupDate: string;
  farmsCount: number;
  imagesCount: number;
  totalProcessingJobs: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (clientId: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface FarmDetails extends Farm {
  location?: string;
  area?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface IndicesImage {
  id: string;
  farmId: string;
  indexType: string;
  url: string;
  createdAt: string;
}

export interface Analytics {
  id: string;
  farmId: string;
  analysisDate: string;
  ndviAverage: number;
  ndviMin: number;
  ndviMax: number;
  healthScore: number;
  stressAreas: number;
  healthyAreas: number;
  metadata?: Record<string, any>;
}

export interface Advisory {
  id: string;
  farmId: string;
  createdAt: string;
  advisoryType: 'irrigation' | 'fertilization' | 'pest_control' | 'general';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionItems: string[];
  status: 'pending' | 'in_progress' | 'completed';
}